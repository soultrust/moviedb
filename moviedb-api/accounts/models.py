from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    name = models.CharField(null=True, blank=True, max_length=100)


class List(models.Model):
    """User-created list. Each list holds only one type: movie, tv, or person."""
    MEDIA_TYPES = (("media", "Movies & TV"), ("person", "Person"))

    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="lists"
    )
    title = models.CharField(max_length=255)
    media_type = models.CharField(max_length=20, choices=MEDIA_TYPES)

    class Meta:
        ordering = ["-id"]


class ListItem(models.Model):
    """A movie, TV show, or person in a list. media_type must match the list's media_type."""
    list = models.ForeignKey(List, on_delete=models.CASCADE, related_name="items")
    tmdb_id = models.IntegerField()
    media_type = models.CharField(max_length=20)  # 'movie', 'tv', or 'person'
    title = models.CharField(max_length=500, blank=True)  # movie/show title or person name
    poster_path = models.CharField(max_length=500, null=True, blank=True)  # poster or profile path

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["list", "tmdb_id", "media_type"],
                name="unique_list_item",
            ),
        ]
