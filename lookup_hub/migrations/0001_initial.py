# Generated by Django 3.2.5 on 2021-07-27 23:57

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('order', models.PositiveIntegerField(db_index=True, editable=False, verbose_name='order')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('slug', models.CharField(max_length=50)),
                ('name', models.CharField(max_length=100)),
            ],
            options={
                'verbose_name_plural': 'Categories',
            },
        ),
        migrations.CreateModel(
            name='Row',
            fields=[
                ('order', models.PositiveIntegerField(db_index=True, editable=False, verbose_name='order')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('is_flagged', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('en_text', models.CharField(default='', max_length=500)),
                ('en_comment', models.CharField(default='', max_length=2000)),
                ('en_colour', models.CharField(default='', max_length=6)),
                ('de_text', models.CharField(default='', max_length=500)),
                ('de_comment', models.CharField(default='', max_length=2000)),
                ('de_colour', models.CharField(default='', max_length=6)),
                ('nl_text', models.CharField(default='', max_length=500)),
                ('nl_comment', models.CharField(default='', max_length=2000)),
                ('nl_colour', models.CharField(default='', max_length=6)),
                ('category', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='lookup_hub.category')),
            ],
            options={
                'ordering': ('order',),
                'abstract': False,
            },
        ),
    ]
