This file gives the instructions to install Oralsite on Debian GNU/Linux and its
derivatives (Ubuntu, Mint, etc.).


# Install Node.js

The version shipped with package managers is often old, so we have been
compiling it from sources instead. This step is required to use the Less CSS
compiler used in Django Compressor.

    mkdir -p src && cd src
    wget http://nodejs.org/dist/v0.10.25/node-v0.10.25.tar.gz
    tar zxvf node-v0.10.25.tar.gz
    cd node-v0.10.25
    ./configure --prefix /usr/local/
    make
    sudo make install


# Install the Less CSS compiler

    sudo npm install -g less

If you get a _registry error parsing json_, try using a mirror.

    sudo npm --registry http://registry.npmjs.eu/ install -g less


# Install python-dev, libjpeg and libpng

This is required by Pillow, the python library that deals with images, used in
the filters (see bellow). If you don't, Pillow will fail to compile. On Debian
based OS, you can install them by running

    sudo apt-get update
    sudo apt-get install python-dev libjpeg-dev libpng-dev

# Clone the repository

If you read this, you have most likely already done this.

    git clone git@git.constantvzw.org:osp.work.oralsite.www.git


# Install the python dependencies in a virtualenv

This is the preferred method as it installs everything in an isolated
environment. The requirements.txt file contains all the python depencies, which
will be installed automatically with the code below.

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

The file contains default values to run the project with Django development
server. You only need to set the `SECRET_KEY` value (search for "django
generate secret key" in your favorite search engine).

Feel free to customize the other values. The list of all available settings can
be found at <https://docs.djangoproject.com/en/1.5/topics/settings/>


# Initialize the database

    python manage syncdb


# Create the media/cache directory

    mkdir -p media/cache

# Run the projet

Run the server.

    python manage runserver

Now point your browser at <http://localhost:8000/> and start editing the wiki.
