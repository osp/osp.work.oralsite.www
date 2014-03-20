# Local settings for oralsite project.
LOCAL_SETTINGS = True
from settings import *

DEBUG = True


# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/home/media/media.lawrence.com/media/"
MEDIA_ROOT = os.path.join(PROJECT_DIR, 'media')

# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/home/media/media.lawrence.com/static/"
STATIC_ROOT = ''


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3', # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': os.path.join(PROJECT_DIR, 'oralsite.db'), # Or path to database file if using sqlite3.
        'USER': '',                             # Not used with sqlite3.
        'PASSWORD': '',                         # Not used with sqlite3.
        'HOST': '',                             # Set to empty string for localhost. Not used with sqlite3.
        'PORT': '',                             # Set to empty string for default. Not used with sqlite3.
    }
}


# Django Celery with Rabbitmq
BROKER_URL = 'amqp://guest:guest@localhost:5672//'
CELERY_RESULT_BACKEND = 'djcelery.backends.database:DatabaseBackend'
CELERY_ALWAYS_EAGER = False


# aawiki versioning
RCS_BACKEND = 'gitcore' # uses git-python
# Conflicts with the project git repository
# Makes sure to set the GIT_REPO_PATH value to a path outside of the project repository!
GIT_REPO_PATH = os.path.join(PROJECT_DIR, '../../osp.work.oralsite.www.repository') # where the repo should be created


# Make this unique, and don't share it with anybody.
SECRET_KEY = ''


# This is used for aafilters task, to store locks
# Don't use the simple MemLocCache it will not be able to retrieve values
# between threads!
# TODO: use memcached or redis (as suggested on #celery@freenode)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.filebased.FileBasedCache',
        'LOCATION': '/tmp/django_cache',
    }
}


if DEBUG:
    # Show emails in the console during developement.
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
