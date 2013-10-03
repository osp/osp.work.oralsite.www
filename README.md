# Oralsite Django Project

## Prerequisites

- python &gt;= 2.6
- pip
- virtualenv

## Installation

### Creating the environment

Create a virtual python environment for the project.
If you're not using virtualenv you may skip this step.

```bash
virtualenv --no-site-packages oralsite-env
cd oralsite-env
source bin/activate
```

### Clone the code

```bash
git clone git@git.constantvzw.org:/osp.work.oralsite.www.git oralsite
```

### Install the requirements

```bash
cd oralsite
pip install -r requirements.txt
```

### Configure the project

```bash
cp oralsite/local_settings.example.py oralsite/local_settings.py
vi oralsite/local_settings.py
```

### Synchronize the database

```bash
python manage.py syncdb
```

## Run the project

```bash
python manage.py runserver
```

Navigate to <http://localhost:8000/admin/>. Create a first page with slug `Index` manually at <http://localhost:8000/admin/aawiki/page/add/>.

Open your browser at <http://localhost:8000>.
