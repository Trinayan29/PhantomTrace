
import jwt

from bson import ObjectId
from pymongo.errors import PyMongoError
from django.conf import settings

from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed, APIException

from services.mongodb import get_database


class AuthenticationUnavailable(APIException):
    status_code = 503
    default_detail = "Authentication service is temporarily unavailable."
    default_code = "authentication_unavailable"


class MongoUser:
    """
    Lightweight authenticated user object.
    User records are retrieved from MongoDB, not Django ORM.
    """

    def __init__(self, document):
        self.id = str(document["_id"])
        self.pk = self.id
        self.username = document.get("username")
        self.email = document.get("email")
        self.full_name = document.get("full_name")
        self.is_active = document.get("is_active", False)
        self.is_verified = document.get("is_verified", False)

        # Privileges are enforced separately through RBAC.
        self.is_staff = False
        self.is_superuser = False

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def get_username(self):
        return self.username


class MongoJWTAuthentication(BaseAuthentication):

    def authenticate(self, request):

        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return None

        parts = auth_header.split()

        if len(parts) != 2 or parts[0].lower() != "bearer":
            raise AuthenticationFailed("Invalid authorization header.")

        token = parts[1]

        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=["HS256"],
                options={
                    "require": [
                        "sub",
                        "exp",
                        "iat",
                        "jti",
                        "type",
                        "token_version"
                    ]
            }
             )

            if payload.get("type") != "access":
                raise AuthenticationFailed("Invalid access token.")

            user_id = payload.get("sub")

            if not ObjectId.is_valid(user_id):
                raise AuthenticationFailed("Invalid user identifier.")

            db = get_database()

            user_document = db.users.find_one({
                "_id": ObjectId(user_id)
            })

            if not user_document:
                raise AuthenticationFailed("User account not found.")

            if not user_document.get("is_active", False):
                raise AuthenticationFailed("User account is inactive.")

            token_version = payload.get("token_version")
            current_token_version = user_document.get("token_version", 0)

            if (
                not isinstance(token_version, int)
                or isinstance(token_version, bool)
                or token_version != current_token_version
                ):
                raise AuthenticationFailed("Token has been revoked.")

            return MongoUser(user_document), token

        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Access token has expired.")

        except jwt.InvalidTokenError:
            raise AuthenticationFailed("Invalid or expired access token.")

        except AuthenticationFailed:
            raise

        except PyMongoError as error:
            raise AuthenticationUnavailable() from error

    def authenticate_header(self, request):
        return "Bearer"
