from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path("register/", views.register),
    path("login/", views.login),
    path("refresh/", TokenRefreshView.as_view()),
    path("me/", views.me),
    path("consumed/", views.consumed_list),
    path("consumed/<int:pk>/", views.consumed_detail),
]
