from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path('ws/call/$', consumers.CallConsumer.as_asgi()),
]