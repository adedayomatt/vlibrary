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
    <v-toolbar dark prominent src="https://cdn.vuetifyjs.com/images/backgrounds/vbanner.jpg"
    >
      <v-app-bar-nav-icon @click = "drawer = !drawer"></v-app-bar-nav-icon>

      <v-toolbar-title>Library</v-toolbar-title>
      <v-spacer></v-spacer>
      <div class="ma-1">
          <div v-if="logged_in"><strong >{{profile.name}}</strong> ({{profile.role}}) </div>
        <strong v-else>Welcome</strong>
      </div>
      <template v-for="link in links">
          <div :key="link.name" v-if="(link.require_auth && logged_in) || (!link.require_auth && !logged_in) ">
            <router-link  dark :to="link.path" >
                <v-btn text dark color="lighten-2" class="primary ma-1">{{link.name}} </v-btn>
            </router-link>
          </div>
      </template>
       <v-btn text dark class="warning ma-1" @click="signout" v-if="logged_in">
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
                    path: '/',
                    require_auth: true,
                },
                {
                    name : 'Sign in',
                    path: '/signin',
                    require_auth: false,
                },
                {
                    name : 'Sign up',
                    path: '/signup',
                    require_auth: false,
                }

    
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
                this.$router.push('/signin')
            })
        }
    }
}
</script>