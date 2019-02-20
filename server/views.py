from django.http import JsonResponse
import json

import unrest.views
from server.models import Sheet


def save_sheet(request, app_label, model_name):
    if not request.method == "POST":
        return unrest.views.list_view(request, app_label, model_name)
    if not request.user.is_superuser:
        raise NotImplementedError
    data = json.loads(request.body.decode('utf-8') or "{}")
    id = data.pop("id", 0)
    if id:
        game = Sheet.objects.get(id=id)
        game.data = data
        game.save()
    else:
        game = Sheet.objects.create(data=data)
    return JsonResponse(game.as_json)
