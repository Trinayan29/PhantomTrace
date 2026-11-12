
import os
import certifi
from pathlib import Path
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import PyMongoError

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env", override=True)

client = None
db = None


def connect_mongodb():
    global client, db

    if db is not None:
        return db

    uri = os.getenv("MONGODB_URI")
    database_name = os.getenv(
        "MONGODB_DATABASE",
        "phantomtrace"
    )

    if not uri:
        raise ValueError(
            "MongoDB URI is missing. Check Backend/.env"
        )

    try:
        client = MongoClient(
            uri,
            serverSelectionTimeoutMS=10000,
            tls=True,
            tlsCAFile=certifi.where()
        )

        client.admin.command("ping")
        db = client[database_name]

        print("MongoDB connected successfully!")
        return db

    except PyMongoError:
        if client:
            client.close()

        client = None
        db = None
        raise


def get_database():
    return db if db is not None else connect_mongodb()


def close_mongodb():
    global client, db

    if client:
        client.close()

    client = None
    db = None
