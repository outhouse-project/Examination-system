from django.urls import path
from .views import create_exam, list_exams, get_exam_details, edit_exam, delete_exam, submit_exam, get_results, get_responses, new_alert, get_alerts, get_recording

urlpatterns = [
    path('create-exam/', create_exam, name='create_exam'),
    path('list-exams/', list_exams, name='list_exams'),
    path('exam-details/<int:exam_id>/', get_exam_details, name='get_exam_details'),
    path('edit-exam/<int:exam_id>/', edit_exam, name='edit_exam'),
    path('delete-exam/<int:exam_id>/', delete_exam, name='delete_exam'),
    path('submit-exam/<int:exam_id>/', submit_exam, name='submit_exam'),
    path('get-results/<int:exam_id>/', get_results, name='get_results'),
    path('get-responses/<int:exam_id>/<int:student_id>/', get_responses, name='get_responses'),
    path('new-alert/<int:exam_id>/', new_alert, name='new_alert'),
    path('get-alerts/<int:exam_id>/<int:student_id>/', get_alerts, name='get_alerts'),
    path('get-recording/<int:exam_id>/<int:student_id>/', get_recording, name='get_recording'),
]