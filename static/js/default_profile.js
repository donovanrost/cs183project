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
    self.add_address = function(){
        axios.post(add_address_url,{
            street: self.vue.form_street,
            city: self.vue.form_city,
            state_: self.vue.form_state_,
            zip: self.vue.form_zip,
        })
            .then(function(response){
                if(response.data.error == null){
                    self.vue.addr_id = response.data.addr_id;
                    this.addr_is_valid = true;
                }
                else{
                    this.addr_is_valid = false;
                }
            })


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
            address: self.vue.addr_id,
            num_bedrooms: self.vue.num_bedrooms,
            num_fullbaths: self.vue.num_fullbaths,
            num_halfbaths: self.vue.num_halfbaths,
            //property_type: self.vue.p_type.id,
            property_type,

        })
            .then(function(response){
                console.log(response)
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


        },
        methods: {
            add_property_button: self.add_property_button,
            add_address: self.add_address,
            get_property_types:self.get_property_types,
            add_property: self.add_property,

        }

    });

    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
