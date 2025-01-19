from django.urls import path
from .views import create_college_admin, create_student, login_user, change_password, get_user, get_college_admins, get_students, logout_user, get_csrf_token

urlpatterns = [
    path('create-college-admin/', create_college_admin, name='create_college_admin'),
    path('create-student/', create_student, name='create_student'),
    path('login/', login_user, name='login'),
    path('change-password/', change_password, name='change_password'),
    path('user/', get_user, name='get_user'),
    path('get-college-admins/', get_college_admins, name='get_college_admins'),
    path('get-students/', get_students, name='get_students'),
    path('logout/', logout_user, name='logout'),
    path('get-csrf-token/', get_csrf_token, name='get_csrf_token')
]