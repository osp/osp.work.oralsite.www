import os
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

__all__ = ('backend')

RCS_BACKEND = getattr(settings, 'RCS_BACKEND', 'dummy')

def get_backend(import_path):
    if not '.' in import_path:
        import_path = "aawiki.backends.%s" % import_path
    try:
        mod = __import__(import_path, {}, {}, [''])
    except ImportError, e_user:
        # No backend found, display an error message and a list of all
        # bundled backends.
        backend_dir = __path__[0]
        available_backends = [f.split('.py')[0] for f in os.listdir(backend_dir) if not f.startswith('_') and not f.startswith('.') and not f.endswith('.pyc')]
        available_backends.sort()
        if RCS_BACKEND not in available_backends:
            raise ImproperlyConfigured("%s isn't an available revision control (rcsfield) backend. Available options are: %s" % \
                                        (RCS_BACKEND, ', '.join(map(repr, available_backends))))
        # if the RCS_BACKEND is available in the backend directory
        # and an ImportError is raised, don't suppress it
        else:
            raise
    try:
        return getattr(mod, 'rcs')
    except AttributeError:
        raise ImproperlyConfigured('Backend "%s" does not define a "rcs" instance.' % import_path)

backend = get_backend(RCS_BACKEND)
