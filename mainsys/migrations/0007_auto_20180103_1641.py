# -*- coding: utf-8 -*-
# Generated by Django 1.11.6 on 2018-01-03 08:41
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mainsys', '0006_auto_20171231_1950'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='corderdetail',
            name='dcno',
        ),
        migrations.RemoveField(
            model_name='purchasingorderdetail',
            name='dcno',
        ),
        migrations.AddField(
            model_name='corderdetail',
            name='discount',
            field=models.FloatField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='purchasingorderdetail',
            name='discount',
            field=models.FloatField(default=0),
            preserve_default=False,
        ),
        migrations.DeleteModel(
            name='Discount',
        ),
    ]
