from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Exam, Question, Option, Result, StudentResponse, ProctoringAlert
from accounts.models import CollegeAdmin, Student
from django.utils import timezone
from rest_framework.generics import get_object_or_404

@api_view(['POST'])
def create_exam(request):
    user = request.user
    if user.role != 'college_admin':
        return Response({'error': 'Only college admins can create exams.'}, status=status.HTTP_403_FORBIDDEN)

    data = request.data

    try:
        exam = Exam.objects.create(
            exam_type=data['exam_type'],
            title=data['title'],
            instructions=data['instructions'],
            scheduled_at=data['scheduled_at'],
            duration_in_minutes=data['duration_in_minutes'],
            is_AI_proctored=data.get('is_AIproctored', False),
            created_by=user.college_admin_profile
        )

        if data['exam_type'] == 'MCQ':
            for question_data in data['questions']:
                question = Question.objects.create(question=question_data['text'], of_exam=exam)
                for option_data in question_data['options']:
                    Option.objects.create(
                        option=option_data['text'],
                        is_correct=option_data['is_correct'],
                        of_question=question
                    )

        return Response({'message': 'Exam created successfully', 'exam_id': exam.id}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_exam_details(request, exam_id):
    try:
        exam = get_object_or_404(Exam, id=exam_id)

        # Prepare the exam data
        exam_data = {
            'id': exam.id,
            'title': exam.title,
            'exam_type': exam.exam_type,
            'instructions': exam.instructions,
            'scheduled_at': exam.scheduled_at,
            'duration_in_minutes': exam.duration_in_minutes,
            'is_AI_proctored': exam.is_AI_proctored,
            'questions': []
        }

        # If the exam type is MCQ, include the questions and their options
        if exam.exam_type == 'MCQ':
            questions = Question.objects.filter(of_exam=exam)
            for question in questions:
                question_data = {
                    'id': question.id,
                    'text': question.question,
                    'options': []
                }

                options = Option.objects.filter(of_question=question)
                for option in options:
                    option_data = {
                        'id': option.id,
                        'text': option.option,
                        'is_correct': option.is_correct
                    }
                    question_data['options'].append(option_data)

                exam_data['questions'].append(question_data)

        return Response({'exam': exam_data}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def list_exams(request):
    user = request.user
    if user.role == 'college_admin':
        exams = Exam.objects.filter(created_by=user.college_admin_profile).order_by('-scheduled_at')
    elif user.role == 'student':
        exams = Exam.objects.filter(created_by=user.student_profile.college_admin).order_by('-scheduled_at')
    else:
        return Response({'error': 'Permission denied. Only college admins and their students can view these exams.'}, status=status.HTTP_403_FORBIDDEN)

    # Prepare the response data
    exam_data = [{
        'id': exam.id,
        'title': exam.title,
        'exam_type': exam.exam_type,
        'scheduled_at': exam.scheduled_at,
        'duration': exam.duration_in_minutes,
        'is_AI_proctored': exam.is_AI_proctored,
    } for exam in exams]
    return Response({'exams': exam_data}, status=status.HTTP_200_OK)

@api_view(['PUT'])
def edit_exam(request, exam_id):
    user = request.user
    exam = get_object_or_404(Exam, id=exam_id, created_by=user.college_admin_profile)

    if exam.scheduled_at <= timezone.now():
        return Response({'error': 'Cannot edit exam after scheduled time.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Proceed with editing if the exam is not live
        data = request.data
        exam.title = data.get('title', exam.title)
        exam.instructions = data.get('instructions', exam.instructions)
        exam.scheduled_at = data.get('scheduled_at', exam.scheduled_at)
        exam.duration_in_minutes = data.get('duration_in_minutes', exam.duration_in_minutes)
        exam.is_AI_proctored = data.get('is_AI_proctored', exam.is_AI_proctored)
        exam.exam_type = data.get('exam_type', exam.exam_type)
        exam.save()

        # If the exam type is MCQ, update the questions and options
        if exam.exam_type == 'MCQ':
            for question_data in data['questions']:
                question_id = question_data.get('id', None)

                # If question ID exists, update the question; otherwise, create a new one
                if question_id:
                    question = get_object_or_404(Question, id=question_id, of_exam=exam)
                    question.question = question_data['text']
                    question.save()
                else:
                    question = Question.objects.create(question=question_data['text'], of_exam=exam)

                # Update or create options for this question
                for option_data in question_data['options']:
                    option_id = option_data.get('id', None)

                    if option_id:
                        option = get_object_or_404(Option, id=option_id, of_question=question)
                        option.option = option_data['text']
                        option.is_correct = option_data['is_correct']
                        option.save()
                    else:
                        Option.objects.create(
                            option=option_data['text'],
                            is_correct=option_data['is_correct'],
                            of_question=question
                        )

        return Response({'message': 'Exam updated successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)