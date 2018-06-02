// this is the class to get users, create new groups, add them to groups, display groups, and remove groups
// based on vue_classes and homework 3


var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Enumerates an array.
    var enumerate = function(v) { var k=0; return v.map(function(e) {e._idx = k++;});};

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    self.insertion_id = null; // Initialization.

    self.get_insertion_id = function () {
        $.getJSON(get_insertion_url, function(data){
            self.insertion_id = data.insertion_id;
        })
    };

    function get_users_url(start_idx, end_idx) {
        var pp = {
            start_idx: start_idx,
            end_idx: end_idx
        };
        return users_url + "&" + $.param(pp);
    }

    self.get_users = function () {
        $.getJSON(get_users_url(0, 10), function (data) {
            self.vue.users = data.users;
            self.vue.has_more = data.has_more;
            self.vue.logged_in = data.logged_in;
            enumerate(self.vue.users);
        })
    };

    self.get_more = function () {
        var num_users = self.vue.users.length;
        $.getJSON(get_users_url(num_users, num_users + 10), function (data) {
            self.vue.has_more = data.has_more;
            self.extend(self.vue.users, data.users);
            enumerate(self.vue.users);
        });
    };

    self.get_groups = function () {
        $.getJSON(groups_url,
            function (data) {
            self.vue.groups = data.groups;
            enumerate(self.vue.groups);
        });
    };

    self.get_members= function(group_id) {
        $.getJSON(members_url,
            {
                group_id: group_id
            },
            function (data){
            self.vue.members = data.members;
            enumerate(self.vue.members);
        });
    };

    self.add_group_button = function() {
        self.vue.is_adding_group = true;
    };

    self.submit_group_button = function() {
        self.vue.is_adding_group = false;
        self.vue.add_group();
    };

    self.add_group = function() {
        $.post(add_group_url,
            {
                group_name: self.vue.form_name
            },
            function (data) {
                self.add_group_members(data.group.id);
                self.is_adding_group = false;
                self.vue.members = [];
                self.vue.form_name = "";
                self.get_groups();
            });
    };

    self.delete_group = function(group_id) {
        $.post(delete_group_url,
           {
               group_id: group_id
           },
           function (data) {
               self.get_groups();
               enumerate(self.vue.groups);
       });
    };

    self.add_to_group = function(user) {
        (self.vue.members).push(user);
    };

    self.remove_from_group = function(id){
        (self.vue.members).splice(id, 1);
        enumerate(self.vue.members);
    };

    self.add_group_members= function(group_id){
        for(i =0; i <(self.vue.members).length; i++){
            $.post(add_member_url,
               {
                   group_id: group_id,
                   user_email: (self.vue.members)[i].email
               },
               function (data) {
                   self.get_groups();
                   enumerate(self.vue.groups);
             });
        }
    };

    self.clean_up_members = function(group_id){
        $.post(clean_members_url,
            { group_id: group_id},
            function () {
                self.vue.members = [];
            }
        )
    };

    self.cancel_add_group = function(){
        self.clean_up_members(self.insertion_id);
        self.delete_group(self.insertion_id);
        self.vue.is_adding_group = false;
        self.insertion_id = null;
    };

    self.edit_group_button = function(group_id) {
        $.post(toggle_is_editing,
            {
                group_id: group_id
            },
            function () {
                self.get_groups();
            }
        )
    };

    self.cancel_edit_group = function(group_id) {
        $.post(toggle_is_editing,
            {
                group_id: group_id
            },
            function () {
                self.get_groups();
            }
        )
    };

    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            is_adding_group: false,
            groups: [],
            users: [],
            members: [],
            form_name: null,
            logged_in: false,
            has_more: false
        },
        methods: {
            get_more: self.get_more,
            add_group_button: self.add_group_button,
            submit_group_button: self.submit_group_button,
            add_group: self.add_group,
            edit_group_button: self.edit_group_button,
            cancel_edit_group: self.cancel_edit_group,
            cancel_add_group: self.cancel_add_group,
            add_to_group: self.add_to_group,
            remove_from_group: self.remove_from_group,
            delete_group: self.delete_group
        }

    });

    self.get_groups();
    self.get_users();
    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});