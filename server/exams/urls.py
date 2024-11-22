from django.urls import path
from .views import create_exam, list_exams, get_exam_details, edit_exam

urlpatterns = [
    path('create-exam/', create_exam, name='create_exam'),
    path('list-exams/', list_exams, name='list_exams'),
    path('exam-details/<int:exam_id>/', get_exam_details, name='get_exam_details'),
    path('edit-exam/', edit_exam, name='edit_exam'),
]