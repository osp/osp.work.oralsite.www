import os.path
from fabric.api import run, local, put, cd, sudo, env, prefix
from fabric.contrib.console import confirm


env.hosts = ['sarma@sarma.be']
env.path = '/srv/sarma_data01/www/apps/be.oralsite'


def deploy():
    """deploys to previously setup environment"""
    path_activate = '/srv/sarma_data01/www/venvs/be.oralsite/bin/activate'
    path_wsgi = '/srv/sarma_data01/www/apps/be.oralsite/oralsite/wsgi.py'

    with cd(env.path):
        run('git pull origin master')

        with prefix('source %s' % path_activate):
            run('pip install -r requirements.txt')
            run('python manage.py collectstatic --noinput')

    run('touch %s' % path_wsgi)


def download():
    """synchronizes the local db from the remote one"""
    local('scp sarma@sarma.be:/srv/sarma_data01/www/db/be.oralsite/oralsite.db oralsite/')
