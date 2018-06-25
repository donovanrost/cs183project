var app = function() {

        Vue.component('invitation',{
            template:`
            <div class="invitation">
                <div class="invitation-controls ">                 
                    <select v-model="selected_group">
                        <option v-for="group in groups" :value="group">{{group.group_name}}</option>
                    </select>
                    <button v-on:click="this.send_invitation">
                        Send
                    </button>
                </div>
                <textarea v-model="invitation_text" placeholder="Send a nice message"></textarea>
            </div>
                
            
            `,
            props:['groups', 'receiver_info'],

            data: function () {
            return{
                selected_group:null,
                invitation_text:'',
                receiver_info:this.receiver_info,


            }
            },
            methods:{
                send_invitation: function(){

                    axios.post(send_invitation_to_group_url,{
                        group_id: this.selected_group.group_id,
                        invitation_text: this.invitation_text,
                        receiver_id: this.receiver_info.user_id,

                    });
                }

            },

        });

       Vue.component('lfg_post', {
        template: `
        <div class="padded lfg-post">
            <div class="button-bar">
                <button v-on:click="invite_button">
                <!-- I don't like this button -->
                    <p v-if="is_inviting==false">Invite</p>
                    <p v-if="is_inviting==true" >Cancel</p>
                </button>
                
            </div>
            <invitation v-show="is_inviting==true" :groups="groups" :receiver_info="lfg_post_data"></invitation>
            <div class="lfg-post-user">
                <img v-bind:src="lfg_post_data.image_url" class="thumbnail"/>
                <div class="lfg-post-user-info">
                    <p>{{this.lfg_post_data.first_name}} {{this.lfg_post_data.last_name}}</p>
                    <p>{{this.lfg_post_data.user_email}}</p>

                </div>

            
            </div >
            <p class="lfg-post-text">{{this.lfg_post_data.post_text}}</p>
            
            
        </div>
        
        
        `
         ,
        props:['lfg_post_data', 'groups'],

        data: function () {
            return{
                is_inviting:false,

            }
        },
        methods:{
            invite_button:function(){
                console.log(this.is_inviting);
                this.is_inviting = !this.is_inviting;
            }

        },
        computed: {

        }
});

Vue.component('group', {
        template: `
        <div class="group padded">
            <p>{{group.group_name}}</p>
            <div class="members padded" v-for="member in group.members">
                <p>{{member.first_name}} {{member.last_name}} </p>
                <p>{{member.user_email}}</p>
            </div>
        </div>

        
        `
         ,
        props:['group',],

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

    self.getAllLFGPosts = function(){
        axios.get(get_all_lfg_posts_url)
            .then(function(response){
                self.vue.allLFGPosts=response.data.lfg_posts;
            })
    };

    self.addLFGPost = function(){

    };

    self.get_groups = function () {
        $.getJSON(groups_url,
            function (data) {
            self.vue.groups = data.groups;
            enumerate(self.vue.groups);
        });
    };
    self.get_groups2 = function(){
        axios.get(get_groups2_url)

            .then(function(response){
                self.vue.groups2 = response.data.groups;
            })
    };

    self.vue = new Vue({
    el: "#vue-div",
    delimiters: ['${', '}'],
    unsafeDelimiters: ['!{', '}'],
    data: {
        allLFGPosts:[],
        groups:[],
        groups2:[],

    },
    methods:{
        getAllLFGPosts:self.getAllLFGPosts,
        get_groups:self.get_groups,
        get_groups2:self.get_groups2,
    }




});

    self.getAllLFGPosts();
    //self.get_groups();
    self.get_groups2();

    $("#vue-div").show();

    return self;

    };

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
