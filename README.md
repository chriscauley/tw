# The Timewalker's Curse

## Installation

Install node packages, create a python virtual env, and install python packages:

```
npm install
python -m venv .env
source .env/bin/activate
pip install -r requirements.txt
```

Clone `unrest.io` and yarn link it (I'm sorry for this step, I can't get this to build quite right through npm)

```
git clone https://github.io/chriscauley/unrest.io
cd unrest.io
yarn link
cd .. # back to this projects directory
yarn link unrest.io
```

Create a postgres database, migrate, install fixtures, and create a superuser.

```
createdb timewalker.io
python manage.py migrate
python manage.py loaddata fixtures/server.json
python manage.py createsuperuser
```