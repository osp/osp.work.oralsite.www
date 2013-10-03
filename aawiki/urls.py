from django.conf.urls import include, patterns, url
from tastypie.api import Api
from aawiki.views import PageDetailView
from aawiki.api import PageResource, AnnotationResource
from django.views.generic import RedirectView

v1_api = Api(api_name='v1')
v1_api.register(AnnotationResource())
v1_api.register(PageResource())


urlpatterns = patterns('',
    url(r'^api/', include(v1_api.urls)),
    url(r'^(?P<slug>[-_\w]+)/$', PageDetailView.as_view(), name='page-detail'),
    url(r'^$', RedirectView.as_view(url='Index/')),
)
