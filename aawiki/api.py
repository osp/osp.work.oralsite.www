# -*- coding: utf-8 -*-

from django.contrib.auth.models import AnonymousUser, User
from django.conf.urls import url
from django.core.urlresolvers import reverse

from tastypie import fields
from tastypie.authentication import SessionAuthentication
from tastypie.authorization import Authorization
from tastypie.resources import ModelResource, ALL, ALL_WITH_RELATIONS

from tastypie.utils import trailing_slash

from aawiki.models import Annotation, Page
from aawiki.authorization import get_user, PerUserAuthorization, PerPageAuthorization, PerAnnotationAuthorization

class UserResource(ModelResource):
    class Meta:
        resource_name = 'user'
        queryset = User.objects.all()
        excludes = ['email', 'password', 'is_active', 'is_staff', 'is_superuser']
        authorization = PerUserAuthorization()

    def prepend_urls(self):
        """
        Allow negative primary key when requesting individual user
        (Django Guardian has the convention that there exists an AnonymousUser with id=-1)
        
        cf https://github.com/toastdriven/django-tastypie/pull/395/files
        """
        return [
                url(r"^(?P<resource_name>%s)/(?P<pk>-?\w[\w/-]*)%s$" % (self._meta.resource_name, trailing_slash()), self.wrap_view('dispatch_detail'), name="api_dispatch_detail"),
        ]

class AnnotationResource(ModelResource):
    page = fields.ForeignKey('aawiki.api.PageResource', 'page')

    class Meta:
        queryset = Annotation.objects.all()
        resource_name = 'annotation'
        filtering = {
            "page": ALL_WITH_RELATIONS
        }
        authorization = PerAnnotationAuthorization()
    
class PageResource(ModelResource):
    annotations = fields.ToManyField('aawiki.api.AnnotationResource', 'annotation_set', null=True, blank=True, full=True)

    class Meta:
        queryset = Page.objects.all()
        resource_name = 'page'
        authorization = PerPageAuthorization()
        detail_uri_name = 'slug'
        filtering = {
            "slug": ALL
        }
    
    def prepend_urls(self):
        return [
            url(r"^(?P<resource_name>%s)/(?P<slug>[\w\d_.-]+)/$" % self._meta.resource_name, self.wrap_view('dispatch_detail'), name="api_dispatch_detail"),
        ]
    
    def dehydrate(self, bundle):
        """
        Add a link to the currently logged in user
        """
        bundle.data['user'] =  get_user(bundle).id # reverse('api_dispatch_detail', kwargs={'resource_name': 'user', 'api_name':'v1', 'pk': get_user(bundle).id })
        return bundle
