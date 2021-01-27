import os

from django.core.asgi import get_asgi_application
django_asgi_app = get_asgi_application()

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter

import lookup_hub.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'thomann.settings')

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': AuthMiddlewareStack(
        URLRouter(
            lookup_hub.routing.websocket_urlpatterns,
        )
    ),
})
