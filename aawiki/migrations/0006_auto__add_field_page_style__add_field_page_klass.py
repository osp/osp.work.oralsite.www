# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'Page.style'
        db.add_column(u'aawiki_page', 'style',
                      self.gf('django.db.models.fields.TextField')(default='', blank=True),
                      keep_default=False)

        # Adding field 'Page.klass'
        db.add_column(u'aawiki_page', 'klass',
                      self.gf('django.db.models.fields.TextField')(default='', blank=True),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting field 'Page.style'
        db.delete_column(u'aawiki_page', 'style')

        # Deleting field 'Page.klass'
        db.delete_column(u'aawiki_page', 'klass')


    models = {
        u'aawiki.annotation': {
            'Meta': {'object_name': 'Annotation'},
            'about': ('django.db.models.fields.URLField', [], {'max_length': '200', 'blank': 'True'}),
            'body': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'height': ('django.db.models.fields.IntegerField', [], {'default': '400'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'klass': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'left': ('django.db.models.fields.IntegerField', [], {'default': '10'}),
            'page': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['aawiki.Page']"}),
            'style': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'title': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'top': ('django.db.models.fields.IntegerField', [], {'default': '10'}),
            'width': ('django.db.models.fields.IntegerField', [], {'default': '300'})
        },
        u'aawiki.page': {
            'Meta': {'object_name': 'Page'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'introduction': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'klass': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'slug': ('django.db.models.fields.SlugField', [], {'max_length': '255'}),
            'style': ('django.db.models.fields.TextField', [], {'blank': 'True'})
        }
    }

    complete_apps = ['aawiki']