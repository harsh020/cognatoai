from django.contrib import admin

from susanoo.review.models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    model = Review
    list_display = ('id', 'created', 'status')
    ordering = ('-created', '-modified')
