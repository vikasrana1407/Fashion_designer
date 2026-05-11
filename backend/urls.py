"""URL routes. All API endpoints are prefixed with /api."""
from django.urls import path
from api import views

urlpatterns = [
    path("api/", views.health),
    path("api/auth/register", views.register),
    path("api/auth/login", views.login),
    path("api/auth/me", views.me),

    path("api/designs/generate", views.generate_design),
    path("api/designs", views.list_designs),
    path("api/designs/<str:design_id>", views.design_detail),

    path("api/collections", views.collections),
    path("api/collections/<str:collection_id>", views.collection_detail),
    path("api/collections/<str:collection_id>/items", views.collection_add_item),

    path("api/outfits", views.outfits),
    path("api/outfits/<str:outfit_id>", views.outfit_detail),
]
