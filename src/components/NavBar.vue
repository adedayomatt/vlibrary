<template>
  <nav>
      <v-snackbar
          v-model="snackbar"
          :timeout="4000"
          top
          :color="snackbar_color"
      >
          {{snackbar_message}}
          <v-btn text color="primary" @click.native="snackbar = false">Close</v-btn>
      </v-snackbar>

      <template>
            <v-card
                class="mx-auto"
                width="256"
            >
            <v-navigation-drawer
                class="deep-purple accent-4"
                dark
                app
                v-model="drawer"
                src="https://cdn.vuetifyjs.com/images/backgrounds/bg-2.jpg"
            >
                <v-list>
                <v-list-item
                    v-for="item in links"
                    :key="item.title"
                    link
                >
                    <v-list-item-icon>
                    <v-icon>mdi-user</v-icon>
                    </v-list-item-icon>

                    <v-list-item-content>
                    <v-list-item-title>{{ item.name }}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                </v-list>

                <template v-slot:append>
                <div class="pa-2">
                    <v-btn block>Logout</v-btn>
                </div>
                </template>
            </v-navigation-drawer>
        </v-card>
    </template>

    <v-toolbar dark prominent src="https://cdn.vuetifyjs.com/images/backgrounds/vbanner.jpg"
    >
      <v-toolbar-title>vLibrary</v-toolbar-title>
      <v-spacer></v-spacer>
      <div class="ma-1">
          <div v-if="logged_in"><strong >{{profile.name}}</strong> ({{profile.role}}) </div>
        <strong v-else>Welcome</strong>
      </div>

        <router-link  dark to="/" >
            <v-btn text dark color="lighten-2" class="primary ma-1">Home</v-btn>
        </router-link>
      <template v-for="link in links">
          <div :key="link.name" v-if="(link.require_auth && logged_in) || (!link.require_auth && !logged_in) ">
            <router-link  dark :to="link.path" >
                <v-btn text dark color="lighten-2" class="primary ma-1">{{link.name}} </v-btn>
            </router-link>
          </div>
      </template>
       <v-btn text dark class="red ma-1" @click="signout" v-if="logged_in">
           Signout
       </v-btn>
    </v-toolbar>


    
  </nav>

  
</template>

<script>

import firebase from './../firebase'

export default {

    data(){
        return {
            logged_in: false,
            user: {},
            profile: {},
            drawer: false,
            snackbar: false,
            snackbar_color:'primary',
            snackbar_message: '',
            links: [
                {
                    name : 'Books',
                    path: '/books',
                    require_auth: true,
                },
                {
                    name : 'Sign in',
                    path: '/signin',
                    require_auth: false,
                },
                // {
                //     name : 'Sign up',
                //     path: '/signup',
                //     require_auth: false,
                // }

    
            ]
        }
    },
    computed:{
        isTeacher(){
            return this.logged_in && this.profile.role == 'teacher' ? true : false
        },
        isStudent(){
            return this.logged_in && this.profile.role == 'student' ? true : false
        }
    },
    created(){
        if(firebase.auth.currentUser){
            this.logged_in = true,
            this.user = firebase.auth.currentUser
            firebase.db.collection('users').doc(this.user.uid).get()
            .then((user) => {
                this.profile =  user.data();
            })
        }
    },
    methods:{
        setSnackBar(message, status){
            this.snackbar = true;
            this.snackbar_message = message;
            this.snackbar_color = status;
        },
        signout(){
            firebase.auth.signOut()
            .then(() => {
                this.logged_in = false
                this.user = null
                this.setSnackBar("Signed out", "success")
                this.$router.go({path: '/'})
            })
        }
    }
}
</script>