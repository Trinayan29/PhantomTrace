
from drf_spectacular.extensions import OpenApiAuthenticationExtension


class MongoJWTAuthenticationScheme(OpenApiAuthenticationExtension):
    target_class = "accounts.authentication.MongoJWTAuthentication"
    name = "mongoJWTAuth"

    def get_security_definition(self, auto_schema):
        return {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
