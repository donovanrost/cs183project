// This is the js for the default/index.html view.

var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    function get_listings_url(start_idx, end_idx) {
        var pp = {
            start_idx: start_idx,
            end_idx: end_idx
        };
        return listings_url + "&" + $.param(pp);
    }

    //List out properties on homepage
    self.get_listings = function(){
        $.getJSON(listings_url,
            function(data){
                self.vue.listings = data.listings;
                self.has_more = data.has_more;
            }
        )
    };

    //HELPER FUNCTION FOR GETTING USER INFO
    self.get_my_info = function() {
        $.getJSON(
            get_my_info_url,
            function(data){
                self.vue.logged_in = data.logged_in;
                self.vue.this_user = data.this_user;
            }
        )
    };

    self.search_button = function(){
        if(self.vue.form_street_search == null && self.vue.form_city_search == null &&
            self.vue.form_zip_search == null && self.vue.form_state_search == null){
            self.clear_search_button();
        } else {
            $.getJSON(search_url,
                {
                    street: self.vue.form_street_search,
                    city: self.vue.form_city_search,
                    zip: self.vue.form_zip_search,
                    state: self.vue.form_state_search
                },
                function (data) {
                    self.vue.listings = data.listings
                }
            )
        }
    };

    self.cancel_search_button = function(){
        self.vue.form_state_search = "";
        self.vue.form_city_search = "";
        self.vue.form_street_search = "";
        self.vue.form_zip_search = "";
        self.get_listings();
    };

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            //has_more: false
            listings:[],
            form_state_search: null,
            form_city_search: null,
            form_zip_search: null,
            form_street_search: null,
            form_room_search: null,
            form_bath_search: null,
            has_more: false,
            logged_in: false,
            this_user: null,
        },
        methods: {
            //get_more: self.get_more
            add_property: self.add_property,
            search_button: self.search_button,
            cancel_search_button: self.cancel_search_button
        }
    });

    self.get_my_info();
    self.get_listings();
    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
