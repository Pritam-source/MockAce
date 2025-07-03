from django.db import models
from django.contrib.auth.models import User

class ExamPackage(models.Model):
    package_id = models.IntegerField(unique=True)  # <-- add null and blank
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    num_tests = models.IntegerField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.package_id})"


class MockTest(models.Model):
    exam_package = models.ForeignKey('ExamPackage', on_delete=models.CASCADE, related_name='mock_tests')
    package_id = models.IntegerField()
    mocktest_number = models.IntegerField()
    title = models.CharField(max_length=100)
    duration_minutes = models.IntegerField(default=60)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.exam_package.name} - Mock {self.mocktest_number}: {self.title}"


class Question(models.Model):
    #mock_test = models.ForeignKey('MockTest', on_delete=models.CASCADE, related_name='questions')
    package_id = models.IntegerField()        # <--- allow null
    mocktest_number = models.IntegerField()   # <--- allow null
    question_number = models.IntegerField()   # <--- allow null
    question_text = models.TextField()
    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255)
    option_d = models.CharField(max_length=255)
    correct_option = models.CharField(max_length=1)
    explanation = models.TextField(blank=True)
    def __str__(self):
        return f"Q{self.question_number} (Pkg {self.package_id} - Mock {self.mocktest_number}): {self.question_text[:50]}"





class TestAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    mock_test = models.ForeignKey(MockTest, on_delete=models.CASCADE)
    submitted = models.BooleanField(default=False)
    score = models.IntegerField(default=0)
    submitted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.mock_test.title} - {'Submitted' if self.submitted else 'Not submitted'}"

class UserAnswer(models.Model):
    attempt = models.ForeignKey(TestAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_option = models.CharField(max_length=1)  # 'A', 'B', 'C', or 'D'
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.attempt.user.username} - Q{self.question.id} - {self.selected_option}"
