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
                group_id: self.insertion_id
            },
            function (data){
            self.vue.members = data.members;
            enumerate(self.vue.groups);
        });
    };

    self.add_group_button = function() {
        self.get_insertion_id();
        self.vue.is_adding_group = true;
    };

    self.add_group = function() {
        $.post(add_group_url,

            function (data) {
               self.is_adding_group = false;
            });
    };

    self.add_to_group = function(user_email) {

        $.post(add_member_url,
            {
                user_email: user_email,
                group_id: self.insertion_id
            },
            function () {}
            );
    };

    self.remove_from_group = function(user_email){

    };

    self.cancel_add_group = function(){
        self.vue.is_adding_group = false;
        self.insertion_id = null;
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
            logged_in: false,
            has_more: false
        },
        methods: {
            get_more: self.get_more,
            add_group_button: self.add_group_button,
            add_group: self.add_group,
            cancel_add_group: self.cancel_add_group,
            add_to_group: self.add_to_group,
            remove_from_group: self.remove_from_group
        }

    });

    self.get_members();
    self.get_users();
    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});