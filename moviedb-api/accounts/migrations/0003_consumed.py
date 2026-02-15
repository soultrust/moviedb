from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0002_drop_magiclinktoken"),
    ]

    operations = [
        migrations.CreateModel(
            name="Consumed",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("tmdb_id", models.IntegerField()),
                ("title", models.CharField(max_length=500)),
                ("media_type", models.CharField(max_length=20)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="consumed_items",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["-id"],
            },
        ),
        migrations.AddConstraint(
            model_name="consumed",
            constraint=models.UniqueConstraint(
                fields=("user", "tmdb_id"), name="unique_user_tmdb"
            ),
        ),
    ]
