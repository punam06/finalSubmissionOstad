from django.db import migrations, models
import django.contrib.auth.models
import django.utils.timezone
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('username', models.CharField(error_messages={'unique': 'A user with that username already exists.'}, max_length=150, unique=True, verbose_name='username')),
                ('first_name', models.CharField(blank=True, max_length=150, verbose_name='first name')),
                ('last_name', models.CharField(blank=True, max_length=150, verbose_name='last name')),
                ('email', models.EmailField(blank=True, max_length=254, verbose_name='email address')),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, verbose_name='active')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('role', models.CharField(choices=[('admin', 'Admin'), ('donor', 'Donor'), ('hospital', 'Hospital')], default='donor', max_length=20)),
            ],
            options={
                'verbose_name': 'user',
                'verbose_name_plural': 'users',
            },
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name='BloodBank',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('city', models.CharField(max_length=100)),
                ('address', models.TextField(blank=True)),
                ('units_a_plus', models.PositiveIntegerField(default=0)),
                ('units_a_minus', models.PositiveIntegerField(default=0)),
                ('units_b_plus', models.PositiveIntegerField(default=0)),
                ('units_b_minus', models.PositiveIntegerField(default=0)),
                ('units_o_plus', models.PositiveIntegerField(default=0)),
                ('units_o_minus', models.PositiveIntegerField(default=0)),
                ('units_ab_plus', models.PositiveIntegerField(default=0)),
                ('units_ab_minus', models.PositiveIntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name='DonorProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('phone', models.CharField(blank=True, max_length=20)),
                ('blood_group', models.CharField(max_length=3, choices=[('A+', 'A+'), ('A-', 'A-'), ('B+', 'B+'), ('B-', 'B-'), ('O+', 'O+'), ('O-', 'O-'), ('AB+', 'AB+'), ('AB-', 'AB-')])),
                ('city', models.CharField(blank=True, max_length=100)),
                ('last_donated', models.DateField(blank=True, null=True)),
                ('available', models.BooleanField(default=True)),
                ('photo', models.ImageField(blank=True, null=True, upload_to='profiles/')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='donor_profile', to='core.user')),
            ],
        ),
        migrations.CreateModel(
            name='BloodRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('blood_group', models.CharField(max_length=3)),
                ('units', models.PositiveIntegerField(default=1)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')], default='pending', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('requester', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='requests', to='core.user')),
            ],
        ),
        migrations.CreateModel(
            name='Donation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('blood_group', models.CharField(max_length=3)),
                ('units', models.PositiveIntegerField(default=1)),
                ('approved', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('blood_bank', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='core.bloodbank')),
                ('donor', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='donations', to='core.user')),
            ],
        ),
        migrations.AddField(
            model_name='user',
            name='groups',
            field=models.ManyToManyField(blank=True, help_text="The groups this user belongs to. A user will get all permissions granted to each of their groups.", related_name="user_set", related_query_name="user", to='auth.Group', verbose_name='groups'),
        ),
        migrations.AddField(
            model_name='user',
            name='user_permissions',
            field=models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.Permission', verbose_name='user permissions'),
        ),
    ]
