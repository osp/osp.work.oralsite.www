from __future__ import absolute_import
# ^^^ The above is required if you want to import from the celery
# library.  If you don't have this then `from celery.schedules import`
# becomes `proj.celery.schedules` in Python 2.x since it allows
# for relative imports by default.


from django.shortcuts import redirect
from .tasks import process_pipeline


def process(request):
    url = request.GET.get('url')
    pipeline = request.GET.get('pipeline')
    pipeline = pipeline.split('|')
    task_id = process_pipeline(url=url, pipeline=pipeline)
    return redirect('celery-task_status', task_id=task_id)
