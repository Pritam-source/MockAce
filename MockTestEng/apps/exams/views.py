from django.shortcuts import render
from rest_framework import viewsets, generics, status
from .models import ExamPackage, MockTest, Question, TestAttempt, UserAnswer
from .serializers import ExamPackageSerializer, MockTestSerializer, QuestionSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.subscriptions.models import Subscription
from django.utils import timezone

class ExamPackageListView(generics.ListAPIView):
    queryset = ExamPackage.objects.filter(is_active=True)
    serializer_class = ExamPackageSerializer

class MockTestViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MockTest.objects.all()
    serializer_class = MockTestSerializer

class QuestionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer

class StartTestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, mock_test_id):
        try:
            mock_test = MockTest.objects.get(id=mock_test_id)
        except MockTest.DoesNotExist:
            return Response({'error': 'MockTest not found.'}, status=404)
        exam_package = mock_test.exam_package

        # Get the IDs of the first two free tests for this package
        free_test_ids = list(MockTest.objects.filter(
            exam_package=exam_package
        ).order_by('mocktest_number', 'id').values_list('id', flat=True)[:2])

        # If the current mock_test.id is not free, require subscription
        if mock_test.id not in free_test_ids:
            has_access = Subscription.objects.filter(
                user=request.user,
                exam_package=exam_package,
                is_active=True
            ).exists()
            if not has_access:
                return Response({'error': 'You do not have access to this test.'}, status=403)

        # Get questions by new mapping (no ForeignKey!)
        questions = Question.objects.filter(
            package_id=mock_test.package_id,
            mocktest_number=mock_test.mocktest_number
        ).order_by("question_number")

        question_list = []
        for q in questions:
            question_list.append({
                'id': q.id,
                'question_text': q.question_text,
                'option_a': q.option_a,
                'option_b': q.option_b,
                'option_c': q.option_c,
                'option_d': q.option_d,
            })

        return Response({
            'mock_test': mock_test.title,
            'duration': mock_test.duration_minutes,
            'questions': question_list,
        })

class SubmitTestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, mock_test_id):
        user = request.user
        answers = request.data.get('answers', {})  # {question_id: "A", ...}

        try:
            mock_test = MockTest.objects.get(id=mock_test_id)
        except MockTest.DoesNotExist:
            return Response({'error': 'MockTest not found.'}, status=404)

        # Get or create a TestAttempt
        attempt, created = TestAttempt.objects.get_or_create(
            user=user, mock_test=mock_test,
            defaults={'submitted': False, 'score': 0}
        )
        if attempt.submitted:
            return Response({'error': 'Test already submitted.'}, status=400)

        correct = 0
        # Remove any previous answers for this attempt
        UserAnswer.objects.filter(attempt=attempt).delete()

        # Find the correct questions for this mock_test
        valid_questions = Question.objects.filter(
            package_id=mock_test.package_id,
            mocktest_number=mock_test.mocktest_number
        )
        valid_question_ids = set(valid_questions.values_list('id', flat=True))

        for qid, selected in answers.items():
            try:
                qid_int = int(qid)
            except (TypeError, ValueError):
                continue
            if qid_int not in valid_question_ids:
                continue
            question = valid_questions.get(id=qid_int)
            is_correct = (selected == question.correct_option)
            UserAnswer.objects.create(
                attempt=attempt,
                question=question,
                selected_option=selected,
                is_correct=is_correct
            )
            if is_correct:
                correct += 1

        attempt.score = correct
        attempt.submitted = True
        attempt.submitted_at = timezone.now()
        attempt.save()

        return Response({'status': 'submitted', 'score': correct})

class ResultView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, mock_test_id):
        user = request.user
        try:
            mock_test = MockTest.objects.get(id=mock_test_id)
        except MockTest.DoesNotExist:
            return Response({'error': 'MockTest not found.'}, status=404)
        
        try:
            attempt = TestAttempt.objects.get(user=user, mock_test=mock_test)
        except TestAttempt.DoesNotExist:
            return Response({'error': 'No test attempt found.'}, status=404)
        
        if not attempt.submitted:
            return Response({'error': 'Test not submitted yet.'}, status=400)

        # Get all questions for the test (no FK, use mapping)
        questions = Question.objects.filter(
            package_id=mock_test.package_id,
            mocktest_number=mock_test.mocktest_number
        ).order_by("question_number")
        # Get all user answers for this attempt, indexed by question id
        user_answers = {ua.question_id: ua for ua in UserAnswer.objects.filter(attempt=attempt)}
        answers_report = []

        for q in questions:
            ua = user_answers.get(q.id)
            answers_report.append({
                'question': q.question_text,
                'option_a': q.option_a,
                'option_b': q.option_b,
                'option_c': q.option_c,
                'option_d': q.option_d,
                'selected': ua.selected_option if ua else "",      # "" if not attempted
                'correct_option': q.correct_option,
                'is_correct': ua.is_correct if ua else False,
                'explanation': q.explanation,
            })

        total_questions = questions.count()
        correct = sum(ua.is_correct for ua in user_answers.values())
        attempted = len(user_answers)

        return Response({
            'test': mock_test.title,
            'score': correct,
            'total': total_questions,
            'attempted': attempted,
            'answers_report': answers_report
        })
