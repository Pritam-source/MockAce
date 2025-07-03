from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MockTestViewSet,
    QuestionViewSet,
    ExamPackageListView,
    StartTestView,
    SubmitTestView,
    ResultView,
)

router = DefaultRouter()
router.register(r'mock-tests', MockTestViewSet, basename='mock-test')
router.register(r'questions', QuestionViewSet, basename='question')
# Don't register ExamPackageListView with the router, since it's a ListAPIView

urlpatterns = [
    path('packages/', ExamPackageListView.as_view(), name='package-list'),
    path('start-test/<int:mock_test_id>/', StartTestView.as_view(), name='start-test'),
    path('submit/<int:mock_test_id>/', SubmitTestView.as_view(), name='submit-test'),
    path('result/<int:mock_test_id>/', ResultView.as_view(), name='result-view'),
    path('', include(router.urls)),
]
