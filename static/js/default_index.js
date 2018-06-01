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

    self.add_property = function(){

    };




//FOR LISTING PROPERTIES
    self.get_properties = function(){
        //List out properties on homepage
        $.getJSON(
            get_properties_url,
            function(data){
                self.vue.properties = data.property_types;
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
                self.vue.my_user_id = data.my_user_id;
            }
        )
    };


    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            //has_more: false
            properties:[],
            logged_in: false,
            my_user_id: null,
            this_user: null,
        },
        methods: {
            //get_more: self.get_more
            add_property: self.add_property,
        }

    });



    //self.get_properties();

    $("#vue-div").show();
    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
