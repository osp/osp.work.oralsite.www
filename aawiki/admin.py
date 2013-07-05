from django.contrib import admin
from aawiki.models import Annotation, Page


class AnnotationAdmin(admin.ModelAdmin):
    pass


class PageAdmin(admin.ModelAdmin):
    pass


admin.site.register(Annotation, AnnotationAdmin)
admin.site.register(Page, PageAdmin)
