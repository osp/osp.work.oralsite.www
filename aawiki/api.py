from django.contrib.auth.models import AnonymousUser

from tastypie import fields
from tastypie.authorization import Authorization
from tastypie.resources import ModelResource
from aawiki.models import Annotation, Page
from aawiki.authorization import PerPageAuthorization, PerAnnotationAuthorization


class AnnotationResource(ModelResource):
    page = fields.ForeignKey('aawiki.api.PageResource', 'page')

    class Meta:
        queryset = Annotation.objects.all()
        resource_name = 'annotation'
        filtering = {
            "page": ('exact',)
        }
        authorization = PerAnnotationAuthorization()


class PageResource(ModelResource):
    annotations = fields.ToManyField('aawiki.api.AnnotationResource', 'annotation_set', null=True, blank=True, full=True)

    class Meta:
        queryset = Page.objects.all()
        resource_name = 'page'
        authorization = PerPageAuthorization()
    
    def dehydrate(self, bundle):
        if hasattr(bundle.request, 'user') and not isinstance(bundle.request.user, AnonymousUser):
            bundle.data['user'] = {'name' : bundle.request.user.username }
        return bundle
