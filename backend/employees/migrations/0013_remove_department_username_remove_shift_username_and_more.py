# Generated by Django 5.1.7 on 2025-03-27 06:03

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('employees', '0012_remove_employee_username_remove_userprofile_username_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RemoveField(
            model_name='department',
            name='username',
        ),
        migrations.RemoveField(
            model_name='shift',
            name='username',
        ),
        migrations.RemoveField(
            model_name='userprofile',
            name='department',
        ),
        migrations.AddField(
            model_name='department',
            name='user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='shift',
            name='user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='departments',
            field=models.ManyToManyField(blank=True, to='employees.department'),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='shifts',
            field=models.ManyToManyField(blank=True, to='employees.shift'),
        ),
        migrations.AlterField(
            model_name='employee',
            name='user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='facedata',
            name='employee',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='face_data', to='employees.employee'),
        ),
        migrations.AlterField(
            model_name='userprofile',
            name='user',
            field=models.OneToOneField(default=1, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
    ]
