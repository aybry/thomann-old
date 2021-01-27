from django.urls import path

from . import consumers

websocket_urlpatterns = [
    path('ws/hub/', consumers.HubConsumer.as_asgi()),
]
