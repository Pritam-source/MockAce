# -*- coding: utf-8 -*-

from django.urls import path
from .views import SubscriptionStatusView

urlpatterns = [
    path('status/<int:package_id>/', SubscriptionStatusView.as_view(), name='subscription-status'),
]
