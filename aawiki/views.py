from django.views.generic.detail import DetailView
from aawiki.models import Page


class PageDetailView(DetailView):
    model = Page
