from django.contrib import admin
from aawiki.models import Annotation, Page
from guardian.admin import GuardedModelAdmin

class AnnotationAdmin(admin.ModelAdmin):
    pass


class PageAdmin(GuardedModelAdmin):
    pass


admin.site.register(Annotation, AnnotationAdmin)
admin.site.register(Page, PageAdmin)
