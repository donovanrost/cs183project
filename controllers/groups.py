from gluon.utils import web2py_uuid

@auth.requires_signature()
def get_insertion_id():
    insertion_id = web2py_uuid()
    return response.json(dict(
        insertion_id=insertion_id
    ))

def get_users():
    start_idx = int(request.vars.start_idx) if request.vars.start_idx is not None else 0
    end_idx = int(request.vars.end_idx) if request.vars.end_idx is not None else 0
    users = []
    has_more = False
    rows = db().select(db.auth_user.ALL, limitby=(start_idx, end_idx + 1))
    for i, r in enumerate(rows):
        if i < end_idx - start_idx:
            usr = dict(
                id = r.id,
                picture = r.picture,
                email = r.email,
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

@auth.requires_signature()
def get_groups():
    groups =[]
    rows = db().select(db.rental_group.ALL)
    for i, r in enumerate(rows):
        grp = dict(
            group_id = r.group_id
        )
        groups.append(grp)
    return response.json(dict(
        groups=groups
    ))


def add_group():
    g_id = db.rental_group.insert(
        group_id=request.vars.insertion_id,
        is_active = True
    )

    return response.json(dict(member=dict(
        id=g_id,
        group_id=request.vars.insertion_id,
        is_active=True
    )))

def get_members():
    members=[]
    #q = (db.group_member.group_id == request.vars.group_id)
    rows = db().select(db.group_member.ALL)
    for i, r in enumerate(rows):
        mem = dict(
            group_id=r.group_id,
            user_email = r.user_email,
            is_active = r.is_active,
        )
        members.append(mem)
    return response.json(dict(
        members=members
    ))

def del_member():
    "Deletes a track from the table"
    db(db.group_member.user_email == request.vars.user_email).delete()
    return "ok"


@auth.requires_signature()
def add_member():
    m_id = db.group_member.insert(
        group_id  = request.vars.insertion_id,
        user_email = request.vars.user_email
    )

    return response.json(dict(member=dict(
        id = m_id,
        group_id=request.vars.insertion_id,
        user_email=request.vars.user_email
    )))
