from rest_framework import renderers
import json


class UserRenderer(renderers.JSONRenderer):
    charset='utf-8'

    def render(self, data, accepted_media_type=None, renderer_context=None):
        if 'ErrorDetail' in str(data):
            response = json.dumps({'errors': data})
            return response
        else:
            # Use o renderer padrão do DRF para dados normais
            return super().render(data, accepted_media_type, renderer_context)
