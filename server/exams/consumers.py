import asyncio
from django.utils import timezone
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from django.conf import settings
import aiofiles
import os

class CallConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = None
        if self.scope["user"].is_authenticated:
            await self.accept()
        else:
            await self.close(code=4001)

    async def disconnect(self, close_code):
        if self.group_name:
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'user_disconnected',
                    'peerId': self.peer_id
                }
            )
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        event_type = data['type']

        if event_type=='join-room':
            self.group_name = data['roomId']
            self.peer_id = data['peerId']
            await self.channel_layer.group_send(self.group_name,
                {
                    'type': 'user_joined',
                    'peerId': self.peer_id,
                    'firstName': data['firstName'],
                    'lastName': data['lastName']
                }
            )
            await self.channel_layer.group_add(self.group_name, self.channel_name)

        elif event_type=='chat':
            await self.channel_layer.group_send(self.group_name, {
                'type': 'chat_message',
                'peerId': data['peerId'],
                'sender': data['sender'],
                'content': data['content']
            })

    async def user_joined(self, data):
        # Broadcast the "user joined" message to all in the room
        await self.send(text_data=json.dumps({
            'type': 'user_connected',
            'peerId': data['peerId'],
            'firstName': data['firstName'],
            'lastName': data['lastName']
        }))

    async def user_disconnected(self, data):
        await self.send(text_data=json.dumps({
            'type': 'user_disconnected',
            'peerId': data['peerId']
        }))

    async def chat_message(self, data):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'peerId': data['peerId'],
            'sender': data['sender'],
            'content': data['content']
        }))

class TimeConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Check if the user is authenticated
        if self.scope["user"].is_authenticated:
            await self.accept()
            # Start sending time every 40 seconds
            self.send_time_task = asyncio.create_task(self.send_time_periodically())
        else:
            await self.close(code=4001)

    async def disconnect(self, close_code):
        if hasattr(self, 'send_time_task'):
            self.send_time_task.cancel()

    async def send_time_periodically(self):
        while True:
            # Fetch current UTC time
            current_time = timezone.now().isoformat()
            await self.send(json.dumps({"server_time": current_time}))
            await asyncio.sleep(40)

class RecordingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if self.scope["user"].is_authenticated:
            self.user_role = await sync_to_async(lambda: self.scope["user"].role)()
            if self.user_role == "student":
                self.user_id = await sync_to_async(lambda: self.scope["user"].student_profile.id)()
                self.exam_id = self.scope['url_route']['kwargs']['exam_id']

                # Define local recording file path
                local_recording_path = os.path.join(settings.MEDIA_ROOT, f"recording_{self.exam_id}_{self.user_id}.webm")

                # Ensure directory exists
                os.makedirs(os.path.dirname(local_recording_path), exist_ok=True)

                # Open file in append mode
                self.file = await aiofiles.open(local_recording_path, "ab")

                await self.accept()
            else:
                await self.close(code=4003)
        else:
            await self.close(code=4001)

    async def receive(self, bytes_data):
        try:
            # Append received chunk to file asynchronously
            await self.file.write(bytes_data)
        except Exception as e:
            await self.send(text_data=json.dumps({"error": str(e)}))

    async def disconnect(self, close_code):
        if hasattr(self, 'file'):
            await self.file.close()  # Close the file when the student disconnects