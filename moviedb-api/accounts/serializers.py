from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import List, ListItem

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password], style={"input_type": "password"})
    password_confirm = serializers.CharField(write_only=True, style={"input_type": "password"})

    class Meta:
        model = User
        fields = ("email", "password", "password_confirm", "name")
        extra_kwargs = {"name": {"required": False}}

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")
        # Use email as username for simplicity
        validated_data["username"] = validated_data["email"]
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True, style={"input_type": "password"})


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "name", "username")


class ListSerializer(serializers.ModelSerializer):
    contains_movie = serializers.SerializerMethodField()

    class Meta:
        model = List
        fields = ("id", "title", "contains_movie")
        read_only_fields = ("id",)

    def get_contains_movie(self, obj):
        tmdb_id = self.context.get("tmdb_id")
        item_media_type = self.context.get("item_media_type", "movie")
        if tmdb_id is None:
            return False
        return obj.items.filter(tmdb_id=int(tmdb_id), media_type=item_media_type).exists()


class ListItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListItem
        fields = ("id", "tmdb_id", "media_type", "title", "poster_path")
        read_only_fields = ("id",)
