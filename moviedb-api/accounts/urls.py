from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path("register/", views.register),
    path("login/", views.login),
    path("refresh/", TokenRefreshView.as_view()),
    path("me/", views.me),
    path("lists/", views.lists_list),
    path("lists/<int:list_id>/toggle/", views.list_toggle_item),
]
