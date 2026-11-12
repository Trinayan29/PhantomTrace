
from django.core.management.base import BaseCommand, CommandError
from pymongo.errors import PyMongoError

from accounts.initialization import initialize_auth_database 


class Command(BaseCommand):
    help = "Initialize PhantomTrace MongoDB authentication collections"

    def handle(self, *args, **options):
        try:
            self.stdout.write(
                "Initializing PhantomTrace authentication database..."
            )

            initialize_auth_database()

            self.stdout.write(
                self.style.SUCCESS(
                    "Authentication database initialized successfully."
                )
            )

        except PyMongoError as error:
            raise CommandError(
                f"MongoDB initialization failed: {error}"
            ) from error
