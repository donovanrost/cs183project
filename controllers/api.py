# Here go your api methods.
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


#Helper function to get user info and check if logged in or not
def get_my_info():
    my_user_id = auth.user.id
    this_user = auth.user
    logged_in = True if auth.user is not None else False
    return response.json(dict(this_user=this_user, logged_in=logged_in,my_user_id=my_user_id))


