# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Deleting field 'Page.id'
        db.delete_column(u'aawiki_page', u'id')


        # Changing field 'Page.slug'
        db.alter_column(u'aawiki_page', 'slug', self.gf('django.db.models.fields.SlugField')(max_length=255, primary_key=True))
        # Adding unique constraint on 'Page', fields ['slug']
        db.create_unique(u'aawiki_page', ['slug'])


    def backwards(self, orm):
        # Removing unique constraint on 'Page', fields ['slug']
        db.delete_unique(u'aawiki_page', ['slug'])


        # User chose to not deal with backwards NULL issues for 'Page.id'
        raise RuntimeError("Cannot reverse this migration. 'Page.id' and its values cannot be restored.")
        
        # The following code is provided here to aid in writing a correct migration        # Adding field 'Page.id'
        db.add_column(u'aawiki_page', u'id',
                      self.gf('django.db.models.fields.AutoField')(primary_key=True),
                      keep_default=False)


        # Changing field 'Page.slug'
        db.alter_column(u'aawiki_page', 'slug', self.gf('django.db.models.fields.SlugField')(max_length=255))

    models = {
        u'aawiki.annotation': {
            'Meta': {'object_name': 'Annotation'},
            'about': ('django.db.models.fields.URLField', [], {'max_length': '200', 'blank': 'True'}),
            'body': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'klass': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'page': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['aawiki.Page']"}),
            'page_slug': ('django.db.models.fields.SlugField', [], {'max_length': '255'}),
            'style': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'title': ('django.db.models.fields.TextField', [], {'blank': 'True'})
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