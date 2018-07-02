var app = function() {



    Vue.component('add_lfg_post',{
            template:`
            <div class="add-lfg-post">
                <select v-model="selected_city">
                    <option v-for="city in available_cities" :value="city">{{city.city}}</option>
                </select>
                <textarea v-model="post_text" placeholder="Tell the world about yourself"></textarea>
                <button v-on:click="this.post_lfg_post">
                    Post
                </button>
            </div>
            `,
            props:['available_cities'],

            data: function () {
                return{
                    selected_city:null,
                    post_text:'',

                }
            },
            methods:{
                post_lfg_post: function(){
                    axios.post(post_lfg_post_url,{
                        city:this.selected_city.id,
                        post_text:this.post_text,
                    })
                        .then(
                            self.getAllLFGPosts()
                        )
                }

            },

        });


       Vue.component('lfg_post', {
        template: `
        <div class="padded lfg-post">
            <div class="button-bar" v-if="this.logged_in_user != 0">
                <button v-if="lfg_post_data.user_id != logged_in_user" v-on:click="invite_button">
                <!-- I don't like this button -->
                    <p v-if="is_inviting==false">Invite</p>
                    <p v-if="is_inviting==true" >Cancel</p>
                </button>
                <button v-if="is_editing">
                    Delete
                </button>
                <button v-if="is_editing" v-on:click="this.submit_button">
                    Submit
                </button>
                <button v-if="is_editing" v-on:click="this.cancel_button">
                    Cancel
                </button>
                <button v-if="!is_editing && lfg_post_data.user_id == logged_in_user" v-on:click="this.edit_button">
                    Edit
                </button>
            </div>
                        
            <div class="invitation" v-if="this.is_inviting">
                <div class="invitation-controls ">                 
                    <select v-model="selected_group" >
                        <option v-for="group in eligible_groups" :value="group">{{group.group_name}}</option>
                    </select>
                    <button v-on:click="this.send_invitation">
                        Send
                    </button>
                </div>
                <textarea v-model="invitation_text" placeholder="Send a nice message"></textarea>
            </div>
            
            
            <div class="lfg-post-user">
                
                <img v-bind:src="lfg_post_data.image_url" class="thumbnail"/>
                <div class="lfg-post-user-info">
                    <p>{{this.lfg_post_data.first_name}} {{this.lfg_post_data.last_name}}</p>
                    <p>{{this.lfg_post_data.user_email}}</p>

                </div>

            
            </div >
            <p class="lfg-post-text" v-if="!is_editing">{{this.lfg_post_data.post_text}}</p>
            <textarea v-if="is_editing" v-model="post_text">{{post_text}}</textarea>
            
        </div>

        
        
        `
         ,
        props:['lfg_post_data', 'groups', 'logged_in_user', ],

        data: function () {
            return{
                is_inviting:false,
                is_editing:false,
                post_text: this.lfg_post_data.post_text,
                selected_group:null,
                invitation_text:'',
                receiver_id:this.lfg_post_data.user_id,
                eligible_groups: [],



            }
        },
        methods:{
            invite_button:function(){
                this.invitation_text='';
                this.selected_group=null;

                this.is_inviting = !this.is_inviting;
                this.get_eligible_groups();

            },
            edit_button:function(){
                this.is_editing = !this.is_editing;
            },
            cancel_button: function(){
                this.edit_button();
                this.post_text= this.lfg_post_data.post_text;
                //TODO do the same for any future variables added
            },
            submit_button: function(){
                this.lfg_post_data.post_text = this.post_text;
                this.edit_button();

                axios.post(edit_lfg_post_url,{
                    post_text: this.post_text,
                    post_id: this.lfg_post_data.post_id,
                });

            },
             send_invitation: function(){
                    axios.post(send_group_invitation_url,{
                        group_id: this.selected_group.group_id,

                        invitation_text: this.invitation_text,
                        receiver_id: this.receiver_id,

                    });

                        // .then(function(response){
                        //          console.log("number of groups: " + this.groups.length);
                        //         // this.selected_group.members.push(response.data.new_member);
                        //
                        //     for(var i = 0; i < this.groups.length; i++){
                        //         console.log('ALKSDHLASKD');
                        //
                        //         if(this.groups[i].id == this.selected_group.id){
                        //             this.groups[i].members.push(response.data.new_member);
                        //             break;
                        //         }
                        //     }
                        //
                        //
                        // });

                    this.invite_button();
                    self.vue.get_groups2();
                },
            get_eligible_groups: function() {
                this.eligible_groups.length = 0;

                for(var i = 0; i < this.groups.length; i++){
                    for(var j =0; j < this.groups[i].members.length; j++){

                        if(this.receiver_id == this.groups[i].members[j].user_id) {
                            break;
                        }
                        else if(j == this.groups[i].members.length -1){
                            this.eligible_groups.push(this.groups[i]);

                        }
                        else{
                            continue;
                        }

                    }
                }
            },

        },
        computed: {

        }
});
Vue.component('group_member', {
        template: `
        <div class="group-member padded" >
            <img v-bind:src="member.user_image" class="thumbnail" />
            <div class="member-details padded">
                <p>{{member.first_name}} {{member.last_name}} </p>
                <p>{{member.user_email}}</p>
            </div>
            <div v-if="member.is_member == false && member.user_id == logged_in_user"  >
                <button  v-on:click="this.accept_invitation">
                    Accept
                </button>
                <button>
                    Decline
                </button>
            </div>
            <i v-if=" member.is_member == false && member.user_id != logged_in_user" class="far fa-clock"></i>
            
            

        </div>

        
        `
         ,
        props:['member', 'group_id', 'logged_in_user'],

        data: function () {
             return {
            }
        },
        methods:{
            accept_invitation: function(){
                this.member.is_member = true;

                axios.post(accept_invitation_url,{
                    group_id: this.group_id,
                    user_id: this.member.user_id,
                })
            }
        },
        computed: {

        }
});


Vue.component('group', {
        template: `
        <div class="group padded">
            <p>{{group.group_name}}</p>
            <div class="members " v-for="member in group.members">
                <group_member :member="member" :group_id="group.group_id" :logged_in_user="logged_in_user"></group_member>
            </div>
        </div>

        
        `
         ,
        props:['group', 'logged_in_user'],

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
                enumerate(self.vue.groups2);
            })
    };

    self.get_available_cities = function(){
        axios.get(get_available_cities_url)

            .then(function(response){
                self.vue.available_cities = response.data.available_cities;
            })
    };

    self.get_this_user_id = function(){
        axios.get(get_this_user_id_url)

            .then(function(response){
                self.vue.this_user_id = response.data.user_id;
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
        available_cities:[],
        this_user_id: null,

    },
    methods:{
        getAllLFGPosts:self.getAllLFGPosts,
        get_groups:self.get_groups,
        get_groups2:self.get_groups2,
        get_available_cities:self.get_available_cities,
        get_this_user_id:self.get_this_user_id,
    }




});

    self.getAllLFGPosts();
    //self.get_groups();
    self.get_groups2();
    self.get_available_cities();
    self.get_this_user_id();

    $("#vue-div").show();

    return self;

    };

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
