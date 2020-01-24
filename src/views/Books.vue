<template>
   <div class="text-center">
    <v-snackbar
          v-model="snackbar"
          :timeout="4000"
          top
          :color="snackbar_color"
      >
          {{snackbar_message}}
          <v-btn text color="primary" @click.native="snackbar = false">Close</v-btn>
      </v-snackbar>

        <NewBook v-if="isTeacher" @do-snackbar="setSnackBar" />

        <h4>Books</h4>


      <v-container>
        <template v-if="books.length > 0">
            <v-row dense>
    
            <v-col
                v-for="(book, i) in books"
                :key="i"
                cols="12"
            >
                <SingleBook :_book="book" :_user="profile" :_other_users="other_users" @do-snackbar="setSnackBar" />
            </v-col>
            </v-row>
        </template>
        <template v-else>
            <div class="text-center">
                <h1>Oops! can't find any book at the moment</h1>
            </div>
        </template>
      </v-container>


   </div>
</template>

<script>
import firebase from './../firebase'
import NewBook from './../components/NewBook';
import SingleBook from './../components/SingleBook';

export default {
    components: {NewBook, SingleBook},
    data(){
        return {
            logged_in: false,
            user: {},
            profile: {},
            snackbar: false,
            snackbar_color:'primary',
            snackbar_message: '',
            books: [],

            other_users: [],
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
            .then((doc) => {
                this.profile =  doc.data()
                this.profile.id = doc.id
            })
        }

        firebase.db.collection('books').orderBy('timestamp.created', 'desc').onSnapshot(res => {
            const changes = res.docChanges()
            changes.forEach(change => {
                if(change.type == 'added'){
                    this.books.unshift({
                        ...change.doc.data(),
                        id: change.doc.id,
                    })
                }
                //if there is any modification in the querySnapshot, update it in the local data here
                if(change.type == 'modified'){
                    this.books = this.books.map(book =>
                        book.id === change.doc.id
                            ? {...change.doc.data(), id: change.doc.id }
                            : book
                        );
                    // this.setSnackBar(`${modified.title} has been modified`, 'success');
                }

                //if a document was remoed
                if(change.type == 'removed'){
                    this.books.splice(this.books.findIndex(book => book.id === change.doc.id), 1);
                }
            })
        })

    firebase.db.collection('users').onSnapshot(res => {
        const user_changes = res.docChanges()
        this.other_users = []; //empty the array...
        user_changes.forEach(change => {
            let ou = []
            if(change.doc.id != this.profile.id){
               ou.push({...change.doc.data(), id: change.doc.id}) //re add all the users again
            }
             this.other_users = ou
        })
    })
    },
    methods: {
        setSnackBar(message, status){
            this.snackbar = true;
            this.snackbar_message = message;
            this.snackbar_color = status;
        }
    },

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