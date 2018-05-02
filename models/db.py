# -*- coding: utf-8 -*-

# This scaffolding model makes your app work on Google App Engine too
# File is released under public domain and you can use without limitations

if request.global_settings.web2py_version < "2.14.1":
    raise HTTP(500, "Requires web2py 2.13.3 or newer")

# if SSL/HTTPS is properly configured and you want all HTTP requests to
# be redirected to HTTPS, uncomment the line below:
# request.requires_https()

# app configuration made easy. Look inside private/appconfig.ini
from gluon.contrib.appconfig import AppConfig

# once in production, remove reload=True to gain full speed
myconf = AppConfig(reload=True)

if not request.env.web2py_runtime_gae:
    # if NOT running on Google App Engine use SQLite or other DB
    db = DAL(myconf.get('db.uri'),
             pool_size=myconf.get('db.pool_size'),
             migrate_enabled=myconf.get('db.migrate'),
             check_reserved=['all'])
    # I like to keep the session in the db.
    session.connect(request, response, db=db)
else:
    # connect to Google BigTable (optional 'google:datastore://namespace')
    db = DAL('google:datastore+ndb')
    # store sessions and tickets there
    session.connect(request, response, db=db)
    #
    # or store session in Memcache, Redis, etc.
    # from gluon.contrib.memdb import MEMDB
    # from google.appengine.api.memcache import Client
    # session.connect(request, response, db = MEMDB(Client()))

# by default give a view/generic.extension to all actions from localhost
# none otherwise. a pattern can be 'controller/function.extension'
response.generic_patterns = ['*'] if request.is_local else []

# choose a style for forms
response.formstyle = myconf.get('forms.formstyle')  # or 'bootstrap3_stacked' or 'bootstrap2' or other
response.form_label_separator = myconf.get('forms.separator') or ''

# (optional) optimize handling of static files
# response.optimize_css = 'concat,minify,inline'
# response.optimize_js = 'concat,minify,inline'

# (optional) static assets folder versioning
# response.static_version = '0.0.0'

# Here is sample code if you need for
# - email capabilities
# - authentication (registration, login, logout, ... )
# - authorization (role based authorization)
# - services (xml, csv, json, xmlrpc, jsonrpc, amf, rss)
# - old style crud actions
# (more options discussed in gluon/tools.py)

from gluon.tools import Auth, Service, PluginManager

# host names must be a list of allowed host names (glob syntax allowed)
auth = Auth(db, host_names=myconf.get('host.names'))
service = Service()
plugins = PluginManager()


auth.settings.extra_fields['auth_user'] = [
    Field('picture', 'upload', uploadfield='picture_file', writable=True),
    Field('picture_file', 'blob', writable=True)
]
# create all tables needed by auth if not custom tables
auth.define_tables(username=False, signature=False)
def get_user_id():
    return auth.user.id if auth.user is not None else None

db.define_table('address',
                Field('LON', type='double'),
                Field('LAT', type='double'),
                Field('number_', type='integer'),
                Field('street', type='string'),
                Field('unit', type='string'),
                Field('city', type='string'),
                Field('district', type='string'),
                Field('region', type='string'),
                Field('postcode', type='string'),
                Field('state_', type='string'),
                )
# something about this feels off to me and I can't quite place it
db.define_table('rental_group',
                Field('group_id'),
                Field('group_member', db.auth_user),  #should be an auth_user
                Field('percent_of_rent'),
                Field('is_active', type='boolean'),    # is a user active in the group or not
                Field('joined_date'),               # when a user joined the group
                Field('left_date')                  # when a user left the group
                )

# in real life there are different types of properties
# e.g., apartments, houses, flats, maybe just a room
# as of now, i think these should be rows in the database, not columns
# I might be wrong about that
db.define_table('property_type',
                Field('p_type', type='string')
                )

# why not have the option to record the history of a property
# over time.
# this will probably go unused for the project, but I was just
# thinking about it
#defined up here, extened later to deal with cyclic dependencies
db.define_table('rental_history')



db.define_table('property',
                Field('who_rents', 'reference rental_group', readable=False, writable=False),   # This feels wrong, not sure it will work
                Field('property_owner', db.auth_user, default=get_user_id(), readable=False, writable=False),    #should be an auth_user
                Field('address', db.address, unique=True),
                Field('max_occupants', type='integer'),
                Field('number_of_bedrooms', type='integer'),
                Field('number_of_bathrooms', type='integer'),
                Field('property_type', db.property_type),     #db.property_type
                Field('proof_ownership'),
                Field('price_per_month'),
                Field('history', db.rental_history)    #db.rental_history
                )


# users can 'like' a property
db.define_table('liked_properties',
                Field('property', db.property),          #db.property
                Field('user_who_liked', db.auth_user)
                )
auth.settings.extra_fields['auth_user'] = [
    Field('property', db.property),  # db.property
    Field('rental_group', db.rental_group)  # db.rental_group

    ]







# configure email
mail = auth.settings.mailer
mail.settings.server = 'logging' if request.is_local else myconf.get('smtp.server')
mail.settings.sender = myconf.get('smtp.sender')
mail.settings.login = myconf.get('smtp.login')
mail.settings.tls = myconf.get('smtp.tls') or False
mail.settings.ssl = myconf.get('smtp.ssl') or False

# configure auth policy
auth.settings.registration_requires_verification = False
auth.settings.registration_requires_approval = False
auth.settings.reset_password_requires_verification = True

# More API examples for controllers:
#
# >>> db.mytable.insert(myfield='value')
# >>> rows = db(db.mytable.myfield == 'value').select(db.mytable.ALL)
# >>> for row in rows: print row.id, row.myfield

######################
# Logging
import logging, sys
FORMAT = "%(asctime)s %(levelname)s %(process)s %(thread)s %(funcName)s():%(lineno)d %(message)s"
logging.basicConfig(stream=sys.stderr)
logger = logging.getLogger(request.application)
logger.setLevel(logging.INFO)

# Let's log the request.
logger.info("====> Request: %r %r %r %r" % (request.env.request_method, request.env.path_info, request.args, request.vars))