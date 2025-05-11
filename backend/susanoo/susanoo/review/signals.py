import threading

from django.db.models.signals import post_save
from django.dispatch import receiver

from rasengan.review.engine import ReviewEngine
from susanoo.review.enums import ReviewStatus
from susanoo.review.models import Review

review_engine = ReviewEngine()


def _generate_review(review):
    review.status = ReviewStatus.IN_REVIEW
    review.save()

    try:
        response = review_engine.run(review)
        if response.output is None:
            raise ValueError
        review.review = response.output
        review.status = ReviewStatus.SUCCESSFUL
        review.save()
    except Exception:
        review.status = ReviewStatus.FAILED
        review.save()


@receiver(post_save, sender=Review)
def generate_review(sender, instance, created, **kwargs):
    if instance.status == ReviewStatus.PENDING:
        thread = threading.Thread(target=_generate_review, args=(instance,), daemon=True)
        thread.start()
