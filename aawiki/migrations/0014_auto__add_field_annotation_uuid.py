# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'Annotation.uuid'
        db.add_column(u'aawiki_annotation', 'uuid',
                      self.gf('django.db.models.fields.SlugField')(default='', max_length=50, blank=True),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting field 'Annotation.uuid'
        db.delete_column(u'aawiki_annotation', 'uuid')


    models = {
        u'aawiki.annotation': {
            'Meta': {'object_name': 'Annotation'},
            'about': ('django.db.models.fields.URLField', [], {'max_length': '200', 'blank': 'True'}),
            'body': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'klass': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'page': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['aawiki.Page']"}),
            'style': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'title': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'uuid': ('django.db.models.fields.SlugField', [], {'max_length': '50', 'blank': 'True'})
        },
        u'aawiki.page': {
            'Meta': {'object_name': 'Page'},
            'introduction': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'klass': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'slug': ('django.db.models.fields.SlugField', [], {'max_length': '255', 'primary_key': 'True'}),
            'style': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'stylesheet': ('django.db.models.fields.TextField', [], {'blank': 'True'})
        }
    }

    complete_apps = ['aawiki']