<template>
   <div class="text-center">

      <v-container>
              <v-row justify="center">
                <v-col md="6">
                     <template v-if="logged_in">
                        <v-card>
                        <v-card-text>
                            <h2>Signed in</h2>
                            <h4 v-if="profile.name" class="my-2">{{profile.name}}</h4>
                            <p>{{user.email}}</p>
                        </v-card-text>
                        </v-card>
                    </template>
                     <template v-else>
                         <div class="text-center">
                             <h1>Welcome to vLibrary</h1>
                            <div class="mt-3">
                                <router-link to="/signin">
                                    <v-btn text class="primary">Signin</v-btn>
                                </router-link>
                            </div>
                         </div>
                    </template>
                </v-col>
              </v-row>
          
         
      </v-container>
   </div>
</template>

<script>

import firebase from './../firebase'

export default {
    data(){
        return {
            logged_in: false,
            user: {},
            profile: {},
        }
    },
    computed:{

    },
    created(){
        if(firebase.auth.currentUser){
            this.logged_in = true,
            this.user = firebase.auth.currentUser
            firebase.db.collection('users').doc(this.user.uid).get()
            .then((doc) => {
                this.profile =  doc.data()
                this.profile.id = doc.id
            })
        }
    },
    methods: {

},

}
</script>
