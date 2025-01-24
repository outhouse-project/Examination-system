from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Exam, Question, Option, Result, StudentResponse, ProctoringAlert
from accounts.models import Student
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
            is_AI_proctored=data.get('is_AI_proctored', False),
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
    user = request.user

    try:
        # Check access rights
        if user.role == 'college_admin':
            exam = get_object_or_404(Exam, id=exam_id, created_by=user.college_admin_profile)
        elif user.role == 'student':
            exam = get_object_or_404(Exam, id=exam_id, created_by=user.student_profile.college_admin)

            current_time = timezone.now()
            if current_time < exam.scheduled_at:
                return Response({'error': 'The exam has not started yet.'}, status=status.HTTP_400_BAD_REQUEST)

        else:
            return Response({'error': 'Invalid role.'}, status=status.HTTP_403_FORBIDDEN)

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
            questions = exam.questions.all()
            for question in questions:
                question_data = {
                    'id': question.id,
                    'question': question.question,
                    'options': []
                }

                options = question.options.all()
                for option in options:
                    option_data = {
                        'id': option.id,
                        'option': option.option
                    }
                    # Include is_correct field only for college admins
                    if user.role == 'college_admin':
                        option_data['is_correct'] = option.is_correct

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
        'duration_in_minutes': exam.duration_in_minutes,
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
            exam.questions.all().delete()
            for question_data in data['questions']:
                question = Question.objects.create(question=question_data['text'], of_exam=exam)

                # Update options for this question
                for option_data in question_data['options']:
                    Option.objects.create(
                        option=option_data['text'],
                        is_correct=option_data['is_correct'],
                        of_question=question
                    )

        return Response({'message': 'Exam updated successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def delete_exam(request, exam_id):
    user = request.user
    exam = get_object_or_404(Exam, id=exam_id, created_by=user.college_admin_profile)

    if exam.scheduled_at <= timezone.now():
        return Response({'error': 'Cannot delete an exam that has already started or is completed.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        exam.delete()
        return Response({'message': 'Exam deleted successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def submit_exam(request, exam_id):
    user = request.user
    if user.role != 'student':
        return Response({'error': 'Only students can submit exams.'}, status=status.HTTP_403_FORBIDDEN)

    student = user.student_profile
    exam = get_object_or_404(Exam, id=exam_id, created_by=student.college_admin)
    score = None

    # Check if the exam is live
    current_time = timezone.now()
    exam_end_time = exam.scheduled_at + timezone.timedelta(minutes=exam.duration_in_minutes+1)
    if current_time < exam.scheduled_at:
        return Response({'error': 'The exam has not started yet.'}, status=status.HTTP_400_BAD_REQUEST)

    if current_time > exam_end_time:
        return Response({'error': 'The exam has already ended.'}, status=status.HTTP_400_BAD_REQUEST)

    # Check if the student has already submitted this exam
    if Result.objects.filter(of_exam=exam, of_student=student).exists():
        return Response({'error': 'You have already submitted this exam.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        if exam.exam_type == 'MCQ':
            # Retrieve student responses
            responses = request.data
            score = 0

            questions = exam.questions.all()
            for question in questions:
                selected_option_ids = set(responses.get(str(question.id), []))

                correct_options = question.options.filter(is_correct=True)
                correct_option_ids = set(correct_options.values_list('id', flat=True)) # Get all correct option IDs as a set

                # Give score if all and only correct options are chosen
                if selected_option_ids == correct_option_ids:
                    score += 1

                for selected_option_id in selected_option_ids:
                    selected_option = get_object_or_404(Option, id=selected_option_id)
                    StudentResponse.objects.create(
                        of_student=student,
                        selected_option=selected_option
                    )

        # Save the result
        Result.objects.create(
            score=score,
            of_exam=exam,
            of_student=student
        )

        return Response({'message': 'Exam submitted successfully.', 'score': score}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_results(request, exam_id):
    user = request.user

    try:
        # Check access rights
        if user.role == 'college_admin':
            exam = get_object_or_404(Exam, id=exam_id, created_by=user.college_admin_profile)
            results = Result.objects.filter(of_exam=exam)
        elif user.role == 'student':
            exam = get_object_or_404(Exam, id=exam_id, created_by=user.student_profile.college_admin)
            results = Result.objects.filter(of_exam=exam, of_student=user.student_profile)
        else:
            return Response({'error': 'Invalid role.'}, status=status.HTTP_403_FORBIDDEN)

        # Check if the exam has finished
        current_time = timezone.now()
        exam_end_time = exam.scheduled_at + timezone.timedelta(minutes=exam.duration_in_minutes)
        if current_time <= exam_end_time:
            return Response({'error': 'Results can only be accessed after the exam has finished.'}, status=status.HTTP_400_BAD_REQUEST)

        results_data = [{
            'student_id': result.of_student.id,
            'username': result.of_student.user.username,
            'student_email': result.of_student.user.email,
            'student_name': f"{result.of_student.user.first_name} {result.of_student.user.last_name}",
            'score': result.score,
        } for result in results]

        return Response({'results': results_data, 'total':exam.questions.count()}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_responses(request, exam_id, student_id):
    user = request.user
    try:
        # Check access permissions
        if user.role == 'college_admin':
            exam = get_object_or_404(Exam, id=exam_id, created_by=user.college_admin_profile)
            student = get_object_or_404(Student, id=student_id, college_admin=user.college_admin_profile)
        elif user.role == 'student':
            exam = get_object_or_404(Exam, id=exam_id, created_by=user.student_profile.college_admin)
            student = get_object_or_404(Student, id=student_id, college_admin=user.student_profile.college_admin)
        else:
            return Response({'error': 'Invalid role.'}, status=status.HTTP_403_FORBIDDEN)

        # Check if the exam has finished
        current_time = timezone.now()
        exam_end_time = exam.scheduled_at + timezone.timedelta(minutes=exam.duration_in_minutes)
        if current_time <= exam_end_time:
            return Response({'error': 'Results can only be accessed after the exam has finished.'}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch student responses for the exam
        student_responses = StudentResponse.objects.filter(
            selected_option__of_question__of_exam=exam,
            of_student=student
        ).select_related('selected_option', 'selected_option__of_question')

        # Prepare response data
        response_data = {}
        questions = exam.questions.all()

        for question in questions:
            selected_options = student_responses.filter(selected_option__of_question=question)
            selected_option_ids = [response.selected_option.id for response in selected_options]

            response_data[question.id] = {
                'question': question.question,
                'options': [
                    {
                        'id': option.id,
                        'text': option.option,
                        'is_correct': option.is_correct,
                        'is_selected': option.id in selected_option_ids
                    }
                    for option in question.options.all()
                ]
            }

        return Response({'responses': response_data}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

