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
        else
            $("div#add_property_div").hide();
        self.vue.is_adding_property = !self.vue.is_adding_property;
    };

    self.get_property_types = function(){
        axios.get(get_property_types_url)

            .then(function(response){
                console.log(response.data.property_types);
                self.vue.property_types = response.data.property_types;
                self.enumerate(self.vue.property_types);
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
                console.log(response);
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
        for(var i = 0; i < self.vue.owned_properties.length;i++){
            self.vue.get_property_images(self.vue.owned_properties[i].id)
        }

    };
    self.get_liked_properties = function(){
        axios.get(get_liked_properties_url)

            .then(function(response){
                self.vue.liked_properties = response.data.liked_properties;
                enumerate(self.vue.liked_properties);
            })
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

    self.upload_file = function (event) {
        console.log(self.vue.img_prop_id);
        // Reads the file.
        var input = $("input#file_input")[0];
        var file = input.files[0];
        console.log(file);
        if (file) {
            // First, gets an upload URL.
            console.log("Trying to get the upload url");
            $.getJSON('http://127.0.0.1:8000/cs183project/uploader/get_upload_url',
                function (data) {
                    // We now have upload (and download) URLs.
                    var put_url = data['signed_url'];
                    var get_url = data['access_url'];
                    self.vue.prop_img_url = get_url;
                    console.log("Received upload url: " + put_url);
                    // Uploads the file, using the low-level interface.
                    var req = new XMLHttpRequest();
                    req.addEventListener("load", self.upload_complete(get_url));
                    // TODO: if you like, add a listener for "error" to detect failure.
                    req.open("PUT", put_url, true);
                    req.send(file);
                });
        }
    };
        self.upload_user_image = function (event) {
        // Reads the file.
        var input = $("input#file_input")[0];
        var file = input.files[0];
        console.log(file);
        if (file) {
            // First, gets an upload URL.
            console.log("Trying to get the upload url");
            $.getJSON('http://127.0.0.1:8000/cs183project/uploader/get_upload_url',
                function (data) {
                    // We now have upload (and download) URLs.
                    var put_url = data['signed_url'];
                    var get_url = data['access_url'];
                    self.vue.user_image_url = get_url;
                    console.log("Received upload url: " + put_url);
                    // Uploads the file, using the low-level interface.
                    var req = new XMLHttpRequest();
                    req.addEventListener("load", self.upload_user_image_complete(get_url));
                    // TODO: if you like, add a listener for "error" to detect failure.
                    req.open("PUT", put_url, true);
                    req.send(file);
                });
        }
    };
    self.upload_user_image_complete = function(get_url) {
        // Hides the uploader div.
        //self.close_uploader();
        console.log('The file was uploaded; it is now available at ' + get_url);
        // TODO: The file is uploaded.  Now you have to insert the get_url into the database, etc.
        self.insert_user_image_url();
    };
    self.upload_complete = function(get_url) {
        // Hides the uploader div.
        self.close_uploader();
        console.log('The file was uploaded; it is now available at ' + get_url);
        // TODO: The file is uploaded.  Now you have to insert the get_url into the database, etc.
        self.insert_property_image_url();
    };

    self.open_uploader = function () {
        $("div#uploader_div").show();
        self.vue.is_uploading = true;
    };
    self.close_uploader = function () {
        $("div#uploader_div").hide();
        self.vue.is_uploading = false;
        $("input#file_input").val(""); // This clears the file choice once uploaded.
    };

    self.set_img_prop_id = function(p){
      self.vue.img_prop_id = p.id;
      p.is_uploading = false;
    };

    self.insert_user_image_url = function(){

        axios.post(insert_user_image_url_url,{
            user_image_url: self.vue.user_image_url,

        })
    };
    self.insert_property_image_url = function(){

        axios.post(insert_property_image_url_url,{
            prop_img_url: self.vue.prop_img_url,
            property_id: self.vue.img_prop_id,
        })
    };
    self.get_property_images = function(p){
        console.log("called");
        axios.get(get_property_images_url,{
            params:{
                property_id:p.id,
            }
        })
            .then(function(response){
                self.vue.property_images.append(response.data.property_images);
                enumerate(self.vue.property_images);
                console.log(self.vue.property_images[0]);
            })
    };
    self.toggle_editing_profile = function(){
      self.vue.is_editing_profile = !self.vue.is_editing_profile;
    };
    self.get_user_image_url = function(){
        axios.get(get_user_image_url_url)
            .then(function(response){
                self.vue.user_image_url=response.data.image_url;
            })

    };


    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            is_adding_property:false,
            form_street: "",
            form_city:"",
            form_state_:"",
            form_zip:"",
            addr_id:"",
            addr_is_valid: "",
            property_types: [],
            p_type:"",
            num_bedrooms:"",
            num_fullbaths:"",
            num_halfbaths:"",
            add_property_page:0,
            last_add_property_page:1,
            owned_properties:[],
            user_image_url:'',
            is_editing_profile:false,

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
            upload_file:self.upload_file,
            upload_complete:self.upload_complete,
            open_uploader: self.open_uploader,
            close_uploader: self.close_uploader,
            set_img_prop_id:self.set_img_prop_id,
            insert_property_image_url:self.insert_property_image_url,
            insert_user_image_url:self.insert_user_image_url,
            toggle_editing_profile:self.toggle_editing_profile,
            upload_user_image:self.upload_user_image,
            upload_user_image_complete:self.upload_user_image_complete,
            get_user_image_url:self.get_user_image_url,


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
            get_liked_properties:self.get_liked_properties,

        }

    });

    self.get_users();
    self.get_groups();
    self.get_owned_properties();
    self.get_liked_properties();
    self.get_user_image_url();
    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
