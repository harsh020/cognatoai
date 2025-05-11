import os
import random
from pathlib import Path

from django.core.files.storage import default_storage
from django.utils.deconstruct import deconstructible
from django.conf import settings
from slugify import slugify

import razorpay

@deconstructible
class PathAndRename(object):

    def __init__(self, sub_path):
        self.path = sub_path

    def __call__(self, instance, filename):
        ext = filename.split('.')[-1]
        filename = f'{instance.id}.{ext}'
        return os.path.join(self.path, instance.post.id, filename)


def upload_to_blob(file, filename, path):
    dirs = Path(os.path.join(settings.MEDIA_ROOT, path, filename))
    dirs.parent.mkdir(exist_ok=True, parents=True)

    with default_storage.open(str(os.path.join(path, filename)), 'wb+') as destination:
        for chunk in file.chunks():
            destination.write(chunk)

    return f'{settings.MEDIA_URL}{path}/'


def get_payment_provider():
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


def generate_otp(length):
    otp = ""
    for _ in range(length):
        otp += str(random.randint(0, 9))
    return otp