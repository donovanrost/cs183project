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

def get_user_id():
    return auth.user.id if auth.user is not None else None



db.define_table('address',
                Field('street', type='string'),
                Field('city', type='string'),
                Field('zip', type='string'),
                Field('state_', type='string'),
                Field('hash_', type='string'),
                )

# something about this feels off to me and I can't quite place it
db.define_table('rental_group',
                Field('group_name'),
                Field('is_active', type='boolean', default=False),     # is a user active in the group or not
                Field('date_created'),                                 # when a user joined the group
                Field('is_editing', type='boolean', default=False)     # Like the memo thing from hw3
                )


db.define_table('group_member',
                Field('user_email'),
                Field('group_id', 'reference rental_group'),
                Field('is_pending', type='boolean', default=False),
                Field('is_active', type='boolean', defautl=False)
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
                Field('property_owner', db.auth_user, default=get_user_id(), readable=False, writable=False),    #should be an auth_user
                Field('street', type='string',required=False),
                Field('city', type='string',required=False),
                Field('zip', type='string',required=False),
                Field('state_', type='string',required=False),
                Field('num_bedrooms', type='integer'),
                Field('num_fullbaths', type='integer'),
                Field('num_halfbaths', type='integer'),
                Field('property_type', db.property_type),     #db.property_type
                Field('proof_ownership'),
                Field('is_editing', type='boolean', default=False),
                Field('is_uploading', type='boolean', default=False),
                )

# users can 'like' a property
db.define_table('liked_properties',
                Field('user_email', default=get_user_email()),
                Field('property_id', 'reference property',),
                Field('isliked', 'boolean'),
                )

db.define_table('listings',
                Field('property_id', 'reference property'),
                Field('user_email', default=get_user_email()),
                Field('listed_on', 'datetime', default=datetime.datetime.now),
                )

db.define_table('property_images',
                Field('property_id', 'reference property'),
                Field('created_on', 'datetime', default=request.now),
                Field('image_url'),
                )

# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)


