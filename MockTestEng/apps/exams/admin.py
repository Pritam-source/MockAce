from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from .models import ExamPackage, MockTest, Question
from import_export import resources
from .models import TestAttempt, UserAnswer

# Import-export customization for Question
class QuestionResource(resources.ModelResource):
    class Meta:
        model = Question
        # Optionally specify fields:
        # fields = ('id', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option', 'explanation', 'mock_test')

@admin.register(Question)
class QuestionAdmin(ImportExportModelAdmin):   # <-- NOT ModelAdmin
    list_display = ('package_id', 'mocktest_number', 'question_number', 'question_text')
    search_fields = ('question_text',)
    list_filter = ('package_id', 'mocktest_number')
    ordering = ('package_id', 'mocktest_number', 'question_number')


@admin.register(MockTest)
class MockTestAdmin(admin.ModelAdmin):
    list_display = ('package_id', 'mocktest_number', 'title', 'duration_minutes', 'is_active', 'exam_package')
    search_fields = ('title', 'package_id')
    list_filter = ('package_id', 'is_active', 'exam_package')



@admin.register(ExamPackage)
class ExamPackageAdmin(admin.ModelAdmin):
    list_display = ('package_id', 'name', 'price', 'num_tests', 'is_active')
    search_fields = ('name', 'package_id')
    list_filter = ('is_active',)



@admin.register(TestAttempt)
class TestAttemptAdmin(admin.ModelAdmin):
    list_display = ('user', 'mock_test', 'score', 'submitted', 'submitted_at')
    list_filter = ('user', 'mock_test', 'submitted')
    search_fields = ('user__username', 'mock_test__title')

@admin.register(UserAnswer)
class UserAnswerAdmin(admin.ModelAdmin):
    list_display = ('attempt', 'question', 'selected_option', 'is_correct')
    list_filter = ('is_correct', 'question', 'attempt')
    search_fields = ('attempt__user__username', 'question__question_text')
