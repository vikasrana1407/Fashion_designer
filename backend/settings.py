"""Minimal Django settings for the AI Fashion Design Studio backend."""
import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "atelier-noir-dev-secret-do-not-use-prod")
DEBUG = True
ALLOWED_HOSTS = ["*"]

INSTALLED_APPS = [
    "django.contrib.contenttypes",
    "django.contrib.auth",
    "corsheaders",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
]

ROOT_URLCONF = "urls"
WSGI_APPLICATION = "server.app"

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# We use pymongo directly. Django's default DB stays SQLite (unused).
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "django_unused.sqlite3",
    }
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
USE_TZ = True
TIME_ZONE = "UTC"

# File upload limits (allow up to ~25 MB images)
DATA_UPLOAD_MAX_MEMORY_SIZE = 26214400
FILE_UPLOAD_MAX_MEMORY_SIZE = 26214400

# JWT config
JWT_SECRET = os.environ.get("JWT_SECRET", "atelier-noir-jwt-secret")
JWT_ALGORITHM = "HS256"
JWT_EXP_DAYS = 14

# Mongo config (read by db module)
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")

# Emergent LLM key (Gemini Nano Banana)
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")
