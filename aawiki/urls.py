from django.conf.urls import include, patterns, url
from tastypie.api import Api
from django.views.generic.base import TemplateView
from aawiki.api import SiteResource, PageResource, AnnotationResource, UserResource
from django.views.generic import RedirectView

v1_api = Api(api_name='v1')
v1_api.register(SiteResource())
v1_api.register(AnnotationResource())
v1_api.register(PageResource())
v1_api.register(UserResource())


urlpatterns = patterns('',
    url(r'^api/v1/user/me/', 'aawiki.api.me'),
    url(r'^api/', include(v1_api.urls)),
    url(r'^tests/$', TemplateView.as_view(template_name='aawiki/tests.html'), name='tests'),
    url(r'^pages/', TemplateView.as_view(template_name='aawiki/page_detail.html'), name='page-detail'),
)
