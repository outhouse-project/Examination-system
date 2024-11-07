from django.urls import path
from .views import create_exam, list_exams

urlpatterns = [
    path('create-exam/', create_exam, name='create_exam'),
    path('list-exams/', list_exams, name='list_exams'),
]