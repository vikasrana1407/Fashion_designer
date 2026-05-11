"""JWT + password helpers."""
import functools
import json
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from django.conf import settings
from django.http import JsonResponse

from api.db import users


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=settings.JWT_EXP_DAYS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str):
    return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])


def get_user_from_request(request):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    token = auth[7:].strip()
    try:
        payload = decode_token(token)
    except Exception:
        return None
    user = users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    return user


def auth_required(view_fn):
    @functools.wraps(view_fn)
    def wrapper(request, *args, **kwargs):
        user = get_user_from_request(request)
        if not user:
            return JsonResponse({"detail": "Unauthorized"}, status=401)
        request.user_doc = user
        return view_fn(request, *args, **kwargs)

    return wrapper


def parse_json(request):
    try:
        return json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        return {}
