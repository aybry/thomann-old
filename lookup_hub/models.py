import uuid
from django.db import models
from django.contrib.auth.models import User

from simple_history.models import HistoricalRecords


class Dictionary(models.Model):
    name = models.CharField(max_length=200)

    class Meta:
        verbose_name_plural = 'Dictionaries'

    def __str__(self):
        return f'Dictionary: {self.name}'


class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dictionary = models.ForeignKey(Dictionary, on_delete=models.CASCADE)
    name = models.CharField(max_length=200, blank=True)
    order = models.IntegerField(default=100000)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ('order', )

    def __str__(self):
        return f'Category: {self.name}'


class Row(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.FloatField()
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)

    class Meta:
        unique_together = (('category', 'order'),)
        ordering = ('order', )

    def __str__(self):
        try:
            return f'Row {self.get_cell().text}'
        except Cell.DoesNotExist:
            return 'Row (empty)'

    def get_cell(self, language='en'):
        return self.cell_set.get(language=language)

    def get_neighbours(self):
        ids = [str(obj['id']) for obj in Row.objects.filter(category=self.category).values('id')]
        position = ids.index(str(self.id))

        if len(ids) == 1:
            return [None, None]
        elif position == 0:
            return [None, Row.objects.get(pk=ids[position + 1])]
        elif position == len(ids) - 1:
            return [Row.objects.get(pk=ids[position - 1]), None]
        else:
            return [Row.objects.get(pk=ids[position - 1]),
                    Row.objects.get(pk=ids[position + 1])]

    def get_neighbour_ids(self):
        neighbours = self.get_neighbours()
        return [str(row.id) if row is not None else None for row in neighbours]



class Cell(models.Model):
    EN = 'en'
    DE = 'de'
    NL = 'nl'

    LANGUAGE_CHOICES = (
        (EN, 'English'),
        (DE, 'German'),
        (NL, 'Dutch'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    row = models.ForeignKey(Row, on_delete=models.CASCADE)
    language = models.CharField(max_length=5, choices=LANGUAGE_CHOICES)
    text = models.CharField(max_length=200, null=True, default='')
    comment = models.CharField(max_length=2000, null=True, default='')
    colour = models.CharField(max_length=50, null=True, default='')

    created_at = models.DateTimeField(auto_now_add=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, blank=True)

    history = HistoricalRecords()

    class Meta:
        ordering = ('language', )
        unique_together = ('language', 'row', )

    def __str__(self):
        return f'{self.text:.20}'
