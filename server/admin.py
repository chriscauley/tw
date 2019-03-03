from django.contrib import admin
from django.utils.safestring import mark_safe

from .models import Sheet, Sprite, CompositeSprite


@admin.register(Sheet)
class SheetAdmin(admin.ModelAdmin):
    pass


@admin.register(Sprite)
class SpriteAdmin(admin.ModelAdmin):
    list_display = ["__str__", "img"]

    def img(self, obj):
        img = "<img src='%s' width=64/>" % obj.data['dataURL']
        return mark_safe(img)


@admin.register(CompositeSprite)
class CompositeSpriteAdmin(admin.ModelAdmin):
    pass
