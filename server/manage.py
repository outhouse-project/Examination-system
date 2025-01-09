#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exam_sys.settings')
    try:
        from django.core.management import execute_from_command_line

        # Delay importing User until after Django setup
        if sys.argv[1] == 'runserver':  # Only execute during 'runserver'
            import django
            django.setup()  # Ensure apps are fully loaded
            from django.contrib.auth import get_user_model

            User = get_user_model()
            # Superuser creation logic
            if not User.objects.filter(is_superuser=True).exists():
                print("No superuser found, creating one...")
                User.objects.create_superuser(
                    username='admin',
                    first_name='Super',
                    last_name='Admin',
                    email='admin@example.com',
                    password='123'
                )
                print("Superuser created: Username=admin, Password=123")
            else:
                print("Superuser already exists. Skipping creation.")

    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()