from django.urls import path
from . import views

app_name = 'movies'

urlpatterns = [
    path('trending/', views.get_trending, name='trending'),
    path('popular/', views.get_popular_movies, name='popular'),
    path('movie/<int:movie_id>/', views.get_movie_details, name='movie_details'),
    path('search/', views.search, name='search'),
    path('genres/', views.get_genres, name='genres'),
]
