"""HTTP views for the AI Fashion Design Studio."""
import base64
import json
import logging
import re
import uuid
from datetime import datetime, timezone

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from api.auth_utils import (
    auth_required,
    create_token,
    hash_password,
    parse_json,
    verify_password,
)
from api.db import collections as col_coll
from api.db import designs as designs_coll
from api.db import outfits as outfits_coll
from api.db import users as users_coll
from api.ai_service import generate_fashion_image

logger = logging.getLogger(__name__)

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _now_iso():
    return datetime.now(timezone.utc).isoformat()


def _user_public(doc):
    return {
        "id": doc["id"],
        "email": doc["email"],
        "name": doc.get("name", ""),
        "created_at": doc.get("created_at"),
    }


# ---------- Health ----------
@require_http_methods(["GET"])
def health(request):
    return JsonResponse({"status": "ok", "service": "atelier-noir"})


# ---------- Auth ----------
@csrf_exempt
@require_http_methods(["POST"])
def register(request):
    data = parse_json(request)
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    name = (data.get("name") or "").strip()

    if not EMAIL_RE.match(email):
        return JsonResponse({"detail": "Invalid email"}, status=400)
    if len(password) < 6:
        return JsonResponse({"detail": "Password must be at least 6 characters"}, status=400)

    if users_coll.find_one({"email": email}):
        return JsonResponse({"detail": "Email already registered"}, status=409)

    user_id = str(uuid.uuid4())
    doc = {
        "id": user_id,
        "email": email,
        "name": name or email.split("@")[0],
        "password_hash": hash_password(password),
        "created_at": _now_iso(),
    }
    users_coll.insert_one(doc)
    token = create_token(user_id, email)
    return JsonResponse({"token": token, "user": _user_public(doc)})


@csrf_exempt
@require_http_methods(["POST"])
def login(request):
    data = parse_json(request)
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = users_coll.find_one({"email": email}, {"_id": 0})
    if not user or not verify_password(password, user["password_hash"]):
        return JsonResponse({"detail": "Invalid credentials"}, status=401)

    token = create_token(user["id"], user["email"])
    return JsonResponse({"token": token, "user": _user_public(user)})


@require_http_methods(["GET"])
@auth_required
def me(request):
    return JsonResponse({"user": _user_public(request.user_doc)})


# ---------- Designs ----------
@csrf_exempt
@require_http_methods(["POST"])
@auth_required
def generate_design(request):
    """Multipart: optional reference image + prompt + style fields."""
    prompt = (request.POST.get("prompt") or "").strip()
    style = (request.POST.get("style") or "").strip()
    color = (request.POST.get("color") or "").strip()
    material = (request.POST.get("material") or "").strip()
    audience = (request.POST.get("audience") or "").strip()
    title = (request.POST.get("title") or "").strip() or "Untitled concept"

    if not prompt:
        return JsonResponse({"detail": "Prompt is required"}, status=400)

    reference_b64 = None
    reference_data_uri = None
    file = request.FILES.get("reference")
    if file:
        raw = file.read()
        if len(raw) > 20 * 1024 * 1024:
            return JsonResponse({"detail": "Reference image too large (max 20MB)"}, status=400)
        reference_b64 = base64.b64encode(raw).decode("utf-8")
        mime = getattr(file, "content_type", "image/png") or "image/png"
        reference_data_uri = f"data:{mime};base64,{reference_b64}"

    try:
        image_uri, ai_text, full_prompt = generate_fashion_image(
            prompt=prompt,
            reference_b64=reference_b64,
            style=style,
            color=color,
            material=material,
            audience=audience,
        )
    except Exception as e:  # noqa: BLE001
        logger.exception("Generation failed")
        return JsonResponse({"detail": f"Generation failed: {str(e)[:200]}"}, status=502)

    if not image_uri:
        return JsonResponse({"detail": "Model returned no image"}, status=502)

    design_id = str(uuid.uuid4())
    design = {
        "id": design_id,
        "user_id": request.user_doc["id"],
        "title": title,
        "prompt": prompt,
        "full_prompt": full_prompt,
        "style": style,
        "color": color,
        "material": material,
        "audience": audience,
        "image": image_uri,
        "reference": reference_data_uri,
        "notes": ai_text or "",
        "created_at": _now_iso(),
    }
    designs_coll.insert_one(design)
    design.pop("_id", None)
    return JsonResponse({"design": design})


@require_http_methods(["GET"])
@auth_required
def list_designs(request):
    items = list(
        designs_coll.find({"user_id": request.user_doc["id"]}, {"_id": 0})
        .sort("created_at", -1)
        .limit(200)
    )
    return JsonResponse({"designs": items})


@csrf_exempt
@require_http_methods(["GET", "DELETE"])
@auth_required
def design_detail(request, design_id):
    if request.method == "GET":
        doc = designs_coll.find_one(
            {"id": design_id, "user_id": request.user_doc["id"]}, {"_id": 0}
        )
        if not doc:
            return JsonResponse({"detail": "Not found"}, status=404)
        return JsonResponse({"design": doc})

    res = designs_coll.delete_one({"id": design_id, "user_id": request.user_doc["id"]})
    if res.deleted_count == 0:
        return JsonResponse({"detail": "Not found"}, status=404)
    # Also remove from collections/outfits
    col_coll.update_many(
        {"user_id": request.user_doc["id"]},
        {"$pull": {"design_ids": design_id}},
    )
    outfits_coll.update_many(
        {"user_id": request.user_doc["id"]},
        {"$pull": {"design_ids": design_id}},
    )
    return JsonResponse({"ok": True})


# ---------- Collections (Mood boards) ----------
@csrf_exempt
@require_http_methods(["GET", "POST"])
@auth_required
def collections(request):
    if request.method == "GET":
        items = list(
            col_coll.find({"user_id": request.user_doc["id"]}, {"_id": 0})
            .sort("created_at", -1)
        )
        return JsonResponse({"collections": items})

    data = parse_json(request)
    name = (data.get("name") or "").strip()
    description = (data.get("description") or "").strip()
    if not name:
        return JsonResponse({"detail": "Name is required"}, status=400)
    coll_id = str(uuid.uuid4())
    doc = {
        "id": coll_id,
        "user_id": request.user_doc["id"],
        "name": name,
        "description": description,
        "design_ids": [],
        "created_at": _now_iso(),
    }
    col_coll.insert_one(doc)
    doc.pop("_id", None)
    return JsonResponse({"collection": doc})


@csrf_exempt
@require_http_methods(["GET", "DELETE", "PATCH"])
@auth_required
def collection_detail(request, collection_id):
    doc = col_coll.find_one(
        {"id": collection_id, "user_id": request.user_doc["id"]}, {"_id": 0}
    )
    if not doc:
        return JsonResponse({"detail": "Not found"}, status=404)

    if request.method == "DELETE":
        col_coll.delete_one({"id": collection_id, "user_id": request.user_doc["id"]})
        return JsonResponse({"ok": True})

    if request.method == "PATCH":
        data = parse_json(request)
        update = {}
        if "name" in data:
            update["name"] = (data.get("name") or "").strip()
        if "description" in data:
            update["description"] = (data.get("description") or "").strip()
        if update:
            col_coll.update_one(
                {"id": collection_id, "user_id": request.user_doc["id"]}, {"$set": update}
            )
            doc.update(update)

    designs = list(
        designs_coll.find(
            {"id": {"$in": doc.get("design_ids", [])}, "user_id": request.user_doc["id"]},
            {"_id": 0},
        )
    )
    doc["designs"] = designs
    return JsonResponse({"collection": doc})


@csrf_exempt
@require_http_methods(["POST", "DELETE"])
@auth_required
def collection_add_item(request, collection_id):
    data = parse_json(request)
    design_id = data.get("design_id")
    if not design_id:
        return JsonResponse({"detail": "design_id required"}, status=400)

    if request.method == "POST":
        col_coll.update_one(
            {"id": collection_id, "user_id": request.user_doc["id"]},
            {"$addToSet": {"design_ids": design_id}},
        )
    else:
        col_coll.update_one(
            {"id": collection_id, "user_id": request.user_doc["id"]},
            {"$pull": {"design_ids": design_id}},
        )
    return JsonResponse({"ok": True})


# ---------- Outfits ----------
@csrf_exempt
@require_http_methods(["GET", "POST"])
@auth_required
def outfits(request):
    if request.method == "GET":
        items = list(
            outfits_coll.find({"user_id": request.user_doc["id"]}, {"_id": 0})
            .sort("created_at", -1)
        )
        # Embed referenced designs (image + title)
        all_ids = {d for o in items for d in o.get("design_ids", [])}
        design_map = {
            d["id"]: d
            for d in designs_coll.find(
                {"id": {"$in": list(all_ids)}, "user_id": request.user_doc["id"]},
                {"_id": 0, "id": 1, "title": 1, "image": 1},
            )
        }
        for o in items:
            o["designs"] = [design_map[did] for did in o.get("design_ids", []) if did in design_map]
        return JsonResponse({"outfits": items})

    data = parse_json(request)
    name = (data.get("name") or "").strip()
    design_ids = data.get("design_ids") or []
    if not name:
        return JsonResponse({"detail": "Name is required"}, status=400)
    if not isinstance(design_ids, list):
        return JsonResponse({"detail": "design_ids must be a list"}, status=400)

    outfit_id = str(uuid.uuid4())
    doc = {
        "id": outfit_id,
        "user_id": request.user_doc["id"],
        "name": name,
        "design_ids": design_ids,
        "created_at": _now_iso(),
    }
    outfits_coll.insert_one(doc)
    doc.pop("_id", None)
    return JsonResponse({"outfit": doc})


@csrf_exempt
@require_http_methods(["GET", "DELETE", "PATCH"])
@auth_required
def outfit_detail(request, outfit_id):
    doc = outfits_coll.find_one(
        {"id": outfit_id, "user_id": request.user_doc["id"]}, {"_id": 0}
    )
    if not doc:
        return JsonResponse({"detail": "Not found"}, status=404)

    if request.method == "DELETE":
        outfits_coll.delete_one({"id": outfit_id, "user_id": request.user_doc["id"]})
        return JsonResponse({"ok": True})

    if request.method == "PATCH":
        data = parse_json(request)
        update = {}
        if "name" in data:
            update["name"] = (data.get("name") or "").strip()
        if "design_ids" in data and isinstance(data["design_ids"], list):
            update["design_ids"] = data["design_ids"]
        if update:
            outfits_coll.update_one(
                {"id": outfit_id, "user_id": request.user_doc["id"]}, {"$set": update}
            )
            doc.update(update)

    design_ids = doc.get("design_ids", [])
    designs = list(
        designs_coll.find(
            {"id": {"$in": design_ids}, "user_id": request.user_doc["id"]}, {"_id": 0}
        )
    )
    # Preserve order
    order = {did: i for i, did in enumerate(design_ids)}
    designs.sort(key=lambda d: order.get(d["id"], 0))
    doc["designs"] = designs
    return JsonResponse({"outfit": doc})
