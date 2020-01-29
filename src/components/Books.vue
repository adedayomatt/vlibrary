<template>
   <div class="text-center">
    <v-snackbar
          v-model="snackbar"
          :timeout="4000"
          top
          :color="snackbar_color"
      >
          {{snackbar_message}}
          <v-btn text dark class="red" @click.native="snackbar = false">Close</v-btn>
      </v-snackbar>

      <v-container class="px-0 px-sm-3">
            <template v-if="books.length > 0">
                <v-row dense>
                    <v-col
                        v-for="(book, i) in books"
                        :key="i"
                        cols="12" md="6"
                    >
                        <SingleBook :_book="book" :_user="profile" :_other_users="other_users" @do-snackbar="setSnackBar" />
                    </v-col>
                </v-row>
            </template>
            <template v-else>
                <div class="text-center">
                    <p>Nothing found</p>
                </div>
            </template>
        </v-container>


   </div>
</template>

<script>
import firebase from './../firebase'
import SingleBook from './../components/SingleBook';

export default {
    components: {SingleBook},
    data(){
        return {
            logged_in: false,
            profile: this._profile,
            books: [],
            other_users:[],

            snackbar: false,
            snackbar_color:'primary',
            snackbar_message: '',

        }
    },
    props: ['_profile', '_books'],
    computed:{
    },
    created(){
        this.logged_in = this._profile == null ? false : true;
        this.books = this._books.sort((a,b) => b.timestamp.created - a.timestamp.created )
        
        //get other users
        if(this.logged_in){
            let users = []
            firebase.db.collection('users').get()
            .then(res => {
                res.forEach(user =>{
                    if(user.id != this.profile.id){
                        users.push({...user.data(), id: user.id}) //re add all the users again
                    }
                })
                this.other_users = users
            })
        }
    },
    methods: {
        setSnackBar(message, status){
            this.snackbar = true;
            this.snackbar_message = message;
            this.snackbar_color = status;
        },

    },

    watch: {
        _profile: function (newData){
            this.profile = newData
        },
        _books: function (newData){
            this.books = newData
        },

    }

}
</script>

<style scoped>
    .available{
        border-left: 5px solid green;
    }
    .unavailable{
        border-left: 5px solid red;
    }
</style>