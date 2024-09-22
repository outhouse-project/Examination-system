from django.contrib import admin
from .models import CustomUser, CollegeAdmin, Student

admin.site.register(CustomUser)
admin.site.register(CollegeAdmin)
admin.site.register(Student)