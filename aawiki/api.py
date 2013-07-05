from tastypie import fields
from tastypie.authorization import Authorization
from tastypie.resources import ModelResource
from aawiki.models import Annotation, Page


class AnnotationResource(ModelResource):
    page = fields.ForeignKey('aawiki.api.PageResource', 'page')

    class Meta:
        queryset = Annotation.objects.all()
        resource_name = 'annotation'
        authorization= Authorization()


class PageResource(ModelResource):
    annotations = fields.ToManyField('aawiki.api.AnnotationResource', 'annotation_set', null=True, blank=True, full=True)

    class Meta:
        queryset = Page.objects.all()
        resource_name = 'page'
        authorization= Authorization()
