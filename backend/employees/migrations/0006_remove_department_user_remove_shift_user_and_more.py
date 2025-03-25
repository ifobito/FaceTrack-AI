# Generated by Django 5.1.7 on 2025-03-25 05:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('employees', '0005_department_username'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='department',
            name='user',
        ),
        migrations.RemoveField(
            model_name='shift',
            name='user',
        ),
        migrations.AddField(
            model_name='shift',
            name='username',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
