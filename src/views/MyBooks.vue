<template>
      <v-container>
         <h4>My Books ({{books.length}})</h4>
          <template v-if="ready">
            <Books :_books="books" :_profile="profile" :_other_users="other_users" />
          </template>
          <template v-else>
              <Loading />
          </template>
        </v-container>
</template>

<script>
import firebase from './../firebase'
import Books from './../components/Books';
import Loading from './../components/Loading';

export default {
    components: {Books, Loading},
    data(){
        return {
            ready: false,
            logged_in: false,
            user: {},
            profile: null,
            other_users: null,
            books: [],
        }
    },
    computed:{
        isTeacher(){
            return this.logged_in && this.profile.role == 'teacher' ? true : false
        },
        isStudent(){
            return this.logged_in && this.profile.role == 'student' ? true : false
        },
    },
    created(){
        if(firebase.auth.currentUser){
            this.logged_in = true,
            this.user = firebase.auth.currentUser
           firebase.db.collection('users').doc(this.user.uid).get()
           .then(doc => {
                this.profile =  doc.data()
                this.profile.id = doc.id
                this.getBooks()
           })
        }
    },
    methods: {
        getBooks(){
            firebase.db.collection('books').where('user', '==',this.profile.id).onSnapshot(res => {
                this.ready = true
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

        }
    },

}
</script>
