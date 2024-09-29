from django.db import models
from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models

class CustomUserManager(UserManager):
    def create_superuser(self, **extra_fields):
        extra_fields.setdefault('role', 'super_admin')
        return super().create_superuser(**extra_fields)

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('college_admin', 'College Admin'),
        ('super_admin', 'Super Admin'),
    )
    role = models.CharField(max_length=15, choices=ROLE_CHOICES)
    email = models.EmailField()
    first_name = models.CharField(max_length=15)
    last_name = models.CharField(max_length=15)
    phone_number=None
    REQUIRED_FIELDS = ['email', 'first_name', 'last_name']
    objects = CustomUserManager()

    def save(self, *args, **kwargs):
        self.full_clean()
        super(CustomUser, self).save(*args, **kwargs)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['role', 'email'], name='unique_role_email')
        ]

class CollegeAdmin(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='college_admin_profile')
    no_of_student_created = models.PositiveIntegerField(default=0)  # The number of students this admin has created

class Student(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='student_profile')
    college_admin = models.ForeignKey(CollegeAdmin, on_delete=models.CASCADE, related_name='students')