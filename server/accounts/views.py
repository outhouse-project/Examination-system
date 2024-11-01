import random
import string
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from .models import CustomUser, CollegeAdmin, Student

# Utility function to generate a random unique username
def generate_unique_username(prefix):
    while True:
        username = prefix + ''.join(random.choices(string.ascii_lowercase, k=5))
        if not CustomUser.objects.filter(username=username).exists():
            return username

# Super Admin: Create College Admin
@api_view(['POST'])
@login_required
def create_college_admin(request):
    user = request.user
    if user.role != 'super_admin':
        return Response({'error': 'Permission denied. Only super admin can create college admins.'}, status=status.HTTP_403_FORBIDDEN)

    data = request.data
    try:
        username = generate_unique_username('C'+data['first_name'])
        # Creating a new college admin user
        college_admin = CustomUser.objects.create_user(
            username=username,
            email=data['email'],
            password=username,
            role='college_admin',
            first_name=data['first_name'],
            last_name=data['last_name'],
        )
        college_admin.save()

        # Also create a corresponding CollegeAdmin profile
        CollegeAdmin.objects.create(user=college_admin)
        
        return Response({'message': 'College admin created successfully', 'username': username}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# College Admin: Create Student
@api_view(['POST'])
@login_required
def create_student(request):
    user = request.user
    if user.role != 'college_admin':
        return Response({'error': 'Permission denied. Only college admins can create students.'}, status=status.HTTP_403_FORBIDDEN)

    data = request.data
    try:
        # Check if the college admin has exceeded the limit of students they can create
        admin_profile = user.college_admin_profile
        if admin_profile.no_of_student_created >= 100:
            return Response({'error': 'You have reached the student creation limit.'}, status=status.HTTP_403_FORBIDDEN)

        username = generate_unique_username('S'+data['first_name'])
        # Creating a new student user
        student = CustomUser.objects.create_user(
            username=username,
            email=data['email'],
            password=username,
            role='student',
            first_name=data['first_name'],
            last_name=data['last_name'],
        )
        student.save()

        # Also create a corresponding Student profile
        Student.objects.create(user=student, college_admin=admin_profile)

        # Increment the count of students created by this college admin
        admin_profile.no_of_student_created += 1
        admin_profile.save()

        return Response({'message': 'Student created successfully', 'username': username}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Login View
@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    data = request.data
    role = data.get('role')
    username_or_email = data.get('username_or_email')
    password = data.get('password')

    try:
        # Try to authenticate using either username or email
        user = CustomUser.objects.filter(role=role).filter(
            username=username_or_email
        ).first() or CustomUser.objects.filter(role=role).filter(
            email=username_or_email
        ).first()

        if user:
            authenticated_user = authenticate(username=user.username, password=password)
            if authenticated_user:
                login(request, authenticated_user)
                user_data = {
                    'username': authenticated_user.username,
                    'email': authenticated_user.email,
                    'first_name': authenticated_user.first_name,
                    'last_name': authenticated_user.last_name,
                    'role': authenticated_user.role
                }
                return Response({'message': 'Login successful', 'user': user_data}, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response({'error': 'User with the provided role and username/email not found.'}, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Change Password View
@api_view(['POST'])
@login_required
def change_password(request):
    user = request.user
    data = request.data

    old_password = data.get('old_password')
    new_password = data.get('new_password')

    if not user.check_password(old_password):
        return Response({'error': 'Old password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()

    return Response({'message': 'Password changed successfully.'}, status=status.HTTP_200_OK)

# User View
@api_view(['GET'])
@login_required
def get_user(request):
    user = request.user
    user_data = {
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'role': user.role
    }
    return Response({'user': user_data}, status=status.HTTP_200_OK)

@api_view(['GET'])
@login_required
def get_college_admins(request):
    user = request.user
    if user.role != 'super_admin':
        return Response({'error': 'Permission denied. Only super admins can access this information.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        # Retrieve all college admins
        college_admins = CollegeAdmin.objects.all()
        college_admin_data = [
            {
                'username': admin.user.username,
                'email': admin.user.email,
                'first_name': admin.user.first_name,
                'last_name': admin.user.last_name
            } for admin in college_admins
        ]
        return Response({'college_admins': college_admin_data}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@login_required
def get_students(request):
    user = request.user
    if user.role != 'college_admin':
        return Response({'error': 'Permission denied. Only college admins can access this information.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        # Retrieve the students associated with the logged-in college admin
        students = user.college_admin_profile.students.all()
        student_data = [
            {
                'username': student.user.username,
                'email': student.user.email,
                'first_name': student.user.first_name,
                'last_name': student.user.last_name
            } for student in students
        ]
        return Response({'students': student_data}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Logout View
@api_view(['GET'])
@login_required
def logout_user(request):
    logout(request)
    return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)