from rest_framework import serializers

from . import models


class CellSerialiser(serializers.ModelSerializer):
    class Meta:
        model = models.Cell
        fields = (
            'id',
            'language',
            'text',
            'comment',
            'colour',
        )


class RowSerialiser(serializers.ModelSerializer):
    cell_set = CellSerialiser(many=True)

    class Meta:
        model = models.Row
        fields = (
            'id',
            # 'order',
            'category',
            'cell_set'
        )


class CategorySerialiser(serializers.ModelSerializer):
    row_set = RowSerialiser(many=True)

    class Meta:
        model = models.Category
        fields = (
            'id',
            'name',
            'row_set',
            # 'order',
        )
