
// This is the js for the default/profile.html view.



var app = function() {


    Vue.component('slideshow', {
        //https://jsfiddle.net/czbLyn8h/
        template: '' +
        ' <div v-if="images.length > 0" class="slideshow-container">' +
            '<div>' +
        '   </div class="slide fade container"> ' +
             '       <a class="prev" v-on:click="prev">&#10094;</a> ' +
'               <img :src="currentImage" style="width:100%" style="height:150px" />' +

        '       <a class="next" v-on:click="next">&#10095;</a> ' +
    '       </div>   ' +
        '   <div style="text-align:center">\n' +
        '       <span v-for="n in images.length" class="dot" onclick="currentNumber = n-1"></span> ' +
        '   </div>'  +
        '</div>' ,
        props:['images'],

        data: function () {
            return {
                images:[],
                currentNumber: 0,
            }
        },
        methods:{
            next: function() {
                if(this.currentNumber+1 < this.images.length)
                    this.currentNumber += 1;
                console.log("next " + this.currentNumber);
            },
            prev: function() {

                if(this.currentNumber != 0){
                    this.currentNumber -= 1;
                }
                console.log("prev " + this.currentNumber);
            }
        },
        computed: {
    	    currentImage: function() {
      	    return this.images[this.currentNumber % this.images.length];
            }
        }

});



    var self = {};

    Vue.config.silent = false; // show all warnings

          // This example displays an address form, using the autocomplete feature
      // of the Google Places API to help users fill in the information.

      // This example requires the Places library. Include the libraries=places
      // parameter when you first load the API. For example:
      // <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">


      var componentForm = {
        street_number: 'short_name',
        route: 'long_name',
        locality: 'long_name',
        administrative_area_level_1: 'short_name',
        country: 'long_name',
        postal_code: 'short_name'
      };

      self.initAutocomplete = function() {
        // Create the autocomplete object, restricting the search to geographical
        // location types.
        autocomplete = new google.maps.places.Autocomplete(
            /** @type {!HTMLInputElement} */(document.getElementById('autocomplete')),
            {types: ['geocode']});

        // When the user selects an address from the dropdown, populate the address
        // fields in the form.
        autocomplete.addListener('place_changed', self.fillInAddress);
      };


      self.fillInAddress = function() {
        // Get the place details from the autocomplete object.
        var place = autocomplete.getPlace();
        self.vue.form_lat = place.geometry.location.lat();
        self.vue.form_lng = place.geometry.location.lng();
        console.log("lat/log: " + self.vue.form_lat + " / " + self.vue.form_lng);


        for (var component in componentForm) {
          document.getElementById(component).value = '';
          document.getElementById(component).disabled = false;
        }

        // Get each component of the address from the place details
        // and fill the corresponding field on the form.
        for (var i = 0; i < place.address_components.length; i++) {
          var addressType = place.address_components[i].types[0];
            var val = place.address_components[i][componentForm[addressType]];
            if(addressType == 'street_number'){
                self.vue.form_street_number = val;
            }
            if(addressType == 'route'){
                self.vue.form_street = val;
            }
            if(addressType == 'locality'){
                self.vue.form_city = val;
            }
            if(addressType == 'administrative_area_level_1'){
                self.vue.form_state_ = val;
            }
            if(addressType == 'country'){
                self.vue.form_country = val;
            }
            if(addressType == 'postal_code'){
                self.vue.form_zip = val;
            }

          }
        };



    // Bias the autocomplete object to the user's geographical location,
      // as supplied by the browser's 'navigator.geolocation' object.
    self.geolocate = function() {
        self.vue.initAutocomplete();
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            var geolocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            var circle = new google.maps.Circle({
              center: geolocation,
              radius: position.coords.accuracy
            });
            self.vue.autocomplete.setBounds(circle.getBounds());
          });
        }
      };



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
            street_number:self.vue.form_street_number,
            street: self.vue.form_street,
            city: self.vue.form_city,
            state_: self.vue.form_state_,
            zip: self.vue.form_zip,
            country:self.vue.form_country,
            num_bedrooms: self.vue.num_bedrooms,
            num_fullbaths: self.vue.num_fullbaths,
            num_halfbaths: self.vue.num_halfbaths,
            property_type: self.vue.p_type.id,

        })
            .then(function(response){
                console.log(response);
                if(response.data="ok"){
                    self.get_owned_properties();
                    self.vue.form_street_number='';
                    self.vue.form_street='';
                    self.vue.form_city='';
                    self.vue.form_state_='';
                    self.vue.form_zip='';
                    self.vue.form_country='';
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
        // for(var i = 0; i < self.vue.owned_properties.length;i++){
        //     self.vue.get_property_images(self.vue.owned_properties[i].id)
        // }

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

    self.add_member_button = function(group_id){
       self.vue.is_adding_member =  !self.vue.is_adding_member;
    };

    self.add_group_members= function(group_id){
        for(i =0; i <(self.vue.members).length; i++){
            $.post(add_member_url,
               {
                   group_id: group_id,
                   user_id: (self.vue.members)[i].id,
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
                    self.vue.user_image = get_url;
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
        self.get_user_image_url();
    };
    self.upload_complete = function(get_url) {
        // Hides the uploader div.
        self.close_uploader();
        console.log('The file was uploaded; it is now available at ' + get_url);
        // TODO: The file is uploaded.  Now you have to insert the get_url into the database, etc.
        self.insert_property_image_url();
        self.get_owned_properties();
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
            user_image_url: self.vue.user_image,
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
                self.vue.user_image=response.data.image_url;
            })
    };
    self.toggle_expand_properties = function(){
      self.vue.expand_properties = !self.vue.expand_properties;
    };


    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            is_adding_property:false,
            is_adding_listing: false,
            form_street_number:"",
            form_street: "",
            form_city:"",
            form_state_:"",
            form_zip:"",
            form_lat:null,
            form_lng:null,
            form_country:"",
            form_max_occ:"",
            form_rent:'',
            form_start_date: "",
            form_end_date: "",
            addr_id:"",
            addr_is_valid: "",
            property_types:[],
            p_type:"",
            num_bedrooms:"",
            num_fullbaths:"",
            num_halfbaths:"",
            add_property_page:0,
            last_add_property_page:1,
            add_listing_page:0,
            owned_properties:[],
            p_idx: null,
            placeSearch:null,
            autocomplete:null,


            user_image:'',
            is_editing_profile:false,

            // Groups
            is_adding_group: false,
            is_adding_member: false,
            groups: [],
            users: [],
            members: [],
            form_user_search: null,
            form_name: null,
            logged_in: false,
            has_more: false,
            liked_properties:[],
            expand_properties:true,
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
            toggle_expand_properties:self.toggle_expand_properties,
            geolocate:self.geolocate,
            fillInAddress:self.fillInAddress,
            initAutocomplete:self.initAutocomplete,



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
            add_member_button: self.add_member_button,
        },
        computed:{
            user_image_url: function(){
                self.get_user_image_url;
                return this.user_image;
            }
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


