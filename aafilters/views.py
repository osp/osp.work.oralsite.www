from __future__ import absolute_import
# ^^^ The above is required if you want to import from the celery
# library.  If you don't have this then `from celery.schedules import`
# becomes `proj.celery.schedules` in Python 2.x since it allows
# for relative imports by default.


from django.shortcuts import redirect
from django.http import HttpResponse
from celery import chain
from .tasks import cache, bw


cmd = {
    'bw': bw,
}


def process(request):
    pipeline = request.GET.get('pipeline')
    url, filters = pipeline.split("|", 1)
    filters = filters.split("|")

    args = [cache.subtask(({'url': url},))] + [cmd[f].subtask() for f in filters]
    task = chain(*args).apply_async()

    return redirect('celery-task_status', task_id=task.id)
