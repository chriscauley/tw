from django.contrib import admin
from django.utils.safestring import mark_safe

from .models import Board, Sheet, Sprite, CompositeSprite, MookSet, BossSet, Level


@admin.register(Sheet)
class SheetAdmin(admin.ModelAdmin):
    pass


@admin.register(Sprite)
class SpriteAdmin(admin.ModelAdmin):
    search_fields = ["data"]
    list_display = ["__str__", "img"]

    def img(self, obj):
        img = "<img src='%s' width=64/>" % obj.data['dataURL']
        return mark_safe(img)


@admin.register(CompositeSprite)
class CompositeSpriteAdmin(admin.ModelAdmin):
    pass


@admin.register(Board)
class BoardAdmin(admin.ModelAdmin):
    pass


@admin.register(MookSet)
class MookSetAdmin(admin.ModelAdmin):
    pass


@admin.register(BossSet)
class BossSetAdmin(admin.ModelAdmin):
    pass


@admin.register(Level)
class LevelAdmin(admin.ModelAdmin):
    pass
