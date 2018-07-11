# -*- coding: utf-8 -*-
# this file is released under public domain and you can use without limitations

# -------------------------------------------------------------------------
# This is a sample controller
# - index is the default action of any application
# - user is required for authentication and authorization
# - download is for downloading files uploaded in the db (does streaming)
# -------------------------------------------------------------------------
from gluon import SQLFORM


def index():
    """
    example action using the internationalization operator T and flash
    rendered by views/default/index.html or views/generic.html

    if you need a simple wiki simply replace the two lines below with:
    return auth.wiki()
    """
    db.listings.id.readable = False



    grid = SQLFORM.grid(db.listings, user_signature=False, fields=None, create=False, deletable=False,
                             editable=False, paginate=25, csv=False,
                        links = [lambda row: A('Like', _href=URL("default","like_listing",args=[row.id]))])
    return dict(grid=grid)


def user():
    """
    exposes:
    http://..../[app]/default/user/login
    http://..../[app]/default/user/logout
    http://..../[app]/default/user/register
    http://..../[app]/default/user/profile
    http://..../[app]/default/user/retrieve_password
    http://..../[app]/default/user/change_password
    http://..../[app]/default/user/bulk_register
    use @auth.requires_login()
        @auth.requires_membership('group name')
        @auth.requires_permission('read','table name',record_id)
    to decorate functions that need access control
    also notice there is http://..../[app]/appadmin/manage/auth to allow administrator to manage users
    """
    return dict(form=auth())


@cache.action()
def download():
    """
    allows downloading of uploaded files
    http://..../[app]/default/download/[filename]
    """
    return response.download(request, db)


def call():
    """
    exposes services. for example:
    http://..../[app]/default/call/jsonrpc
    decorate with @services.jsonrpc the functions to expose
    supports xml, json, xmlrpc, jsonrpc, amfrpc, rss, csv
    """
    return service()

@auth.requires_login()
def profile():
    #q = db.auth_user.picture
    #pic = db(q).select().first()
    return locals()

def register():
    return dict(form=auth.register())

@auth.requires_login()
def add_new_property():
    form = SQLFORM.factory(db.address)

    return dict(form=form)

@auth.requires_login()
def testpage():
    form = SQLFORM(db.address)
    return dict(form=form)

def lfg():
    form = SQLFORM(db.address)
    return dict(form=form)
def messages():
    form = SQLFORM(db.address)
    return dict(form=form)


@auth.requires_login()
def change_user_image():
    form = SQLFORM(db.auth_user.picture)
    return dict(form=form)

@auth.requires_login()
def new_group():
    users = db().select(db.auth_user.ALL)
    return dict(users=users)

def get_listings():
    listings = []
    page = int(request.vars.page)
    start = (page-1)*10
    end = page*10
    rows = db().select(db.listings.ALL, limitby=(start, end+1))
    has_more = False

    # p --> property info
    # r --> listing info
    # i --> page number

    for i, r in enumerate(rows):
        if i < end - start:
            images = []
            for j in db(db.property_images.property_id == r.property_id).select():
                images.append(j.image_url)
            p = db(db.property.id == r.property_id).select().first()
            notes = db(db.property_notes.property_id == r.property_id).select(db.property_notes.ALL)

            is_liked = False
            if auth.user is not None:
                liked_properties = db((db.liked_properties.property_id == r.property_id) &
                               (db.liked_properties.user_id == auth.user.id)).select().first()
                if liked_properties is not None:
                    is_liked = liked_properties.isliked

            list = dict(
                street=p.street,
                city=p.city,
                zip=p.zip,
                state=p.state_,
                num_bedrooms=p.num_bedrooms,
                num_fullbaths=p.num_fullbaths,
                num_halfbaths=p.num_halfbaths,
                property_id=r.property_id,
                user_email=r.user_email,
                images=images,
                notes=notes,
                rent=r.rent,
                term_length=r.term_length,
                is_liked=is_liked,
            )
            listings.append(list)
        else:
            has_more = True
    return response.json(dict(
        listings=listings,
        has_more=has_more,
    ))

#Helper function to get user info and check if logged in or not
def get_my_info():
    this_user = auth.user
    logged_in = True if auth.user is not None else False
    return response.json(dict(this_user=this_user, logged_in=logged_in))


def search():
    listings = []
    street = request.vars.street
    city = request.vars.city
    zip = request.vars.zip
    state = request.vars.state

    q = None
    if street:
        q = db.property.street.contains(street)
    if city:
        q = db.property.city.contains(city)
    if state:
        q = db.property.state_.contains(state)
    if zip:
        q = db.property.zip.contains(zip)

    rows = db(q).select(db.property.ALL, limitby=(0, 10))
    for i, r in enumerate(rows):
        list = dict(
            street=r.street,
            city=r.city,
            zip=r.zip,
            state=r.state_,
            num_bedrooms=r.num_bedrooms,
            num_fullbaths=r.num_fullbaths,
            num_halfbaths=r.num_halfbaths,
            property_id=r.id,
        )
        listings.append(list)
    return response.json(dict(
        listings=listings
    ))

def like_property():
    property_id = request.post_vars.property_id
    is_liked = None
    liked_property = None

    for row in db(db.liked_properties.user_id == auth.user.id).select():
        if row.property_id == property_id:
            liked_property = row

    if liked_property is None:
        is_liked = True
    else:
       is_liked = not liked_property.isliked

    db.liked_properties.update_or_insert((db.liked_properties.property_id == property_id) &
                                         (db.liked_properties.user_email == auth.user.email),
                                         user_email=auth.user.email,
                                         isliked=is_liked,
                                         property_id=property_id,
                                         user_id=auth.user.id,
                                         )
    return "ok"


def get_liked_properties():
    liked_properties = []
    liked_prop = []
    for row in db(db.liked_properties.user_id == auth.user.id).select():
        if (row.isliked == True):
            liked_properties.append(row.property_id)

    for id in liked_properties:
        q = db(db.property.id).select()
        for r in q:
            if (r.id == id):
                liked_prop.append(r)

    return response.json(dict(
        liked_properties=liked_prop,
        ))


def get_my_liked_properties():
    my_liked_properties = []
    liked_props = request.get_vars.liked_props

    return response.json(dict(my_liked_properties=my_liked_properties))
