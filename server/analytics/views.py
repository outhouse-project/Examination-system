from rest_framework import status
from django.db.models import Count, Avg, F, ExpressionWrapper, FloatField
from rest_framework.decorators import api_view
from rest_framework.response import Response
from accounts.models import CollegeAdmin, Student
from exams.models import Exam, Result, ProctoringAlert
from django.utils import timezone

# Super Admin Analytics
@api_view(['GET'])
def super_admin_analytics(request):
    if request.user.role != 'super_admin':
        return Response({"error": "Unauthorized"}, status=403)

    try:
        total_college_admins = CollegeAdmin.objects.count()
        total_students = Student.objects.count()
        total_exams = Exam.objects.count()
        past_exams = Exam.objects.filter(scheduled_at__lt=timezone.now()).count()
        ai_proctored_exams = Exam.objects.filter(is_AI_proctored=True).count()

        proctoring_alert_counts = (
            ProctoringAlert.objects.values('alert_type')
            .annotate(count=Count('alert_type'))
            .order_by('-count')
        )

        return Response({
            "total_college_admins": total_college_admins,
            "total_students": total_students,
            "total_exams": total_exams,
            "past_exams": past_exams,
            "upcoming_exams": total_exams - past_exams,
            "ai_proctored_exams": ai_proctored_exams,
            "regular_exams": total_exams - ai_proctored_exams,
            "proctoring_alerts": list(proctoring_alert_counts),
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# College Admin Analytics
@api_view(['GET'])
def college_admin_analytics(request):
    if request.user.role != 'college_admin':
        return Response({"error": "Unauthorized"}, status=403)

    try:
        college_admin = CollegeAdmin.objects.get(user=request.user)

        total_students = college_admin.students.count()
        total_exams = college_admin.created_exams.count()
        past_exams = college_admin.created_exams.filter(scheduled_at__lt=timezone.now()).count()
        avg_student_score = (
            Result.objects.filter(of_exam__created_by=college_admin, of_exam__exam_type='MCQ')
            .annotate(scaled_score=ExpressionWrapper(
                F('score') * 100.0 / Count('of_exam__questions'),
                output_field=FloatField()
            ))
            .aggregate(avg_score=Avg('scaled_score'))['avg_score'] or 0
        )

        proctoring_alerts = (
            ProctoringAlert.objects.filter(of_exam__created_by=college_admin)
            .values('alert_type')
            .annotate(count=Count('alert_type'))
            .order_by('-count')
        )

        return Response({
            "total_students": total_students,
            "total_exams": total_exams,
            "past_exams": past_exams,
            "upcoming_exams": total_exams - past_exams,
            "average_student_score": avg_student_score,
            "proctoring_alerts": list(proctoring_alerts),
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# Student Analytics
@api_view(['GET'])
def student_analytics(request):
    if request.user.role != 'student':
        return Response({"error": "Unauthorized"}, status=403)

    try:
        student = Student.objects.get(user=request.user)

        total_exams_attempted = student.results.count()
        avg_score = (
            student.results.filter(of_exam__exam_type='MCQ')
            .annotate(scaled_score=ExpressionWrapper(
                F('score') * 100.0 / Count('of_exam__questions'),
                output_field=FloatField()
            ))
            .aggregate(avg_score=Avg('scaled_score'))['avg_score'] or 0
        )

        upcoming_exams = Exam.objects.filter(
            scheduled_at__gte=timezone.now(),
            created_by=student.college_admin
        ).count()

        return Response({
            "total_exams_attempted": total_exams_attempted,
            "average_score": avg_score,
            "upcoming_exams": upcoming_exams,
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)