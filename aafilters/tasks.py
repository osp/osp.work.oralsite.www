from celery import task
from PIL import Image 
from StringIO import StringIO
from django.conf import settings
import os
import requests


@task
def cache(url):
    bundle = {}
    bundle['url'] = "foo"
    return bundle

@task
def filter1(bundle):
    bundle['url'] = "bar"
    return bundle

@task
def filter2(bundle):
    bundle['url'] = "foobarbaz"
    return bundle

@task
def bw(bundle):
    request = requests.get(bundle['url'])
    image_file = Image.open(StringIO(request.content))
    image_file = image_file.convert('1')
    image_file.save(os.path.join(settings.MEDIA_ROOT, 'result.png'))
