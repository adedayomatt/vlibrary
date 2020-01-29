<template>
  <!-- App.vue -->
  <v-app>
        <v-snackbar
          v-model="snackbar"
          :timeout="4000"
          top
          :color="snackbar_color"
      >
          {{snackbar_message}}
          <v-btn dark small text class="red" @click.native="snackbar = false">Close</v-btn>
      </v-snackbar>


    <v-navigation-drawer 
    app 
    v-model="drawer"
    > 
    <template v-slot:prepend>
      <template  v-if="logged_in">
        <v-list-item two-line>
          <!-- <v-list-item-avatar>
            <img src="https://randomuser.me/api/portraits/women/81.jpg">
          </v-list-item-avatar> -->

          <v-list-item-content>
            <v-list-item-title>{{profile.name}}</v-list-item-title>
            <v-list-item-subtitle>{{profile.email}}</v-list-item-subtitle>
            <v-list-item-subtitle class="mt-1"><small>signed in</small></v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </template>
      <template  v-else>
        <v-list-item two-line>
          <v-list-item-content>
            <v-list-item-title>Guest</v-list-item-title>
            <v-list-item-subtitle class="mt-1"><small>not signed in</small></v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </template>

    </template>
      
             
       <v-list>
          <router-link to="/" >
            <v-list-item link
            >
                <v-list-item-icon>
                  <v-icon>mdi-user</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                      <v-list-item>
                        Books
                      </v-list-item>
                </v-list-item-content>
            </v-list-item>
           </router-link>

            <router-link to="/my-books" >
            <v-list-item link
            >
                <v-list-item-icon>
                  <v-icon>mdi-user</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                      <v-list-item>
                        My Books
                      </v-list-item>
                </v-list-item-content>
            </v-list-item>
           </router-link>

            <router-link to="/trash" v-if="isTeacher">
            <v-list-item link
            >
                <v-list-item-icon>
                  <v-icon>mdi-user</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                      <v-list-item>
                        Trashed Books
                      </v-list-item>
                </v-list-item-content>
            </v-list-item>
           </router-link>

          </v-list>

          <template v-slot:append>
          <div class="pa-2">
              <v-btn block dark class="red" v-if="logged_in" @click="signout">Signout</v-btn>
              <router-link to="signin"  v-else>
                  <v-btn block dark class="primary my-5" text>Signin</v-btn>
              </router-link>
              
          </div>
        </template>
    </v-navigation-drawer>

    <v-app-bar 
    app
    src="https://cdn.vuetifyjs.com/images/backgrounds/bg-2.jpg"
    dark

    >
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-toolbar-title>vLibrary</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-app-bar>
    
    <!-- Sizes your content based upon application components -->
    <v-content>
      <NewBook :user="profile" @do-snackbar="setSnackBar" />

      <!-- Provides the application the proper gutter -->
      <v-container fluid>
        <!-- If using vue-router -->
        <router-view></router-view>
      </v-container>
    </v-content>

    <v-footer app>
      <small>By Adedayo Matthews</small>
    </v-footer>
  </v-app>
</template>

<script>
import firebase from './firebase'
import NewBook from './components/NewBook';

export default {
  name: 'App',
  components:{NewBook},
  data(){
    return{
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
                    name : 'My Books',
                    path: '/my-books',
                    require_auth: true,
                },
                {
                    name : 'Trash',
                    path: '/trash',
                    require_auth: true,
                    only_teacher: true,
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
