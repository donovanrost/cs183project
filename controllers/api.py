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
    # for row in db(db.property.property_owner == auth.user.id).select():
    #     p = row.id
    #     pics = []
    #     notes = []
    #     list = db(db.listings.property_id == p).select().first()
    #     if list is not None:
    #         row.update(
    #             user_email=list.user_email,
    #             listed_on=list.listed_on,
    #             rent=list.rent,
    #             start_date=list.start_date,
    #             end_date=list.end_date,
    #             max_occ=list.max_occ,
    #             posted=True
    #         )
    #     for r in db(db.property_images.property_id == p).select():
    #         pics.append(r.image_url)
    #         row['images'] = pics
    #     for r in db(db.property_notes.property_id == p).select():
    #         notes.append(r)
    #         row['notes'] = notes
    #     row['is_owned'] = True
    #     owned_properties.append(row)

    for row in db(db.property.property_owner == auth.user.id).select():

        images = []
        for i in db(db.property_images.property_id == row.id).select():
            images.append(i.image_url)

        is_liked = False
        if auth.user is not None:
            liked_property = db((db.liked_properties.property_id == row.id) &
                                  (db.liked_properties.user_id == auth.user.id)).select().first()
            if liked_property is not None:
                is_liked = liked_property.isliked

        prop = dict(
            street=row.street,
            city=row.city,
            state=row.state_,
            zip=row.zip,
            num_bedrooms=row.num_bedrooms,
            num_halfbaths=row.num_halfbaths,
            num_fullbaths=row.num_fullbaths,
            is_owned=True,
            property_id=row.id,
            images=images,
            is_liked=is_liked,
        )
        owned_properties.append(prop)


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

    return response.json(dict(
        liked_properties=liked_properties,
        ))


def get_my_liked_properties():
    my_liked_properties = []
    liked_props = request.get_vars.liked_props


    for id in liked_props:
        my_liked_properties.append(db(db.property.id == id).select().first())

    return response.json(dict(my_liked_properties=my_liked_properties))

def add_new_property_note():
    note = request.post_vars.note
    property_id = request.post_vars.property_id

    db.property_notes.insert(note=note, property_id=property_id)

    return 'ok'


def get_all_lfg_posts():
    lfg_posts = []

    for row in db(db.lfg_posts.is_active).select():
        lfg_post = dict(
            post_id=row.id,
            user_id=db(db.auth_user.id == row.user_id).select().first().id,
            user_email=db(db.auth_user.id == row.user_id).select().first().email,
            image_url=db(db.auth_user.id == row.user_id).select().first().image_url,
            first_name=db(db.auth_user.id == row.user_id).select().first().first_name,
            last_name=db(db.auth_user.id == row.user_id).select().first().last_name,
            city=row.city,
            post_text=row.post_text,
        )
        lfg_posts.append(lfg_post)

    return response.json(dict(lfg_posts=lfg_posts))


def send_group_invitation():

    # TODO: when an invitatin is sent, a 'message' should be sent to the inbox... whenever that is ready
    sender_id = auth.user.id
    group_id = request.post_vars.group_id
    receiver_id = request.post_vars.receiver_id





    invitation_id = db.group_invitation.insert(
        group_id=group_id,
        sender_id=sender_id,
        receiver_id=receiver_id,

    )

    db.group_member.insert(
        user_id=receiver_id,
        group_id=group_id,
        group_invitation_id=invitation_id,

    )

    # for the response
    q = db(db.auth_user.id == request.post_vars.receiver_id).select().first()

    new_member = dict(
        user_id=request.post_vars.receiver_id,
        first_name=q.first_name,
        last_name=q.last_name,
        user_email=q.email,
        user_image=q.image_url,
        is_member=False,
    )


    return response.json(dict(
        new_member=new_member,
    ))


def get_available_cities():

    available_cities = []

    for row in db(db.available_cities.id > 0).select():
        available_cities.append(row)

    return response.json(dict(available_cities=available_cities))


def post_lfg_post():

    user_id = auth.user.id
    post_text = request.post_vars.post_text
    city = request.post_vars.city

    db.lfg_posts.insert(
        user_id=user_id,
        post_text=post_text,
        city=city,
    )


def accept_invitation():

    user_id = request.post_vars.user_id
    group_id = request.post_vars.group_id

    rows = db(db.group_member.group_id == group_id).select()

    for r in rows:
        if r.user_id == user_id:
            r.update_record(is_member=True)

    for post in db(db.lfg_posts.user_id == user_id).select():
        post.update_record(is_active=False)


    return 'ok'


def get_this_user_id():
    if auth.user is not None:
        user_id = auth.user.id
    else:
        user_id = 0


    return response.json(dict(user_id=user_id))


def edit_lfg_post():
    post_id = request.post_vars.post_id
    post_text = request.post_vars.post_text

    post = db(db.lfg_posts.id == post_id).select().first()

    post.update_record(post_text=post_text)

    return 'ok'


    







