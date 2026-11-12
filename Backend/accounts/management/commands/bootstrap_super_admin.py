
from datetime import datetime, timezone

from django.core.management.base import BaseCommand, CommandError
from pymongo.errors import DuplicateKeyError, PyMongoError

from services.mongodb import get_database


class Command(BaseCommand):
    help = "Bootstrap the first global PhantomTrace Super Admin."

    def add_arguments(self, parser):
        parser.add_argument(
            "--email",
            type=str,
            help="Email address of the existing account to promote."
        )

    def handle(self, *args, **options):
        try:
            db = get_database()
            assignments = db.platform_role_assignments

            email = options.get("email")

            if not email:
                email = input("Enter the existing account email: ")

            email = email.strip().lower()

            if not email:
                raise CommandError("Email address cannot be empty.")

            user = db.users.find_one({
                "email": email,
                "is_active": True
            })

            if not user:
                raise CommandError(
                    "No active account found with that email address."
                )

            role = db.roles.find_one({
                "name": "super_admin"
            })

            if not role:
                raise CommandError(
                    "Super Admin role not found. "
                    "Run initialize_auth first."
                )

            existing_admin = assignments.find_one({
                "role_id": role["_id"],
                "is_active": True,
                "assignment_type": "global"
            })

            if existing_admin:
                raise CommandError(
                    "A global Super Admin already exists. "
                    "Bootstrap cannot replace an existing assignment."
                )

            existing_assignment = assignments.find_one({
                "user_id": user["_id"],
                "role_id": role["_id"],
                "assignment_type": "global",
                "is_active": True
            })

            if existing_assignment:
                raise CommandError(
                    "This account already has an active Super Admin assignment."
                )

            self.stdout.write("")
            self.stdout.write(f"Account: {user['email']}")
            self.stdout.write(f"Username: {user['username']}")
            self.stdout.write("Role: GLOBAL SUPER ADMIN")
            self.stdout.write("")

            confirmation = input(
                "Type BOOTSTRAP to confirm this assignment: "
            )

            if confirmation != "BOOTSTRAP":
                raise CommandError(
                    "Bootstrap cancelled. No changes were made."
                )

            # Atomic claim: only one global Super Admin can be
            # assigned through this bootstrap operation.
            result = assignments.insert_one({
                "user_id": user["_id"],
                "role_id": role["_id"],
                "is_active": True,
                "assigned_at": datetime.now(timezone.utc),
                "assigned_by": "bootstrap_command",
                "assignment_type": "global"
            })

            self.stdout.write("")
            self.stdout.write(
                self.style.SUCCESS(
                    f"Global Super Admin assigned successfully. "
                    f"Assignment ID: {result.inserted_id}"
                )
            )

        except DuplicateKeyError as error:
            raise CommandError(
                "A conflicting Super Admin assignment already exists."
            ) from error

        except PyMongoError as error:
            raise CommandError(
                f"MongoDB operation failed: {error}"
            ) from error
