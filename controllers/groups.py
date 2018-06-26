from gluon.utils import web2py_uuid

@auth.requires_signature()
def get_insertion_id():
    insertion_id = web2py_uuid()
    return response.json(dict(
        insertion_id=insertion_id
    ))

def is_editing():
    group_id = int(request.vars.group_id)
    group = db(db.rental_group.id == group_id).select().first()
    if group.is_editing:
        group.is_editing = False
    else:
        group.is_editing = True
    group.update_record()
    return "ok"

def get_users():
    start_idx = int(request.vars.start_idx) if request.vars.start_idx is not None else 0
    end_idx = int(request.vars.end_idx) if request.vars.end_idx is not None else 0
    users = []
    has_more = False
    q = (db.auth_user.id != auth.user.id)
    rows = db(q).select(db.auth_user.ALL, limitby=(start_idx, end_idx + 1))
    for i, r in enumerate(rows):

        if i < end_idx - start_idx:
            usr = dict(
                id = r.id,
                image_url = r.image_url,
                email = r.email,
                first_name = r.first_name,
                last_name = r.last_name
            )
            users.append(usr)
        else:
            has_more = True
    logged_in = auth.user is not None
    return response.json(dict(
        users=users,
        logged_in=logged_in,
        has_more=has_more,
    ))

def search_users():
    users = []
    query = request.vars.query
    q = ((db.auth_user.first_name == query) | (db.auth_user.last_name == query) | (db.auth_user.email == query))
    rows = db(q).select(db.auth_user.ALL)
    for i, r in enumerate(rows):
        usr = dict(
            id=r.id,
            picture=r.picture,
            email=r.email,
            first_name=r.first_name,
            last_name=r.last_name
        )
        users.append(usr)
    return response.json(dict(
        users=users,
    ))

def get_groups():
    groups =[]
    q = (db.group_member.user_id == auth.user.id)
    rows= db(q).select()#db.group_member.ALL)
    print(rows)

    for i, r in enumerate(rows):
        gr = db(db.rental_group.id == r.group_id).select().first()
        grp = dict(
            group_id = r.group_id,
            group_name = gr.group_name,
            is_editing = gr.is_editing,
            group_members = get_group_members(r.group_id)
        )
        groups.append(grp)

    return response.json(dict(
        groups=groups
    ))

@auth.requires_signature()
def add_group():

    print("ehh?")

    members = []
    # makes the new group
    g_id = db.rental_group.insert(
        is_active=True,
        group_name=request.vars.group_name
    )
    print("ehh?")

    # add the group creator as the first member
    m_id = db.group_member.insert(
        group_id=g_id,
        user_id=auth.user.id
    )
    mem = dict(
        group_id=g_id,
        user_id=auth.user.id
    )
    members.append(mem)

    return response.json(dict(group=dict(
        id=g_id,
        is_active=True,
        members=members
    )))

def delete_group():
    db(db.group_member.group_id == request.vars.group_id).delete()
    db(db.rental_group.id == request.vars.group_id).delete()
    return "ok"

def get_group_members(group_id):

    members = []
    q = (db.group_member.group_id == group_id)
    rows = db(q).select(db.group_member.ALL)

    for i, r in enumerate(rows):
        mem = dict(
            group_id=r.group_id,
            user_email=db(db.auth_user.id == r.user_id).select().first().email,
            image_url=db(db.auth_user.id == r.user_id).select().first().image_url,
            first_name=db(db.auth_user.id == r.user_id).select().first().first_name,
            last_name=db(db.auth_user.id == r.user_id).select().first().last_name,
            is_active=r.is_active,
            #is_pending=r.is_pending,

        )
        members.append(mem)
    return members

def get_members():
    members = []
    q = (db.group_member.group_id == request.vars.group_id)
    rows = db(q).select(db.group_member.ALL)

    for i, r in enumerate(rows):
        mem = dict(
            # DON'T KNOW IF THIS WORKS HAVEN'T TESTED
            # IF IT DOESN"T LOOK AT get_group_members()
            group_id=r.group_id,
            user_email=db(db.auth_user.user_id == r.user_id).select().first().user_email,
            image_url=db(db.auth_user.user_id == r.user_id).select().first().image_url,
            first_name=db(db.auth_user.user_id == r.user_id).select().first().first_name,
            last_name=db(db.auth_user.user_id == r.user_id).select().first().last_name,
            is_active=r.is_active,
            is_pending=r.is_pending,

        )
        members.append(mem)

#     members=[]
#     q = (db.group_member.group_id == request.vars.group_id)
#
#     #selects all group members
#     rows = db(q).select(db.group_member.ALL)
#
#     for i, r in enumerate(rows):
#         mem = dict(
#             group_id=r.group_id,
#             user_email = r.user_email,
#             is_active = r.is_active
#         )
#         members.append(mem)
#
    return response.json(dict(
        members=members
    ))

def del_member():
    "Deletes a track from the table"
    db(db.group_member.user_email == request.vars.user_email).delete()
    return "ok"

def clean_members():
    "deletes members of a group not successfully added "
    db(db.rental_group.group_id == request.vars.group_id).delete()
    return "ok"

@auth.requires_signature()
def add_member():
    m_id = db.group_member.insert(
        group_id  = request.vars.group_id,
        user_id = request.vars.user_id
    )

    return response.json(dict(member=dict(
        id = m_id,
        group_id=request.vars.group_id,
        user_id=request.vars.user_id
    )))



def get_groups2():

    groups=[]

    # gets the groups to which the auth.user belongs
    for row in db(db.group_member.user_id == auth.user.id).select():
        members=[]
        group_id = row.group_id

        # makes sure is_member == True for this user
        if row.is_member:
            # finds other group members
            for r in db(db.group_member.group_id == group_id).select():
                mem = dict(
                    user_id=db(db.auth_user.id == r.user_id).select().first().id,
                    first_name=db(db.auth_user.id == r.user_id).select().first().first_name,
                    last_name=db(db.auth_user.id == r.user_id).select().first().last_name,
                    user_email=db(db.auth_user.id == r.user_id).select().first().email,
                    user_image=db(db.auth_user.id == r.user_id).select().first().image_url,
                )
                members.append(mem)
            group = dict(
                group_id=group_id,
                group_name=db(db.rental_group.id == group_id).select().first().group_name,
                members=members,
            )
            groups.append(group)

    print(groups)

    return response.json(dict(
        groups=groups,
    ))
