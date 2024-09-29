from django.urls import path
from .views import create_college_admin, create_student, login_user, change_password, logout_user

urlpatterns = [
    path('create-college-admin/', create_college_admin, name='create_college_admin'),
    path('create-student/', create_student, name='create_student'),
    path('login/', login_user, name='login'),
    path('change-password/', change_password, name='change_password'),
    path('logout/', logout_user, name='logout'),
]