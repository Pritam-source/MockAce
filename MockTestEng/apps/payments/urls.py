# -*- coding: utf-8 -*-

from django.urls import path
from .views import CreateOrderView, razorpay_webhook

urlpatterns = [
    path('create-order/', CreateOrderView.as_view(), name='create-order'),
    path('webhook/', razorpay_webhook, name='razorpay-webhook'),
]
