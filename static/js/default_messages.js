var app = function() {




Vue.component('conversation-list', {
    template: `
    <div class="conversation-list">
    
    </div>

    
    `
     ,
    props:['',],

    data: function () {
         return {
        }
    },
    methods:{

    },
    computed: {

    }
});

Vue.component('conversation-list-item', {
    template: `


    
    `
     ,
    props:['',],

    data: function () {
         return {
        }
    },
    methods:{

    },
    computed: {

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


    self.vue = new Vue({
    el: "#vue-div",
    delimiters: ['${', '}'],
    unsafeDelimiters: ['!{', '}'],
    data: {


    },
    methods:{

    }




});

    $("#vue-div").show();

    return self;

    };

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
