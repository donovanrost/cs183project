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
    q = db.auth_user.picture
    pic = db(q).select().first()
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

@auth.requires_login()
def change_user_image():
    form = SQLFORM(db.auth_user.picture)
    return dict(form=form)

@auth.requires_login()
def new_group():
    users = db().select(db.auth_user.ALL)
    return dict(users=users)


def like_listing():
    id = request.args[0]
    db.liked_properties.insert(
        property_id = id,
        user_email = auth.user.email
    )
    return
