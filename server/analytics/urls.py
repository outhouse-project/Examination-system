from django.urls import path
from .views import super_admin_analytics, college_admin_analytics, student_analytics

urlpatterns = [
    path('super-admin/', super_admin_analytics, name='super_admin_analytics'),
    path('college-admin/', college_admin_analytics, name='college_admin_analytics'),
    path('student/', student_analytics, name='student_analytics'),
]