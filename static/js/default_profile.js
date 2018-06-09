// This is the js for the default/profile.html view.

var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    // Enumerates an array.
    var enumerate = function(v) { var k=0; return v.map(function(e) {e._idx = k++;});};

    self.add_property_button = function () {
        console.log('button pressed');
        if(!self.vue.is_adding_property) {
            $("div#add_property_div").show();
            self.get_property_types();
        }
        else{
            $("div#add_property_div").hide();

        }
        self.vue.is_adding_property = !self.vue.is_adding_property;
    };

    self.get_property_types = function(){
        axios.get(get_property_types_url)

            .then(function(response){
                console.log(response.data.property_types);
                self.vue.property_types = response.data.property_types;
                enumerate(self.vue.property_types);
            })

    };

    self.add_property = function(){
        var property_type;
        for(i = 0; i < self.vue.property_types.length; i++){
            if(self.vue.property_types[i].p_type == self.vue.p_type){
                property_type = self.vue.property_types[i].id;
                break;
            }
        }
        axios.post(add_property_url, {

            street: self.vue.form_street,
            city: self.vue.form_city,
            state_: self.vue.form_state_,
            zip: self.vue.form_zip,
            num_bedrooms: self.vue.num_bedrooms,
            num_fullbaths: self.vue.num_fullbaths,
            num_halfbaths: self.vue.num_halfbaths,
            property_type: self.vue.p_type.id,

        })
            .then(function(response){
                console.log(response)
                if(response.data="ok"){
                    self.get_owned_properties();
                    self.vue.form_street='';
                    self.vue.form_city='';
                    self.vue.form_state_='';
                    self.vue.form_zip='';
                    self.vue.num_bedrooms='';
                    self.vue.num_fullbaths='';
                    self.vue.num_halfbaths='';
                    self.vue.p_type.id='';
                    self.vue.add_property_page=0;
                    self.add_property_button();

                }
            })
    };
    self.get_owned_properties = function(){
        axios.get(get_owned_properties_url)
            .then(function(response){
                self.vue.owned_properties = response.data.owned_properties;
                enumerate(self.vue.owned_properties);
            })

    };
    self.get_liked_properties = function(){


        $.getJSON(get_liked_properties_url,
            function(data){
                self.vue.liked_properties = data.liked_properties;
                enumerate(self.vue.liked_properties);
                console.log(self.vue.liked_properties);
        });


    };





    //------------------- GROUP CODE ================================================
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
        self.get_users()
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
                self.get_users();
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

    self.add_to_group = function(user, id) {
        (self.vue.members).push(user);
        (self.vue.users).splice(id, 1);
        enumerate(self.vue.users);
        enumerate(self.vue.members);

    };

    self.remove_from_group = function(user, id){
        (self.vue.members).splice(id, 1);
        (self.vue.users).push(user);
        enumerate(self.vue.users);
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
        self.vue.form_name = "";
        self.vue.is_adding_group = false;
        self.vue.members = [];
        self.get_users();
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

    self.search_user = function(){
        $.getJSON(search_users_url,
            {
                query: self.vue.form_user_search
            },
            function (data) {
            self.vue.users = data.users;
            enumerate(self.vue.users);
        })
    };

    self.clear_user_button = function(){
        self.vue.form_user_search = "";
        self.get_users();
    };
    //------------------- End of GROUP CODE ================================================
    self.next_page = function(){
        self.vue.add_property_page++;

    };
    self.prev_page = function(){
        if(self.vue.add_property_page > 0)
            self.vue.add_property_page--;
    };

    // listings
    self.add_listing_button = function(id){
        self.vue.add_listing_page = 0; 
        if(!self.vue.is_adding_listing) {
            $("div#add_listing_div").show();
            self.vue.p_idx = id;
        }
        else{
            $("div#add_listing_div").hide();
            self.vue.form_max_occ="";
            self.vue.form_rent="";
            self.vue.form_start_date= "";
            self.vue.form_end_date= "";
            self.vue.p_idx = null;
        }
        self.vue.is_adding_listing = !self.vue.is_adding_listing;
    };

    self.next_list_page = function() {
        self.vue.add_listing_page++;
    };

    self.prev_list_page = function(){
        if(self.vue.add_listing_page > 0)
            self.vue.add_listing_page--;
    };

    self.add_listing = function(){
        $.post(add_listing_url,
            {
                property_id: self.vue.owned_properties[self.vue.p_idx].id,
                max_occ: self.vue.form_max_occ,
                rent: self.vue.form_rent,
                start_date: self.vue.form_start_date,
                end_date: self.vue.form_end_date
            },
            function () {
            $("div#add_listing_div").hide();
                self.get_owned_properties();
                self.vue.form_max_occ="";
                self.vue.form_rent="";
                self.vue.form_start_date= "";
                self.vue.form_end_date= "";
                self.vue.is_adding_listing = !self.vue.is_adding_listing;
                self.vue.p_idx = null;
            }
        )
    };

    self.del_listing = function(id) {
       $.post(del_listing_url,
           {property_id:id},
           function () {
                self.get_owned_properties();
           })
    };

    self.get_listing = function(id){
        $.getJSON(get_listing_url,
            {
                query: self.vue.form_user_search
            },
            function () {

        })
    };

    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            is_adding_property:false,
            is_adding_listing: false,
            form_street: "",
            form_city:"",
            form_state_:"",
            form_zip:"",
            form_max_occ:"",
            form_rent:'',
            form_start_date: "",
            form_end_date: "",
            addr_id:"",
            addr_is_valid: "",
            property_types: [],
            p_type:"",
            num_bedrooms:"",
            num_fullbaths:"",
            num_halfbaths:"",
            add_property_page:0,
            last_add_property_page:1,
            add_listing_page:0,
            owned_properties:[],
            p_idx: null,


            // Groups
            is_adding_group: false,
            groups: [],
            users: [],
            members: [],
            form_user_search: null,
            form_name: null,
            logged_in: false,
            has_more: false,
            liked_properties:[],
        },
        methods: {
            //properties
            add_property_button: self.add_property_button,
            add_address: self.add_address,
            get_property_types:self.get_property_types,
            add_property: self.add_property,
            next_page:self.next_page,
            prev_page:self.prev_page,
            get_owned_properties:self.get_owned_properties,

            //listings
            add_listing_button: self.add_listing_button,
            next_list_page: self.next_list_page,
            prev_list_page: self.prev_list_page,
            add_listing: self.add_listing,
            get_listing: self.get_listing,
            del_listing: self.del_listing,

            // groups
            get_more: self.get_more,
            add_group_button: self.add_group_button,
            submit_group_button: self.submit_group_button,
            add_group: self.add_group,
            edit_group_button: self.edit_group_button,
            cancel_edit_group: self.cancel_edit_group,
            cancel_add_group: self.cancel_add_group,
            add_to_group: self.add_to_group,
            remove_from_group: self.remove_from_group,
            delete_group: self.delete_group,
            search_user: self.search_user,
            clear_user_button: self.clear_user_button,


            get_liked_properties: self.get_liked_properties,
        }

    });

    self.get_users();
    self.get_groups();
    self.get_owned_properties();
    self.get_liked_properties();


    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
