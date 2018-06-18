# Here go your api methods.


from gluon import SQLFORM

def insert_new_address():
    street = request.post_vars.street
    city = request.post_vars.city
    zip = request.post_vars.zip
    state_= request.post_vars.state_
    addr_id = None
    error=None
    for row in db(db.address.street == street).select():
         if row.zip == zip and row.state_ == state_ and row.city == city:
             addr_id = row.id
    if addr_id is not None:
            for row in db(db.property.address == addr_id).select():
                if row is not None:
                    error="error"
    else:
        db.address.insert(**db.address._filter_fields(request.post_vars))
        for row in db(db.address.street == street).select():
            if row.zip == zip and row.state_ == state_ and row.city == city:
                addr_id = row.id

    return response.json(dict(
        addr_id = addr_id,
        error=error,
    ))

def get_property_types():
    property_types = []

    for row in db(db.property_type.id > 0).select():
        property_types.append(row)

    return response.json(dict(
       property_types=property_types

    ))



def add_property():
    property_type = request.post_vars.property_type
    num_bedrooms = request.post_vars.num_bedrooms
    num_fullbaths = request.post_vars.num_fullbaths
    num_halfbaths = request.post_vars.num_halfbaths
    street_number = request.post_vars.street_number
    street = request.post_vars.street
    city = request.post_vars.city
    zip = request.post_vars.zip
    state_ = request.post_vars.state_
    country = request.post_vars.country

    print("state:" + state_)

    db.property.insert(property_type=property_type,
                        num_bedrooms=num_bedrooms,
                        num_fullbaths=num_fullbaths,
                        num_halfbaths=num_halfbaths,
                        street_number=street_number,
                        street=street,
                        city=city,
                        zip=zip,
                        state_=state_,
                        country=country,
                        )

    return "ok"

def get_owned_properties():
    owned_properties = []
    for row in db(db.property.property_owner == auth.user.id).select():
        p = row.id
        pics = []
        notes = []
        list = db(db.listings.property_id == p).select().first()
        if list is not None:
            row.update(
                user_email=list.user_email,
                listed_on=list.listed_on,
                rent=list.rent,
                start_date=list.start_date,
                end_date=list.end_date,
                max_occ=list.max_occ,
                posted=True
            )
        for r in db(db.property_images.property_id == p).select():
            pics.append(r.image_url)
            row['images'] = pics
        for r in db(db.property_notes.property_id == p).select():
            notes.append(r)
            row['notes'] = notes
        owned_properties.append(row)
    print(owned_properties)

    return response.json(dict(
        owned_properties=owned_properties
    ))

#Helper function to get user info and check if logged in or not
def get_my_info():
    my_user_id = auth.user.id
    this_user = auth.user
    logged_in = True if auth.user is not None else False
    return response.json(dict(this_user=this_user, logged_in=logged_in,my_user_id=my_user_id))

def insert_property_url():
    property_id = request.post_vars.property_id
    img_url = request.post_vars.prop_img_url
    db.property_images.insert(image_url=img_url, property_id=property_id)

    return 'ok'

def get_property_images():
    property_id = request.get_vars.property_id
    property_images = []

    for row in db(db.property_images.property_id == property_id).select():
        property_images.append(row.image_url)


    return response.json(dict(property_images=property_images))

def insert_user_image_url():
    img_url = request.post_vars.user_image_url

    db.auth_user.update_or_insert((db.auth_user.id == auth.user.id),
                                  image_url=img_url,

                                  )
    return 'ok'

def get_user_image_url():

    row = db(db.auth_user.id == auth.user.id).select().first()
    img_url = row.image_url
    print(row)

    return response.json(dict(image_url=img_url,
                              ))



def add_listing():
    property_id = request.vars.property_id
    max_occ = request.vars.max_occ
    rent = request.vars.rent
    start_date = request.vars.start_date
    end_date = request.vars.end_date
    user_email = request.vars.user_email

    row = db(db.property.id == property_id).select().first()
    if row is not None:
        row.update_record(posted=True)
        db.listings.insert(
            property_id=property_id,
            max_occ = max_occ,
            rent = rent,
            start_date = start_date,
            end_date = end_date,
            user_email = user_email
        )
    return "ok"

def remove_listing():
    db(db.property.id == request.vars.property_id).update(posted=False)
    db(db.listings.property_id == request.vars.property_id).delete()
    return "ok"

def get_listing():
    row = db(db.listings.property_id == request.vars.property_id).select()
    return(row)


def get_liked_properties():
    liked_properties = []

    for row in db(db.liked_properties.user_email == auth.user.email).select():
        if (row.isliked == True):
            liked_properties.append(row.id)

    print(liked_properties + "hello")
    return response.json(dict(
        liked_properties=liked_properties,
        ))


def get_my_liked_properties():
    my_liked_properties = []
    liked_props = request.get_vars.liked_props
    #print('hello')
    #print(liked_props)


    for id in liked_props:
        my_liked_properties.append(db(db.property.id == id).select().first())

    return response.json(dict(my_liked_properties=my_liked_properties))

def add_new_property_note():
    note = request.post_vars.note
    property_id = request.post_vars.property_id

    db.property_notes.insert(note=note, property_id=property_id)

    return 'ok'








