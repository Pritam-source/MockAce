from django.shortcuts import render

# Create your views here.
import razorpay
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.exams.models import ExamPackage
from .models import Payment
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
from apps.subscriptions.models import Subscription

class CreateOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        exam_package_id = request.data.get('exam_package_id')
        exam_package = ExamPackage.objects.get(id=exam_package_id)
        amount = int(exam_package.price * 100)  # Razorpay needs amount in paise

        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        data = {
            "amount": amount,
            "currency": "INR",
            "payment_capture": 1,
            "method": "upi"
        }
        order = client.order.create(data=data)
        payment = Payment.objects.create(
            user=request.user,
            exam_package=exam_package,
            razorpay_order_id=order['id']
        )
        return Response({
            "order_id": order['id'],
            "amount": amount,
            "currency": "INR",
            "exam_package": exam_package.name,
            "razorpay_key_id": settings.RAZORPAY_KEY_ID
        })



@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def razorpay_webhook(request):
    payload = request.data
    # Validate signature and payment (see Razorpay docs)
    if payload.get('event') == 'payment.captured':
        payment_id = payload['payload']['payment']['entity']['id']
        order_id = payload['payload']['payment']['entity']['order_id']
        payment = Payment.objects.get(razorpay_order_id=order_id)
        payment.razorpay_payment_id = payment_id
        payment.status = 'paid'
        payment.save()

        # Grant subscription access
        Subscription.objects.update_or_create(
            user=payment.user,
            exam_package=payment.exam_package,
            defaults={'is_active': True, 'payment_id': payment_id}
        )
        return Response({'status': 'success'})
    return Response({'status': 'ignored'})
