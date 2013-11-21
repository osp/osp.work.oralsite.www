from django.shortcuts import redirect
from django.http import HttpResponse
from celery import chain
from tasks import filter1, filter2, bw


cmd = {
    'filter1': filter1,
    'filter2': filter2,
    'bw': bw,
}


def process(request):
    pipeline = request.GET.get('pipeline')
    url, filters = pipeline.split("|", 1)
    filters = filters.split("|")

    args = []
    for i, f in enumerate(filters):
        subtask = cmd[f].subtask
        if not i:
            subtask = subtask(({'url': url},))
        else:
            subtask = subtask()
        args.append(subtask)

    task = chain(*args).apply_async()

    return redirect('celery-task_status', task_id=task.id)
