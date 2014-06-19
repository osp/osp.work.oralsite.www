# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Deleting field 'Annotation.height'
        db.delete_column(u'aawiki_annotation', 'height')

        # Deleting field 'Annotation.top'
        db.delete_column(u'aawiki_annotation', 'top')

        # Deleting field 'Annotation.width'
        db.delete_column(u'aawiki_annotation', 'width')

        # Deleting field 'Annotation.left'
        db.delete_column(u'aawiki_annotation', 'left')


    def backwards(self, orm):
        # Adding field 'Annotation.height'
        db.add_column(u'aawiki_annotation', 'height',
                      self.gf('django.db.models.fields.IntegerField')(default=400),
                      keep_default=False)

        # Adding field 'Annotation.top'
        db.add_column(u'aawiki_annotation', 'top',
                      self.gf('django.db.models.fields.IntegerField')(default=10),
                      keep_default=False)

        # Adding field 'Annotation.width'
        db.add_column(u'aawiki_annotation', 'width',
                      self.gf('django.db.models.fields.IntegerField')(default=300),
                      keep_default=False)

        # Adding field 'Annotation.left'
        db.add_column(u'aawiki_annotation', 'left',
                      self.gf('django.db.models.fields.IntegerField')(default=10),
                      keep_default=False)


    models = {
        u'aawiki.annotation': {
            'Meta': {'object_name': 'Annotation'},
            'about': ('django.db.models.fields.URLField', [], {'max_length': '200', 'blank': 'True'}),
            'body': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'klass': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'page': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['aawiki.Page']"}),
            'style': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'title': ('django.db.models.fields.TextField', [], {'blank': 'True'})
        },
        u'aawiki.page': {
            'Meta': {'object_name': 'Page'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'introduction': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'klass': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'slug': ('django.db.models.fields.SlugField', [], {'max_length': '255'}),
            'style': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'stylesheet': ('django.db.models.fields.TextField', [], {'blank': 'True'})
        }
    }

    complete_apps = ['aawiki']