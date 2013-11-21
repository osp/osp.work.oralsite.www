from django.conf.urls import patterns, url


urlpatterns = patterns('aafilters.views',
    url(r'^process/$', 'process', name="process"),
)
