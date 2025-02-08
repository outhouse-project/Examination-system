from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from accounts.models import CollegeAdmin, Student

class Exam(models.Model):
    EXAM_TYPE_CHOICES = (
        ('MCQ', 'MCQ Mode'),
        ('Video', 'Video Meet')
    )
    exam_type = models.CharField(max_length=15, choices=EXAM_TYPE_CHOICES)
    title = models.CharField(max_length=30)
    instructions = models.TextField()
    scheduled_at = models.DateTimeField()
    duration_in_minutes = models.PositiveIntegerField()
    is_AI_proctored = models.BooleanField(default=False) 
    created_by = models.ForeignKey(CollegeAdmin, on_delete=models.CASCADE, related_name='created_exams')

    class Meta:
        ordering = ['-scheduled_at']

    def clean(self):
        if isinstance(self.scheduled_at, str):
            if self.scheduled_at <= timezone.now().isoformat():
                raise ValidationError({"scheduled_at": "The exam must be scheduled in the future."})
        elif self.scheduled_at <= timezone.now():
            raise ValidationError({"scheduled_at": "The exam must be scheduled in the future."})

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

class Question(models.Model):
    question = models.TextField()
    of_exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='questions')

class Option(models.Model):
    option = models.TextField()
    is_correct = models.BooleanField(default=False)
    of_question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')

class Result(models.Model):
    score=models.IntegerField(null=True)
    of_exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='results')
    of_student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='results')

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['of_exam', 'of_student'], name='unique_exam_student')
        ]
        ordering = ['-of_exam__scheduled_at']

class StudentResponse(models.Model):
    of_student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='responses')
    selected_option = models.ForeignKey(Option, on_delete=models.CASCADE, related_name='selected_for_responses')

class ProctoringAlert(models.Model):
    ALERT_TYPE_CHOICES = (
        ('face_absent', 'Face Not Detected'),
        ('multiple_faces', 'Multiple Faces Detected'),
        ('mobile_use', 'Mobile Use Detected'),
        ('book_detected', 'Book Detected'),
        ('looking_away', 'Suspicious Movement Detected'),
        # ('screen_change', 'Screen Activity Detected'),
    )
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPE_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    of_exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='proctoring_alerts')
    of_student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='proctoring_alerts')

    class Meta:
        ordering = ['timestamp']