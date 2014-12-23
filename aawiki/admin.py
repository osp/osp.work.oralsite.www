from django.contrib import admin
from aawiki.models import Annotation, Page
from guardian.admin import GuardedModelAdmin


class AnnotationInline(admin.StackedInline):
    extra = 0
    model = Annotation


class AnnotationAdmin(admin.ModelAdmin):
    search_fields = ['title', 'body']


class PageAdmin(GuardedModelAdmin):
    inlines = [
        AnnotationInline,
    ]


admin.site.register(Annotation, AnnotationAdmin)
admin.site.register(Page, PageAdmin)
