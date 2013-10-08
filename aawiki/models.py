from django.db import models


class Page(models.Model):
    """Represents a wiki page"""
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255)
    
    def __unicode__(self):
        return self.name
    
    @models.permalink
    def get_absolute_url(self):
        return ('page-detail', (), {'slug': self.slug})
    
    class Meta:
        permissions = (
            ('view_page', 'View page'),
        )


class Annotation(models.Model):
    """Represent an annotation"""
    page = models.ForeignKey(Page)
    top = models.IntegerField(default=10)
    left = models.IntegerField(default=10)
    width = models.IntegerField(default=300)
    height = models.IntegerField(default=400)
    body = models.TextField(blank=True)
    
    def __unicode__(self):
        return self.body[0:100]
