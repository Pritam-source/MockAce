from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Subscription
from apps.exams.models import ExamPackage

class SubscriptionStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, package_id):
        user = request.user
        try:
            package = ExamPackage.objects.get(id=package_id)
        except ExamPackage.DoesNotExist:
            return Response({"error": "Package not found."}, status=404)

        # Check subscription
        is_subscribed = Subscription.objects.filter(
            user=user,
            exam_package=package,
            is_active=True
        ).exists()

        return Response({"subscribed": is_subscribed})
