from django.db import models
from accounts.models import CollegeAdmin, Student

class Exam(models.Model):
    EXAM_TYPE_CHOICES = (
        ('mcq', 'MCQ Mode'),
        ('video', 'Video Meet')
    )
    exam_type = models.CharField(max_length=15, choices=EXAM_TYPE_CHOICES)
    title = models.CharField(max_length=30)
    instructions = models.TextField()
    scheduled_at = models.DateTimeField()
    duration_in_minutes = models.PositiveIntegerField()
    is_AIproctored = models.BooleanField(default=False) 
    created_by = models.ForeignKey(CollegeAdmin, on_delete=models.CASCADE, related_name='created_exams')

class Question(models.Model):
    question = models.TextField()
    of_exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='questions')

class Option(models.Model):
    option = models.TextField()
    is_correct = models.BooleanField(default=False)
    of_question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')

class Result(models.Model):
    score=models.IntegerField()
    of_exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='results')
    of_student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='results')

class StudentResponse(models.Model):
    of_student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='responses')
    selected_option = models.ForeignKey(Option, on_delete=models.CASCADE, related_name='selected_for_responses')