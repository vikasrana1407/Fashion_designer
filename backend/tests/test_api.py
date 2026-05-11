"""Backend API tests for Atelier Noir (AI Fashion Design Studio)."""
import base64
import io
import os
import time
import uuid

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    # Fall back to frontend .env if not exposed
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip()
                    break
    except Exception:
        pass
BASE_URL = (BASE_URL or "").rstrip("/")

# 1x1 transparent PNG
TINY_PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
)

EXISTING_EMAIL = "test@atelier.com"
EXISTING_PASSWORD = "testpass123"


@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Accept": "application/json"})
    return s


@pytest.fixture(scope="session")
def auth(api):
    """Login with seed creds, or register if missing."""
    r = api.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": EXISTING_EMAIL, "password": EXISTING_PASSWORD},
        timeout=30,
    )
    if r.status_code != 200:
        api.post(
            f"{BASE_URL}/api/auth/register",
            json={"email": EXISTING_EMAIL, "password": EXISTING_PASSWORD, "name": "Test User"},
            timeout=30,
        )
        r = api.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": EXISTING_EMAIL, "password": EXISTING_PASSWORD},
            timeout=30,
        )
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    data = r.json()
    return {"token": data["token"], "user": data["user"]}


@pytest.fixture(scope="session")
def headers(auth):
    return {"Authorization": f"Bearer {auth['token']}"}


# ---------- Health ----------
def test_health(api):
    r = api.get(f"{BASE_URL}/api/", timeout=15)
    assert r.status_code == 200
    j = r.json()
    assert j.get("status") == "ok"


# ---------- Auth ----------
class TestAuth:
    def test_register_new_user(self, api):
        email = f"test_{uuid.uuid4().hex[:10]}@atelier.com"
        r = api.post(
            f"{BASE_URL}/api/auth/register",
            json={"email": email, "password": "secret123", "name": "Fresh User"},
            timeout=20,
        )
        assert r.status_code == 200, r.text
        j = r.json()
        assert "token" in j and isinstance(j["token"], str) and len(j["token"]) > 10
        assert j["user"]["email"] == email
        assert j["user"]["name"] == "Fresh User"
        assert "id" in j["user"]

    def test_register_duplicate_email_returns_409(self, api, auth):
        r = api.post(
            f"{BASE_URL}/api/auth/register",
            json={"email": EXISTING_EMAIL, "password": "secret123", "name": "Dup"},
            timeout=20,
        )
        assert r.status_code == 409, r.text

    def test_register_weak_password_returns_400(self, api):
        email = f"test_{uuid.uuid4().hex[:8]}@atelier.com"
        r = api.post(
            f"{BASE_URL}/api/auth/register",
            json={"email": email, "password": "123", "name": "Weak"},
            timeout=20,
        )
        assert r.status_code == 400, r.text

    def test_register_invalid_email_returns_400(self, api):
        r = api.post(
            f"{BASE_URL}/api/auth/register",
            json={"email": "not-an-email", "password": "secret123"},
            timeout=20,
        )
        assert r.status_code == 400, r.text

    def test_login_success(self, api):
        r = api.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": EXISTING_EMAIL, "password": EXISTING_PASSWORD},
            timeout=20,
        )
        assert r.status_code == 200, r.text
        j = r.json()
        assert "token" in j
        assert j["user"]["email"] == EXISTING_EMAIL

    def test_login_invalid_credentials(self, api):
        r = api.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": EXISTING_EMAIL, "password": "wrongpass"},
            timeout=20,
        )
        assert r.status_code == 401, r.text

    def test_me_with_token(self, api, headers):
        r = api.get(f"{BASE_URL}/api/auth/me", headers=headers, timeout=20)
        assert r.status_code == 200, r.text
        j = r.json()
        assert j["user"]["email"] == EXISTING_EMAIL

    def test_me_unauthorized(self, api):
        r = api.get(f"{BASE_URL}/api/auth/me", timeout=20)
        assert r.status_code == 401, r.text


# ---------- Designs ----------
class TestDesigns:
    def test_generate_empty_prompt_returns_400(self, api, headers):
        r = api.post(
            f"{BASE_URL}/api/designs/generate",
            headers=headers,
            data={"prompt": ""},
            timeout=30,
        )
        assert r.status_code == 400, r.text

    def test_generate_unauthorized(self, api):
        r = api.post(
            f"{BASE_URL}/api/designs/generate",
            data={"prompt": "test"},
            timeout=30,
        )
        assert r.status_code == 401, r.text

    def test_generate_without_reference(self, api, headers):
        r = api.post(
            f"{BASE_URL}/api/designs/generate",
            headers=headers,
            data={
                "prompt": "minimalist black wool coat with sharp lapels",
                "style": "editorial",
                "color": "obsidian",
                "material": "wool",
                "audience": "womenswear",
                "title": "TEST_NoRef",
            },
            timeout=120,
        )
        assert r.status_code == 200, f"status {r.status_code}: {r.text[:500]}"
        j = r.json()
        d = j["design"]
        assert d["title"] == "TEST_NoRef"
        assert d["prompt"]
        assert d["image"].startswith("data:image"), d["image"][:60]
        assert "id" in d
        # Persist id for later tests via class attr
        TestDesigns.no_ref_id = d["id"]

    def test_generate_with_reference(self, api, headers):
        files = {"reference": ("ref.png", io.BytesIO(TINY_PNG), "image/png")}
        r = api.post(
            f"{BASE_URL}/api/designs/generate",
            headers=headers,
            data={"prompt": "evening gown with silver embroidery", "title": "TEST_WithRef"},
            files=files,
            timeout=120,
        )
        assert r.status_code == 200, f"status {r.status_code}: {r.text[:500]}"
        j = r.json()
        d = j["design"]
        assert d["image"].startswith("data:image")
        assert d["reference"] and d["reference"].startswith("data:image")
        TestDesigns.with_ref_id = d["id"]

    def test_list_designs(self, api, headers):
        r = api.get(f"{BASE_URL}/api/designs", headers=headers, timeout=20)
        assert r.status_code == 200, r.text
        j = r.json()
        assert isinstance(j["designs"], list)
        ids = [d["id"] for d in j["designs"]]
        assert getattr(TestDesigns, "no_ref_id", None) in ids

    def test_design_detail(self, api, headers):
        did = getattr(TestDesigns, "no_ref_id", None)
        if not did:
            pytest.skip("no design id captured")
        r = api.get(f"{BASE_URL}/api/designs/{did}", headers=headers, timeout=20)
        assert r.status_code == 200, r.text
        assert r.json()["design"]["id"] == did

    def test_design_detail_not_found(self, api, headers):
        r = api.get(
            f"{BASE_URL}/api/designs/nonexistent-{uuid.uuid4().hex}",
            headers=headers,
            timeout=20,
        )
        assert r.status_code == 404


# ---------- Collections (Mood boards) ----------
class TestCollections:
    def test_create_collection(self, api, headers):
        r = api.post(
            f"{BASE_URL}/api/collections",
            headers=headers,
            json={"name": "TEST_MoodBoard", "description": "noir palette"},
            timeout=20,
        )
        assert r.status_code == 200, r.text
        c = r.json()["collection"]
        assert c["name"] == "TEST_MoodBoard"
        TestCollections.coll_id = c["id"]

    def test_create_collection_empty_name(self, api, headers):
        r = api.post(
            f"{BASE_URL}/api/collections",
            headers=headers,
            json={"name": ""},
            timeout=20,
        )
        assert r.status_code == 400

    def test_list_collections(self, api, headers):
        r = api.get(f"{BASE_URL}/api/collections", headers=headers, timeout=20)
        assert r.status_code == 200
        ids = [c["id"] for c in r.json()["collections"]]
        assert TestCollections.coll_id in ids

    def test_add_item_to_collection(self, api, headers):
        did = getattr(TestDesigns, "no_ref_id", None)
        if not did:
            pytest.skip("no design id")
        r = api.post(
            f"{BASE_URL}/api/collections/{TestCollections.coll_id}/items",
            headers=headers,
            json={"design_id": did},
            timeout=20,
        )
        assert r.status_code == 200, r.text

    def test_collection_detail_embeds_designs(self, api, headers):
        r = api.get(
            f"{BASE_URL}/api/collections/{TestCollections.coll_id}",
            headers=headers,
            timeout=20,
        )
        assert r.status_code == 200
        c = r.json()["collection"]
        assert isinstance(c.get("designs"), list)
        assert any(d["id"] == TestDesigns.no_ref_id for d in c["designs"])

    def test_remove_item_from_collection(self, api, headers):
        did = getattr(TestDesigns, "no_ref_id", None)
        r = api.delete(
            f"{BASE_URL}/api/collections/{TestCollections.coll_id}/items",
            headers=headers,
            json={"design_id": did},
            timeout=20,
        )
        assert r.status_code == 200, r.text
        # Verify removed
        r2 = api.get(
            f"{BASE_URL}/api/collections/{TestCollections.coll_id}",
            headers=headers,
            timeout=20,
        )
        assert all(d["id"] != did for d in r2.json()["collection"].get("designs", []))


# ---------- Outfits ----------
class TestOutfits:
    def test_create_outfit(self, api, headers):
        did = getattr(TestDesigns, "no_ref_id", None)
        if not did:
            pytest.skip("no design id")
        r = api.post(
            f"{BASE_URL}/api/outfits",
            headers=headers,
            json={"name": "TEST_Outfit", "design_ids": [did]},
            timeout=20,
        )
        assert r.status_code == 200, r.text
        o = r.json()["outfit"]
        assert o["name"] == "TEST_Outfit"
        assert o["design_ids"] == [did]
        TestOutfits.outfit_id = o["id"]

    def test_create_outfit_empty_name(self, api, headers):
        r = api.post(
            f"{BASE_URL}/api/outfits",
            headers=headers,
            json={"name": "", "design_ids": []},
            timeout=20,
        )
        assert r.status_code == 400

    def test_list_outfits_embeds_designs(self, api, headers):
        r = api.get(f"{BASE_URL}/api/outfits", headers=headers, timeout=20)
        assert r.status_code == 200
        outfits = r.json()["outfits"]
        match = [o for o in outfits if o["id"] == TestOutfits.outfit_id]
        assert match
        assert isinstance(match[0].get("designs"), list)
        assert any(d["id"] == TestDesigns.no_ref_id for d in match[0]["designs"])

    def test_delete_outfit(self, api, headers):
        r = api.delete(
            f"{BASE_URL}/api/outfits/{TestOutfits.outfit_id}",
            headers=headers,
            timeout=20,
        )
        assert r.status_code == 200
        r2 = api.get(
            f"{BASE_URL}/api/outfits/{TestOutfits.outfit_id}",
            headers=headers,
            timeout=20,
        )
        assert r2.status_code == 404


# ---------- Cleanup ----------
class TestZCleanup:
    def test_delete_collection(self, api, headers):
        cid = getattr(TestCollections, "coll_id", None)
        if not cid:
            pytest.skip("no collection")
        r = api.delete(f"{BASE_URL}/api/collections/{cid}", headers=headers, timeout=20)
        assert r.status_code == 200

    def test_delete_designs(self, api, headers):
        for attr in ("no_ref_id", "with_ref_id"):
            did = getattr(TestDesigns, attr, None)
            if not did:
                continue
            r = api.delete(f"{BASE_URL}/api/designs/{did}", headers=headers, timeout=20)
            assert r.status_code == 200
            # Verify 404
            r2 = api.get(f"{BASE_URL}/api/designs/{did}", headers=headers, timeout=20)
            assert r2.status_code == 404
