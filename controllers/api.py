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
    street = request.post_vars.street
    city = request.post_vars.city
    zip = request.post_vars.zip
    state_ = request.post_vars.state_

    db.property.insert(property_type=property_type,
                        num_bedrooms=num_bedrooms,
                        num_fullbaths=num_fullbaths,
                        num_halfbaths=num_halfbaths,
                        street=street,
                        city=city,
                        zip=zip,
                        state_=state_,
                        )

    return "ok"

def get_owned_properties():
    owned_properties = []

    for row in db(db.property.property_owner == auth.user.id).select():
        owned_properties.append(row)

    return response.json(dict(
        owned_properties=owned_properties,
        ))


#Helper function to get user info and check if logged in or not
def get_my_info():
    my_user_id = auth.user.id
    this_user = auth.user
    logged_in = True if auth.user is not None else False
    return response.json(dict(this_user=this_user, logged_in=logged_in,my_user_id=my_user_id))


def add_listing():
    property_id = request.vars.property_id
    max_occ = request.vars.max_occ
    rent = request.vars.rent
    start_date = request.vars.start_date
    end_date = request.vars.end_date
    user_email = request.vars.user_email

    db.listings.insert(
        property_id=property_id,
        max_occ = max_occ,
        rent = rent,
        start_date = start_date,
        end_date = end_date,
        user_email = user_email
    )
    return "ok"

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



