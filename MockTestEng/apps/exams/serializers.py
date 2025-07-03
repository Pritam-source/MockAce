# serializers.py

from rest_framework import serializers
from .models import ExamPackage, MockTest, Question

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'

class MockTestSerializer(serializers.ModelSerializer):
    # Dynamically get questions for this mock test by package_id and mocktest_number
    questions = serializers.SerializerMethodField()

    class Meta:
        model = MockTest
        fields = '__all__'  # Add 'questions' to include it in output

    def get_questions(self, obj):
        # obj is a MockTest instance
        return QuestionSerializer(
            Question.objects.filter(
                package_id=obj.package_id,
                mocktest_number=obj.mocktest_number
            ),
            many=True
        ).data

class ExamPackageSerializer(serializers.ModelSerializer):
    # Embed all related mock tests, each with their questions
    mock_tests = MockTestSerializer(many=True, read_only=True)
    # NEW: IDs of first 2 mock tests (free)
    free_test_ids = serializers.SerializerMethodField()

    class Meta:
        model = ExamPackage
        fields = '__all__'  # optionally: fields = ['id', 'name', ..., 'mock_tests', 'free_test_ids']

    def get_free_test_ids(self, obj):
        # Get first 2 mocktest IDs for this package, ordered by mocktest_number then id
        return list(
            MockTest.objects.filter(exam_package=obj)
                .order_by('mocktest_number', 'id')
                .values_list('id', flat=True)[:2]
        )
