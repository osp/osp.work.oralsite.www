import os
import requests

from celery import task
from PIL import Image 
from StringIO import StringIO
from urlparse import urlsplit
from django.conf import settings
from settings import CACHE_PATH


# NOTE: Should filters accept and return mimetypes?
# NOTE: Should we pass a bundle to the filters so we can attach methods like
# url2path? it would look like this then:
class Bundle(object):
    def __init__(self):
        self.url = None


def url2path(url):
    r = urlsplit(url)
    ret = r.netloc + '/' + r.path
    if r.query:
        ret += '?' + r.query
    if r.fragment:
        ret += '#' + r.query
    return ret


@task
def cache(bundle):
    full_path = os.path.join(CACHE_PATH, url2path(bundle['url']))

    if not os.path.exists(full_path):
        r = requests.get(bundle['url'], stream=True)
        if r.status_code == 200:
            path, filename = os.path.split(full_path)
            if not os.path.exists(path):
                os.makedirs(path)

            with open(full_path, 'wb') as f:
                for chunk in r.iter_content(1024):
                    f.write(chunk)

    bundle['path'] = full_path
    return bundle


@task
def bw(bundle):
    image_file = Image.open(bundle['path'])
    image_file = image_file.convert('1')
    image_file.save(bundle['path'] + '..bw.png')
