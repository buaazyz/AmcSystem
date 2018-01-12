# -*- coding: utf-8 -*-
# Generated by Django 1.11.6 on 2017-12-27 12:21
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('mainsys', '0003_auto_20171225_1500'),
    ]

    operations = [
        migrations.CreateModel(
            name='CustomerAccount',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('catype', models.CharField(choices=[('0', 'Unreceived'), ('1', 'Received')], max_length=1)),
                ('amount', models.FloatField()),
                ('cadate', models.DateField()),
                ('billReference', models.CharField(max_length=10)),
                ('cid', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='mainsys.Customer')),
            ],
        ),
        migrations.CreateModel(
            name='SupplierAccount',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('satype', models.CharField(choices=[('0', 'Unpaid'), ('1', 'Paid')], max_length=1)),
                ('amount', models.FloatField()),
                ('sadate', models.DateField()),
                ('billReference', models.CharField(max_length=10)),
                ('fid', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='mainsys.Factory')),
            ],
        ),
        migrations.RemoveField(
            model_name='customerprompt',
            name='suno',
        ),
        migrations.AddField(
            model_name='customerprompt',
            name='dbno',
            field=models.ForeignKey(default='exit', on_delete=django.db.models.deletion.CASCADE, to='mainsys.DispatchBill'),
            preserve_default=False,
        ),
    ]