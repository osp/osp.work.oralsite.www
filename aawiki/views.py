from django.shortcuts import render_to_response, redirect
from django.template import RequestContext

def page(request, slug, rev):
    wikified_slug = slug.strip().replace(" ", "_")
    if len(wikified_slug):
        wikified_slug = wikified_slug[0].upper() + wikified_slug[1:]
    if slug != wikified_slug:
        return redirect('page-detail', slug=wikified_slug)
    tpl_params = {}
    return render_to_response("aawiki/page_detail.html", tpl_params, context_instance = RequestContext(request))
