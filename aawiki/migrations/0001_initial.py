# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Page'
        db.create_table(u'aawiki_page', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('slug', self.gf('django.db.models.fields.SlugField')(max_length=255)),
            ('introduction', self.gf('django.db.models.fields.TextField')(blank=True)),
        ))
        db.send_create_signal(u'aawiki', ['Page'])

        # Adding model 'Annotation'
        db.create_table(u'aawiki_annotation', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('page', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['aawiki.Page'])),
            ('about', self.gf('django.db.models.fields.URLField')(max_length=200, blank=True)),
            ('top', self.gf('django.db.models.fields.IntegerField')(default=10)),
            ('left', self.gf('django.db.models.fields.IntegerField')(default=10)),
            ('width', self.gf('django.db.models.fields.IntegerField')(default=300)),
            ('height', self.gf('django.db.models.fields.IntegerField')(default=400)),
            ('body', self.gf('django.db.models.fields.TextField')(blank=True)),
        ))
        db.send_create_signal(u'aawiki', ['Annotation'])


    def backwards(self, orm):
        # Deleting model 'Page'
        db.delete_table(u'aawiki_page')

        # Deleting model 'Annotation'
        db.delete_table(u'aawiki_annotation')


    models = {
        u'aawiki.annotation': {
            'Meta': {'object_name': 'Annotation'},
            'about': ('django.db.models.fields.URLField', [], {'max_length': '200', 'blank': 'True'}),
            'body': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'height': ('django.db.models.fields.IntegerField', [], {'default': '400'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'left': ('django.db.models.fields.IntegerField', [], {'default': '10'}),
            'page': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['aawiki.Page']"}),
            'top': ('django.db.models.fields.IntegerField', [], {'default': '10'}),
            'width': ('django.db.models.fields.IntegerField', [], {'default': '300'})
        },
        u'aawiki.page': {
            'Meta': {'object_name': 'Page'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'introduction': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'slug': ('django.db.models.fields.SlugField', [], {'max_length': '255'})
        }
    }

    complete_apps = ['aawiki']