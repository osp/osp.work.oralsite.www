# Oralsite Django Project

## Prerequisites

- python &gt;= 2.5
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
git clone <URL_TO_GIT_REPOSITORY> oralsite
```

### Install the requirements

```bash
cd oralsite
pip install -r requirements/common.txt
```

Depending on the your profile (development or production), install the extra
requirements.

In a development environment, run:

```bash
cd oralsite
pip install -r requirements/dev.txt
```
In a production environment, run:

```bash
cd oralsite
pip install -r requirements/prod.txt
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

Open you browser at <http://localhost:8000>.
