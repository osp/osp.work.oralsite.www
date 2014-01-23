"""
Based on django-rcsfield
<https://code.google.com/p/django-rcsfield/>
Copyright (c) 2008, Arne Brodowski
All rights reserved.
Distributed under the New BSD License, see
<http://opensource.org/licenses/BSD-3-Clause> for the terms of use.
"""

from django.db import models, backend, connection, transaction
from django.conf import settings
from django.db.models.query import QuerySet

try:
    from django.db.models.query import GET_ITERATOR_CHUNK_SIZE
except ImportError:
    from django.db.models.query import CHUNK_SIZE as GET_ITERATOR_CHUNK_SIZE

from aawiki.backends import backend
#from aawiki.models import RCSModel


class RevisionQuerySet(QuerySet):
    """
    subclasses QuerySet to fetch older revisions from rcs backend

    """
    def __init__(self, model=None, revision='head', **kwargs):
        self._rev = revision
        super(RevisionQuerySet, self).__init__(model=model, **kwargs)


    def iterator(self):
        """
        wraps the original iterator and replaces versioned fields with the
        apropriate data from the given revision

        """
        for obj in super(RevisionQuerySet, self).iterator():
            #if isinstance(obj, RCSModel) and hasattr(self, '_rev') and not self._rev == 'head':
            if hasattr(self, '_rev') and not self._rev == 'head':
                file_path = getattr(obj, 'rcskey_format') % (obj._meta.app_label, obj.__class__.__name__, obj.id)
                try:
                    from aawiki.api import PageResource
                    import json
                    olddata = backend.fetch(file_path, self._rev)
                    resource = PageResource()
                    resource.fields['annotations'].full = True
                    bundle = resource.build_bundle(data=json.loads(olddata))
                    data = resource.full_hydrate(bundle)
                    obj = data.obj
                except:
                    # for now just ignore errors raised in the backend
                    # and return the content from the db (aka head revision)
                    pass
            yield obj


    def _clone(self, klass=None, setup=False, **kwargs):
        """
        It's evil that we overwrite _clone here, I will evaluate if there
        are better options.
        _clone is overwritten to append the current revision to the cloned
        queryset object.

        """
        c = super(RevisionQuerySet, self)._clone(klass=klass, setup=setup, **kwargs)
        c._rev = self._rev
        return c



class RevisionManager(models.Manager):
    """
    use this as default manager to get access to old revisions
    example usage::

        >>> from example.models import Entry
        >>> Entry.objects.get(pk=1).text
        ...
        >>> Entry.objects.rev(15).get(pk=1).text
        ...

    """
    def get_query_set(self, rev='head'):
        return RevisionQuerySet(self.model, revision=rev)

    def rev(self, rev='head'):
        return self.get_query_set(rev)
