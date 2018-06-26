// This is the js for the default/index.html view.

var app = function() {

    Vue.component('google-map',{
       template:'<div class="google-map" :id="mapName"></div>',

        name: 'google-map',
        props: ['name'],
          data: function () {
            return {
              mapName: this.name + "-map",
            }
          },
          mounted: function () {
            const element = document.getElementById(this.mapName)
            const options = {
              zoom: 14,
              center: new google.maps.LatLng(51.501527,-0.1921837)
            };

            const map = new google.maps.Map(element, options);
          }



    });








Vue.component('slideshow', {
        //https://jsfiddle.net/czbLyn8h/
        template: '' +
        ' <div class="slideshow-container">' + '<div>' +
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
                if(this.currentNumber+1< this.images.length)
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

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };
    // Enumerates an array.
    var enumerate = function(v) { var k=0; return v.map(function(e) {e._idx = k++;});};

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
            {
                page: self.vue.page
            },
            function(data){
                self.vue.listings = data.listings;
                self.vue.has_more = data.has_more;
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
    self.like_property = function(id){
        enumerate(self.vue.liked_properties);
        self.vue.liked_property_id = id;
        console.log(self.vue.liked_property_id);
        console.log("liked property with id:" + id);

        if(self.vue.liked_properties.includes(self.vue.liked_property_id) ){
            self.vue.liked_properties.splice(self.vue.get_index_of_property(id), 1);
        }
        else{
            self.vue.liked_properties.push(id);

        }
        axios.post(like_property_url,{
            property_id:self.vue.liked_property_id,
        })
            .then(function(response){
                if(response == "ok"){
                    self.liked_property_id = null;
                }

            })

    };
    self.get_liked_properties = function(){
        axios.get(get_liked_properties_url)

            .then(function(response){
                self.vue.liked_properties = response.data.liked_properties;
                enumerate(self.vue.liked_properties);

            })
    };
    self.is_property_liked = function(property){
        if(self.vue.liked_properties.includes(property)){
            return true;
        }
        else{
            return false;
        }


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

    self.prev_page = function(){
        self.vue.page -= 1;
        if(self.vue.page === 1){
            self.vue.has_less = false;
        }
        self.get_listings();
    };

    self.next_page = function() {
        self.vue.has_less = true;
        self.vue.page += 1;
        self.get_listings();
    };

    self.cancel_search_button = function(){
        self.vue.form_state_search = "";
        self.vue.form_city_search = "";
        self.vue.form_street_search = "";
        self.vue.form_zip_search = "";
        self.get_listings();
    };

    self.get_index_of_property = function(property){
        var i;
        for(i = 0; i < self.vue.liked_properties.length; i++){
            if(property == self.vue.liked_properties[i].property_id);
            break;
        }
        
        return i;


    };

    self.add_note = function(property_id){
        if(self.vue.form_new_note != null){
            $.post(add_note_url,
            {
                property_id: property_id,
                note: self.vue.form_new_note
            }, function (data) {
                    self.vue.is_adding_note = false;
                    self.vue.form_new_note = "";
            })
        }
    };

    self.see_notes_button = function(){
        self.vue.is_viewing_notes = !self.vue.is_viewing_notes
    };

    self.add_note_button = function(){
        self.vue.is_adding_note = !self.vue.is_adding_note
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
            form_new_note: null,
            has_less: false,
            has_more: false,
            logged_in: false,
            this_user: null,
            liked_property_id: null,
            liked_properties:[],
            page: 1,
            is_viewing_notes: false,
            is_adding_note: false,
        },
        methods: {
            //get_more: self.get_more
            add_property: self.add_property,
            search_button: self.search_button,
            cancel_search_button: self.cancel_search_button,
            like_property: self.like_property,
            get_liked_properties:self.get_liked_properties,
            is_property_liked:self.is_property_liked,
            next_page: self.next_page,
            prev_page: self.prev_page,
            get_index_of_property:self.get_index_of_property,
            see_notes_button: self.see_notes_button,
            add_note_button: self.add_note_button,
            add_note: self.add_note,

        },
    });

    self.get_my_info();
    self.get_listings();
    self.get_liked_properties();

    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
