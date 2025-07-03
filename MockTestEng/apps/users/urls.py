# -*- coding: utf-8 -*-

from django.urls import path
from .views import RegisterView, LoginView
from .views import UserProfileView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', UserProfileView.as_view(), name='user-profile'),
]
