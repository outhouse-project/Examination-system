import json
from channels.generic.websocket import AsyncWebsocketConsumer

class CallConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = None
        await self.accept()

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
                    'peerId': self.peer_id
                }
            )

            await self.channel_layer.group_add(self.group_name, self.channel_name)
        # await self.channel_layer.group_send(self.group_name, {
        #     'type': 'chat_message',
        #     'message': message
        # })

    async def user_joined(self, data):
        # Broadcast the "user joined" message to all in the room
        await self.send(text_data=json.dumps({
            'type': 'user_connected',
            'peerId': data['peerId']
        }))

    async def user_disconnected(self, data):
        await self.send(text_data=json.dumps({
            'type': 'user_disconnected',
            'peerId': data['peerId']
        }))

    async def chat_message(self, data):
        await self.send(text_data=json.dumps({'message': data['message']}))