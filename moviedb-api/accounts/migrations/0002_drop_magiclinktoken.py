from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.RunSQL(
            "DROP TABLE IF EXISTS accounts_magiclinktoken;",
            migrations.RunSQL.noop,
        ),
    ]
