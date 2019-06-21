from django.conf import settings
from django.contrib import admin
from django.urls import path, re_path, include

import unrest.views
from unrest.nopass.views import create as nopass_create

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/nopass/', include('unrest.nopass.urls')),
    re_path('api/(server|uc).([^/]+)/$', unrest.views.superuser_api_view),
    path("user.json", unrest.views.user_json),
    path("api/auth/register/", nopass_create),
]

if settings.DEBUG:
    urlpatterns.append(path('', unrest.views.index))
