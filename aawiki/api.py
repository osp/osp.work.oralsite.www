# -*- coding: utf-8 -*-

from django.contrib.auth.models import AnonymousUser, User
from django.conf.urls import url
from django.core.urlresolvers import reverse

from guardian.shortcuts import assign_perm

from tastypie import fields
from tastypie.authentication import SessionAuthentication
from tastypie.authorization import Authorization
from tastypie.resources import ModelResource, ALL, ALL_WITH_RELATIONS

from tastypie.utils import trailing_slash

from aawiki.models import Annotation, Page
from aawiki.authorization import get_user, get_serialized_perms, PerUserAuthorization, PerPageAuthorization, PerAnnotationAuthorization

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
    annotations = fields.ToManyField('aawiki.api.AnnotationResource', 'annotation_set', null=True, blank=True )

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
        Add all permissions for current page
        """
        bundle.data['user'] =  get_user(bundle).id # reverse('api_dispatch_detail', kwargs={'resource_name': 'user', 'api_name':'v1', 'pk': get_user(bundle).id })
        bundle.data['permissions'] = get_serialized_perms(bundle.obj)
        return bundle

    def obj_create(self, bundle, **kwargs):
        """
        If a new page object is created, create the necessary permissions
        
        cf http://stackoverflow.com/questions/10070173/tastypie-obj-create-how-to-use-newly-created-object 
        """
        bundle = super(PageResource, self).obj_create(bundle, **kwargs)
        user = get_user(bundle)
        
        anonymous_user = User.objects.get(pk=-1)
        
        assign_perm('aawiki.view_page', user, bundle.obj)
        if user.id != -1:
            # if the current user is not the anonymous user
            assign_perm('aawiki.view_page', anonymous_user, bundle.obj)
        assign_perm('aawiki.change_page', user, bundle.obj)
        assign_perm('aawiki.administer_page', user, bundle.obj)
        
        return bundle
