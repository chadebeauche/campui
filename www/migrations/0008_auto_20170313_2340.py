# -*- coding: utf-8 -*-
# Generated by Django 1.10.6 on 2017-03-13 23:40
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('www', '0007_auto_20170313_2225'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='profile',
            name='c2c_id',
        ),
        migrations.RemoveField(
            model_name='profile',
            name='image_queries',
        ),
        migrations.RemoveField(
            model_name='profile',
            name='outing_queries',
        ),
        migrations.RemoveField(
            model_name='profile',
            name='parameters',
        ),
        migrations.RemoveField(
            model_name='profile',
            name='route_queries',
        ),
        migrations.RemoveField(
            model_name='profile',
            name='xreport_queries',
        ),
    ]
