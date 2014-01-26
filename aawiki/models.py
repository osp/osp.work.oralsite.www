from django.db import models
from aawiki.backends import backend
from aawiki.manager import RevisionManager


class RCSModel(models.Model):
    """
    Base class for versioned models
    """
    class Meta:
        abstract = True

    rcskey_format = "%s/%s/%s.json"
    objects = RevisionManager()

    def get_key(self):
        format_args = (self._meta.app_label,
                       self.__class__.__name__,
                       self.pk)
        return self.rcskey_format % format_args

    def get_revisions(self):
        return backend.get_revisions(self.get_key())

    def serialize(self):
        """
        Serializes the model using Tastypie
        """
        # TODO: make sure pretty printed is enforced here as it now relies on
        # tastypie serializer
        from aawiki.api import PageResource
        resource = PageResource()
        resource.fields['annotations'].full = True
        bundle = resource.build_bundle(obj=self)
        data = resource.full_dehydrate(bundle)
        return resource.serialize(None, data, 'application/json')

    def save(self, *args, **kwargs):
        super(RCSModel, self).save(*args, **kwargs)
        key = self.get_key()
        backend.commit(key, self.serialize())


class Page(RCSModel):
    """Represents a wiki page"""
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255)
    introduction = models.TextField(blank=True)

    def __unicode__(self):
        return self.name

    @models.permalink
    def get_absolute_url(self):
        return ('page-detail', (), {'slug': self.slug})

    class Meta:
        permissions = (
            ('view_page', 'Can view page'),
            ('administer_page', 'Can administer page')
        )


class Annotation(models.Model):
    """Represent an annotation"""
    page = models.ForeignKey(Page)
    about = models.URLField(blank=True)
    top = models.IntegerField(default=10)
    left = models.IntegerField(default=10)
    width = models.IntegerField(default=300)
    height = models.IntegerField(default=400)
    body = models.TextField(blank=True)

    def __unicode__(self):
        return self.body[0:100]
