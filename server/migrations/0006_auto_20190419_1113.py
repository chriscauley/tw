# Generated by Django 2.1.4 on 2019-04-19 11:13

import django.contrib.postgres.fields.jsonb
from django.db import migrations, models
import unrest.models


class Migration(migrations.Migration):

    dependencies = [
        ('server', '0005_board'),
    ]

    operations = [
        migrations.CreateModel(
            name='MookSet',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('data_hash', models.BigIntegerField()),
                ('data', django.contrib.postgres.fields.jsonb.JSONField(default=dict)),
            ],
            options={
                'abstract': False,
            },
            bases=(models.Model, unrest.models.JsonMixin),
        ),
        migrations.RenameModel(
            old_name='PieceGenerator',
            new_name='BossSet',
        ),
    ]