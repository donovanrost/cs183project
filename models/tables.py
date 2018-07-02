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
                )

# something about this feels off to me and I can't quite place it
db.define_table('rental_group',
                Field('group_name'),
                Field('is_active', type='boolean', default=False),     # is a user active in the group or not
                Field('date_created'),                                 # when a user joined the group
                Field('is_editing', type='boolean', default=False),   # Like the memo thing from hw3
                )

db.define_table('group_invitation',
                Field('group_id', 'reference rental_group'),
                Field('sender_id', 'reference auth_user'),
                Field('receiver_id', 'reference auth_user'),
                Field('is_accepted', 'boolean', default=False),
                Field('responded_to', 'boolean', default=False),
                )


db.define_table('group_member',
                Field('user_id', 'reference auth_user'),
                Field('group_id', 'reference rental_group'),
                Field('is_active', type='boolean', defautl=False),
                Field('group_invitation_id', 'reference group_invitation'),
                Field('is_member', type='boolean', default=False),

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
                Field('property_owner', db.auth_user, default=get_user_id(), readable=False, writable=False),
                Field('street_number', type='string', required=False),
                Field('street', type='string',required=False),
                Field('city', type='string',required=False),
                Field('zip', type='string',required=False),
                Field('state_', type='string',required=False),
                Field('country', type='string', required=False),
                Field('num_bedrooms', type='integer'),
                Field('num_fullbaths', type='integer'),
                Field('num_halfbaths', type='integer'),
                Field('property_type', db.property_type),
                Field('posted', type='boolean', default=False),
                Field('proof_ownership'),
                Field('is_editing', type='boolean', default=False),
                Field('is_uploading', type='boolean', default=False),
                )

# users can 'like' a property
db.define_table('liked_properties',
                Field('user_email', default=get_user_email()),
                Field('property_id', 'reference property',),
                Field('isliked', 'boolean'),
                Field('user_id', 'reference auth_user')
                )

db.define_table('listings',
                Field('property_id', 'reference property'),
                Field('user_email', default=get_user_email()),
                Field('listed_on', 'datetime', default=datetime.datetime.now),
                Field('rent', type='integer'),
                Field('start_date'),
                Field('end_date'),
                Field('max_occ', type='integer')
                )

db.define_table('property_images',
                Field('property_id', 'reference property'),
                Field('created_on', 'datetime', default=request.now),
                Field('image_url'),
                )
db.define_table('property_notes',
                Field('property_id', 'reference property'),
                Field('created_on', 'datetime', default=datetime.datetime.now),
                Field('created_by', 'reference auth_user', default=get_user_id()),
                Field('note', 'text'),
                )

db.define_table('lfg_posts',
                Field('user_id', 'reference auth_user'),
                Field('city', ),
                Field('post_text', 'text'),
                Field('is_active', default=True),

                )

db.define_table('message_content',
                Field('message_body', 'text'),
                )

db.define_table('message_headers',
                Field('sender_id', 'reference auth_user'),
                Field('receiver_id', 'reference auth_user'),
                Field('content_id', 'reference message_content'),

                )

db.define_table('available_cities',
                Field('city', 'string'),
                )

# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)


