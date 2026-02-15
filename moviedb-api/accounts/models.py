from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    name = models.CharField(null=True, blank=True, max_length=100)


class Consumed(models.Model):
    """Movies/shows marked as consumed by a user. Only that user can see or change them."""
    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="consumed_items"
    )
    tmdb_id = models.IntegerField()
    title = models.CharField(max_length=500)
    media_type = models.CharField(max_length=20)  # 'movie' or 'tv'

    class Meta:
        ordering = ["-id"]
        constraints = [
            models.UniqueConstraint(fields=["user", "tmdb_id"], name="unique_user_tmdb"),
        ]
