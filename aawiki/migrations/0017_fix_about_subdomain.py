# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import DataMigration
from django.db import models

class Migration(DataMigration):

    def forwards(self, orm):
        "Write your forwards methods here."
        # Note: Don't use "from appname.models import ModelName".
        # Use orm.ModelName to refer to models in this application,
        # and orm['appname.ModelName'] for models in other applications.
        for a in orm.Annotation.objects.all():
            if a.about.startswith("http://dev.oralsite.be/"):
                a.about = a.about.replace("http://dev.oralsite.be/", "http://oralsite.be/")
                a.save()

    def backwards(self, orm):
        "Write your backwards methods here."
        for a in orm.Annotation.objects.all():
            if a.about.startswith("http://oralsite.be/"):
                a.about = a.about.replace("http://oralsite.be/", "http://dev.oralsite.be/")
                a.save()

    models = {
        u'aawiki.annotation': {
            'Meta': {'unique_together': "(('page', 'uuid'),)", 'object_name': 'Annotation'},
            'about': ('django.db.models.fields.URLField', [], {'max_length': '200', 'blank': 'True'}),
            'body': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'klass': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'page': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['aawiki.Page']"}),
            'style': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'title': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'uuid': ('django.db.models.fields.SlugField', [], {'max_length': '50'})
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
    symmetrical = True
