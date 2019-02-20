from django.contrib import admin

from .models import Sheet


@admin.register(Sheet)
class SheetAdmin(admin.ModelAdmin):
    pass
