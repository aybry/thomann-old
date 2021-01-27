from django.contrib import admin
from . import models


@admin.register(models.Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'order')


@admin.register(models.Row)
class RowAdmin(admin.ModelAdmin):
    list_display = (
        'order',
        # 'cell_set'
        # 'en',
        # 'de',
        # 'nl',
    )


@admin.register(models.Cell)
class CellAdmin(admin.ModelAdmin):
    list_display = (
        'language',
        'row',
        'text',
        'comment',
        'colour',
    )
