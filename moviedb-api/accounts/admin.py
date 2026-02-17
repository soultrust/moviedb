from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .forms import CustomUserCreationForm, CustomUserChangeForm
from .models import CustomUser, List, ListItem


class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser
    list_display = ["email", "username", "name", "is_staff"]
    fieldsets = UserAdmin.fieldsets + ((None, {"fields": ("name",)}),)
    add_fieldsets = UserAdmin.add_fieldsets + ((None, {"fields": ("name",)}),)


admin.site.register(CustomUser, CustomUserAdmin)


class ListItemInline(admin.TabularInline):
    model = ListItem
    extra = 0


@admin.register(List)
class ListAdmin(admin.ModelAdmin):
    list_display = ["title", "user", "media_type"]
    list_filter = ["media_type"]
    search_fields = ["title", "user__email"]
    inlines = [ListItemInline]
