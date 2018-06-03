# Define your tables below (or better in another model file) for example
#
# >>> db.define_table('mytable', Field('myfield', 'string'))
#
# Fields can be 'string','text','password','integer','double','boolean'
#       'date','time','datetime','blob','upload', 'reference TABLENAME'
# There is an implicit 'id integer autoincrement' field
# Consult manual for more options, validators, etc.

import datetime

def get_user_email():
    return auth.user.email if auth.user else None

db.define_table('listings',
                Field('user_email', default=get_user_email()),
                Field('address', default="411 Porter-Kresge Rd, Santa Cruz CA, 95064"),
                Field('bedrooms', default=1),
                Field('bathrooms', default=1),
                Field('listed_by', 'reference auth_user', default=auth.user_id),
                Field('image'),
                Field('listed_on', 'datetime', default=datetime.datetime.now),
                Field('property_type')
                )




# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)
