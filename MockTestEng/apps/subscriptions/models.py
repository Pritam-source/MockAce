from django.db import models
from django.contrib.auth import get_user_model
from apps.exams.models import ExamPackage

User = get_user_model()

class Subscription(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    exam_package = models.ForeignKey(ExamPackage, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=False)
    purchased_at = models.DateTimeField(auto_now_add=True)
    payment_id = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} - {self.exam_package.name}"

