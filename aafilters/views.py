from __future__ import absolute_import
# ^^^ The above is required if you want to import from the celery
# library.  If you don't have this then `from celery.schedules import`
# becomes `proj.celery.schedules` in Python 2.x since it allows
# for relative imports by default.

import os

from django.shortcuts import redirect
from .tasks import process_pipeline
from djcelery.views import task_status

def process(request, pipeline_string):
    """
    With a url like /filters/process/http://s2.lemde.fr/image/2012/05/09/644x322/1698586_3_83ef_francois-hollande-et-nicolas-sarkozy-durant-la_cc28a6e60a381054c901fecf8fe39886.jpg..bw.jpg
    
    Find:
    url = 'http://s2.lemde.fr/image/2012/05/09/644x322/1698586_3_83ef_francois-hollande-et-nicolas-sarkozy-durant-la_cc28a6e60a381054c901fecf8fe39886.jpg'
    extension = '.jpg'
    pipeline = '[u'bw']'
    
    And send it of to Celery
    """
    parts = pipeline_string.split('..')
    url = parts[0]
    pipeline = []
    if parts > 1:
        pipeline = parts[1:]
        pipeline[-1], extension = os.path.splitext(pipeline[-1])
    print url, pipeline_string, extension
    if 'async' in request.GET:
        task_id = process_pipeline(url=url, pipeline=pipeline, target_ext=extension)
        return task_status(request, task_id=task_id)
    else:
        task_id = process_pipeline(url=url, pipeline=pipeline, target_ext=extension, synchronous=True)
    if 'info' in request.GET:
        return task_status(request, task_id=task_id)
    return redirect('processed', path=pipeline_string)

