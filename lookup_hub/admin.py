from django.contrib import admin
from . import models



@admin.register(models.Dictionary)
class DictionaryAdmin(admin.ModelAdmin):
    list_display = (
        'name_display',
        'name',
    )


@admin.register(models.Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'dictionary',
        'order',
    )


@admin.register(models.Row)
class RowAdmin(admin.ModelAdmin):
    list_display = (
        'order',
    )


@admin.register(models.Cell)
class CellAdmin(admin.ModelAdmin):
    list_display = (
        'text',
        'language',
        'comment',
        'colour',
        'row',
    )
