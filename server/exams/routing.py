from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path('ws/call/$', consumers.CallConsumer.as_asgi()),
    re_path('ws/time/$', consumers.TimeConsumer.as_asgi()),
]