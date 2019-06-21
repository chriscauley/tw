from django.contrib import admin

from uc.models import TestResult


@admin.register(TestResult)
class TestResultAdmin(admin.ModelAdmin):
  pass
