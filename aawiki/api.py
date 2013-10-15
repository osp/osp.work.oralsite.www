# -*- coding: utf-8 -*-

from django.contrib.auth.models import AnonymousUser, User
from django.conf.urls import url
from django.core.urlresolvers import reverse

from tastypie import fields
from tastypie.authentication import SessionAuthentication
from tastypie.authorization import Authorization
from tastypie.resources import ModelResource, ALL, ALL_WITH_RELATIONS

from aawiki.models import Annotation, Page
from aawiki.authorization import PerPageAuthorization, PerAnnotationAuthorization

class UserResource(ModelResource):
    class Meta:
        resource_name = 'user'
        queryset = User.objects.all()
        excludes = ['email', 'password', 'is_active', 'is_staff', 'is_superuser']
        authentication = SessionAuthentication()

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
        if hasattr(bundle.request, 'user') and not isinstance(bundle.request.user, AnonymousUser):
            bundle.data['user'] =  bundle.request.user.id # reverse('api_dispatch_detail', kwargs={'resource_name': 'user', 'api_name':'v1', 'pk': bundle.request.user.id })
        return bundle
