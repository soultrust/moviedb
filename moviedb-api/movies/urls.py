from django.urls import path
from . import views

app_name = 'movies'

urlpatterns = [
    path('trending/', views.get_trending, name='trending'),
    path('popular/', views.get_popular_movies, name='popular'),
    path('movie/<int:movie_id>/', views.get_movie_details, name='movie_details'),
    path('tv/<int:tv_id>/', views.get_tv_details, name='tv_details'),
    path('person/<int:person_id>/', views.get_person_details, name='person_details'),
    path('search/', views.search, name='search'),
    path('genres/', views.get_genres, name='genres'),
]
