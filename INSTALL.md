This file gives the instructions to install Oralsite on Debian GNU/Linux and its
derivatives (Ubuntu, Mint, etc.).


# Install python-dev, libjpeg and libpng

This is required by Pillow, the python library that deals with images, used in
the filters (see bellow). If you don't, Pillow will fail to compile. On Debian
based OS, you can install them by
running

    sudo apt-get update
    sudo apt-get install python-dev libjpeg-dev libpng-dev


# Install a message broker

This is required to run the resource filters. The filters task is to cache and
transform Http resources, while keeping a link to the original resource. It may
be used for embedding a video, or turning a colored image into Black
and White directly from the wiki. We advise to use Rabbitmq. To install it, see
<http://www.rabbitmq.com/install-debian.html#apt>.

Once install, start the message broker.

    sudo /etc/init.d/rabbitmq start


# Clone the repository

If you read this, you have most likely already done this.

    git clone git@git.constantvzw.org:osp.work.oralsite.www.git


# Install the python dependencies in a virtualenv

This is the preferred method as it installs everything in an isolated
environment. The requirements.txt file contains all the python depencies, which
will be install automatically with the code below.

    sudo apt-get install python-virtualenv
    virtualenv --no-site-packages venv
    source venv/bin/activate
    pip install -r requirements.txt


# Copy and customize the local settings

The file `oralsite/local_settings.py` contains the settings that may vary from
one machine to an other. It completes the settings found in
`oralsite/settings.py`.

    cp oralsite/local_settings.example.py oralsite/local_settings.py
    vim oralsite/local_settings.py

The file contains default values to run the project with Django devellopment
server. You only need to set the `SECRET_KEY` value (search for "django
generate secret key" in your favorite search engine).

Feel free to customize the other values. The list of all available settings can
be found at <https://docs.djangoproject.com/en/1.5/topics/settings/>


# Initialize the database

    python manage syncdb


# Create the media/cache directory

    mkdir -p media/cache

# Run the task queue

    celery -A oralsite worker -l info

# Run the projet

Open a new terminal to run the server and the task queue side-by-side.

    python manage runserver

Now point your browser at <http://localhost:8000/> and start editing the wiki.
