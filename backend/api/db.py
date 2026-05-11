"""MongoDB client and collection accessors."""
from pymongo import MongoClient
from django.conf import settings

_client = MongoClient(settings.MONGO_URL)
_db = _client[settings.DB_NAME]

users = _db["users"]
designs = _db["designs"]
collections = _db["collections"]
outfits = _db["outfits"]

# Indexes
users.create_index("email", unique=True)
designs.create_index([("user_id", 1), ("created_at", -1)])
collections.create_index([("user_id", 1), ("created_at", -1)])
outfits.create_index([("user_id", 1), ("created_at", -1)])
