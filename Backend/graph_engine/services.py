
from datetime import datetime
from bson import ObjectId

from services.mongodb import get_database
from accounts.services import get_user_organization_scope


NODE_COLLECTIONS = {
    "identity": "identities",
    "application": "applications",
    "group": "groups",
    "role": "roles",
    "permission": "permissions",
    "resource": "resources",
}

NODE_ORDER = [
    "identity",
    "group",
    "role",
    "permission",
    "application",
    "resource",
]

NODE_X_POSITIONS = {
    "identity": 0,
    "group": 280,
    "role": 560,
    "permission": 840,
    "application": 1120,
    "resource": 1400,
}

DISPLAY_FIELDS = [
    "display_name",
    "name",
    "full_name",
    "title",
    "email",
    "username",
]


def _normalize_id(value):
    """Convert ObjectId or string IDs into a consistent string."""
    if isinstance(value, ObjectId):
        return str(value)

    return str(value) if value is not None else None


def _mongo_id_values(value):
    """Return ObjectId and string variants for MongoDB ID lookups."""
    value = _normalize_id(value)

    if not value:
        return []

    values = [value]

    if ObjectId.is_valid(value):
        values.append(ObjectId(value))

    return values


def _node_id(node_type, document_id):
    return f"{node_type}_{_normalize_id(document_id)}"


def _get_label(document):
    for field in DISPLAY_FIELDS:
        value = document.get(field)

        if value:
            return str(value)

    return str(document.get("_id", "Unknown"))


def _serialize_value(value):
    if isinstance(value, ObjectId):
        return str(value)

    if isinstance(value, datetime):
        return value.isoformat()

    return value


def _build_node(node_type, document, index):
    organization_id = document.get("organization_id")

    data = {
        "label": _get_label(document),
        "entity_type": node_type,
        "organization_id": _normalize_id(organization_id),
    }

    # Include useful display information without exposing the full document.
    for field in (
        "email",
        "username",
        "status",
        "description",
        "application_type",
        "risk_score",
        "type",
    ):
        if field in document:
            data[field] = _serialize_value(document[field])

    return {
        "id": _node_id(node_type, document["_id"]),
        "type": node_type,
        "position": {
            "x": NODE_X_POSITIONS[node_type],
            "y": index * 140,
        },
        "data": data,
    }


def _get_organization_query(scope, organization_id=None):
    """
    Build the organization filter.

    Super Admin can access all organizations or select one.
    Other users are restricted to their active memberships.
    """
    if scope["is_super_admin"]:
        if organization_id:
            if not ObjectId.is_valid(str(organization_id)):
                raise ValueError("Invalid organization ID.")

            return {
                "organization_id": ObjectId(str(organization_id))
            }

        return {}

    if organization_id:
        if not ObjectId.is_valid(str(organization_id)):
            raise ValueError("Invalid organization ID.")

        selected_id = ObjectId(str(organization_id))

        if selected_id not in scope["organization_ids"]:
            raise PermissionError(
                "You do not have access to this organization."
            )

        return {"organization_id": selected_id}

    return {
        "organization_id": {
            "$in": scope["organization_ids"]
        }
    }


def _load_relationships(db, organization_query):
    query = {
        **organization_query,
        "is_deleted": {"$ne": True},
    }

    return list(db.access_relationships.find(query))



def _load_node_documents(
    db,
    node_type,
    collection_name,
    organization_query,
    relationships,
):
    """
    Load organization-owned nodes.

    Roles and permissions may also be global reference documents.
    Only globally defined documents can be loaded as fallback.
    """
    collection = db[collection_name]

    query = {
        **organization_query,
        "is_deleted": {"$ne": True},
    }

    documents = list(collection.find(query))

    if node_type not in ("role", "permission"):
        return documents

    referenced_ids = set()

    for relationship in relationships:
        for field in ("source", "target"):
            if relationship.get(f"{field}_type") == node_type:
                reference_id = _normalize_id(
                    relationship.get(f"{field}_id")
                )

                if reference_id:
                    referenced_ids.add(reference_id)

    existing_ids = {
        _normalize_id(document["_id"])
        for document in documents
    }

    missing_ids = referenced_ids - existing_ids

    if missing_ids:
        lookup_values = []

        for reference_id in missing_ids:
            lookup_values.extend(_mongo_id_values(reference_id))

        global_documents = collection.find({
            "_id": {"$in": lookup_values},
            "is_deleted": {"$ne": True},
            "$or": [
                {"organization_id": {"$exists": False}},
                {"organization_id": None},
            ],
        })

        documents.extend(list(global_documents))

    return documents



def _build_edges(relationships, valid_nodes):
    edges = []

    for relationship in relationships:
        source_type = str(
            relationship.get("source_type", "")
        ).lower()

        target_type = str(
            relationship.get("target_type", "")
        ).lower()

        source_id = relationship.get("source_id")
        target_id = relationship.get("target_id")

        if source_type not in NODE_COLLECTIONS:
            continue

        if target_type not in NODE_COLLECTIONS:
            continue

        source_node = _node_id(source_type, source_id)
        target_node = _node_id(target_type, target_id)

        # Never expose edges to nodes outside the authorized graph.
        if source_node not in valid_nodes:
            continue

        if target_node not in valid_nodes:
            continue

        relationship_id = _normalize_id(
            relationship.get("_id")
        )

        edges.append({
            "id": f"edge_{relationship_id}",
            "source": source_node,
            "target": target_node,
            "label": relationship.get(
                "relationship_type",
                "CONNECTED_TO",
            ),
            "type": "smoothstep",
        })

    return edges


def get_access_graph(user_id, organization_id=None):
    """
    Build an organization-scoped React Flow graph.

    Returns:
        {
            "nodes": [...],
            "edges": [...],
            "metadata": {...}
        }
    """
    scope = get_user_organization_scope(str(user_id))

    organization_query = _get_organization_query(
        scope,
        organization_id,
    )

    db = get_database()

    relationships = _load_relationships(
        db,
        organization_query,
    )

    nodes = []
    valid_nodes = set()

    for node_type in NODE_ORDER:
        collection_name = NODE_COLLECTIONS[node_type]

        documents = _load_node_documents(
            db,
            node_type,
            collection_name,
            organization_query,
            relationships,
        )

        for index, document in enumerate(documents):
            if "_id" not in document:
                continue

            node = _build_node(
                node_type,
                document,
                index,
            )

            nodes.append(node)
            valid_nodes.add(node["id"])

    edges = _build_edges(
        relationships,
        valid_nodes,
    )

    return {
        "nodes": nodes,
        "edges": edges,
        "metadata": {
            "total_nodes": len(nodes),
            "total_edges": len(edges),
        },
    }
