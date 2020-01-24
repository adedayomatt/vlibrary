<template>
 <v-card :class="!alreadyBorrowed ? 'available' : 'unavailable' ">
        <v-card-title
            class="headline"
            v-text="book.title"
        ></v-card-title>
        <v-card-subtitle class="text-left">
            <div class="text-left">
                <small>Author: {{book.author}}</small>
            </div>
        </v-card-subtitle>
        <v-card-text class="text-left">
            <div>ISBN: {{book.isbn}}</div>
            <p>{{book.description}}</p>
            <div>Added: {{timeDiff(book.timestamp.created)}}</div>
            <div>Last Borrowed: <span v-if="book.timestamp.last_borrowed">{{timeDiff(book.timestamp.last_borrowed)}}</span><span v-else><i>never borrowed</i></span></div>
            <div v-if="alreadyBorrowed">
                Currently with <strong>{{book_user ? book_user.name : ''}}</strong>
            </div>
        </v-card-text>
    <v-card-actions>
            <template v-if="alreadyBorrowed">
                <div>
                    <template v-if="isBookWithMe" >
                        (Me)
                        <v-btn text dark class="primary mx-2" @click="returnBook" :loading="processing">Return to shelf</v-btn>
                        <v-btn text dark class="primary mx-2" @click="initiateTransfer">Transfer Book</v-btn>

                        <v-dialog
                        v-model="transfer_dialog"
                        width="500"
                        >     <v-card>
                                <v-card-title
                                class="headline"
                                primary-title
                                >
                                Transfer Book: {{book.title}}
                                </v-card-title>

                                <v-card-text>
                                    <template v-if="other_users.length > 0">
                                        <p>Select another user to transfer book to</p>
                                        <template>
                                            <v-list rounded>
                                                <v-subheader>Users</v-subheader>
                                            
                                                    <v-list-item
                                                    v-for="(user, i) in other_users"
                                                    :key="i" @click="transferBookTo(user)"
                                                    >
                                                        <v-list-item-icon>
                                                            <v-icon>mdi-acount</v-icon>
                                                        </v-list-item-icon>
                                                        <v-list-item-content>
                                                            <v-list-item-title v-text="user.name"></v-list-item-title>
                                                        </v-list-item-content>
                                                    </v-list-item>
                                            
                                            </v-list>
                                        </template>
                                    </template>
                                    <template v-else>
                                        <h4>No other user to transfer to</h4>
                                    </template>
                                </v-card-text>

                                <v-card-actions>
                                    <v-btn text class="danger" @click="transfer_dialog = false" >
                                            <span>cancel</span>
                                    </v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>

                    </template>
                </div>
            </template>
            <template v-else >
                <v-btn text  dark class="success" @click="borrowBook" :loading="processing"  v-if="isStudent">Borrow Book</v-btn>
            </template>
            <v-spacer></v-spacer>
            <v-btn text  dark class="red" @click="removeBook" :loading="processing"  v-if="isTeacher">Remove Book</v-btn>
    </v-card-actions>
    </v-card>
</template>


<script>
import firebase from './../firebase'

export default {
    data(){
        return {
            processing: false,
            book: this._book, //get the book from the prop
            profile: this._user,
            book_user: null,

            transfer_dialog: false,
            other_users: this._other_users,
        }
    },
    props: ['_user', '_book', '_other_users'],
    computed:{
        isTeacher(){
            return this.profile.role == 'teacher' ? true : false
        },
        isStudent(){
            return this.profile.role == 'student' ? true : false
        },
        alreadyBorrowed(){
            return this.book.user && this.book.user !== null ? true : false;
        },
        isBookWithMe(){
            return this.book.user == this.profile.id ? true : false;
        }
    },
    methods: {
        borrowBook(){
            this.processing = true
            firebase.db.collection('books').doc(this.book.id).update({
                user: this.profile.id
            })
            .then(() => {
                this.processing = false
                this.$emit('do-snackbar', `You have borrowed ${this.book.title}`, 'success')
            })
            .catch(e => {
                this.processing = false
                this.$emit('do-snackbar', `Could not get the book to you now. ${e.message}`, 'warning')
            })
        },
        returnBook(){
            this.processing = true
            firebase.db.collection('books').doc(this.book.id).update({
                user: null
            })
            .then(() => {
                this.processing = false
                this.$emit('do-snackbar', `Thank you for returning ${this.book.title}`, 'success')
            })
            .catch(e => {
                this.processing = false
                this.$emit('do-snackbar', `Could not return ${this.book.title} at the moment. ${e.message}`, 'warning')
            })
        },
        removeBook(){
            this.processing = true
            firebase.db.collection('books').doc(this.book.id).delete()
            .then(() => {
                this.processing = false
                this.$emit('do-snackbar', `Removed ${this.book.title}`, 'success')
            })
            .catch(e => {
                this.processing = false
                this.$emit('do-snackbar', `Could not remove ${this.book.title} at the moment. ${e.message}`, 'warning')
            })
        },
        get_book_user(){
          firebase.db.collection('users').doc(this.book.user).get()
          .then(doc => {
             this.book_user = doc.data()
          })
        },
        initiateTransfer(){
            this.transfer_dialog = true
        },
        transferBookTo(user){
            firebase.db.collection('books').doc(this.book.id).update({
                user: user.id
            })
            .then(()=>{
                this.transfer_dialog = false
                this.$emit('do-snackbar', `Transfered ${this.book.title} to ${user.name}`, 'success')
            })
            .catch(e=> {
                this.$emit('do-snackbar', `Could not transfer ${this.book.title} to ${user.name}. ${e.message}`, 'warning')
            })
        },
     timeDiff(timestamp){
        let date = new Date((timestamp*1000));
        let now = new Date();
        let seconds_difference = now.getTime() - date.getTime();
        let diff = '';
        if(seconds_difference > 604800000){
        diff = Math.floor(seconds_difference/604800000)+'w'; // estimate in weeks
        }else if(seconds_difference > 86400000){
        diff = Math.floor(seconds_difference/86400000)+'d'; // estimate in days
        }else if(seconds_difference > 3600000){
        diff = Math.floor(seconds_difference/3600000)+'h'; // estimate in hours
        }else if(seconds_difference > 60000){
        diff = Math.floor(seconds_difference/60000)+'m'; // estimate in minutes
        }else{
        let sec = Math.floor(seconds_difference/1000);
        diff = (sec < 0 ? 0 : sec) +'s' //estimate in seconds
        }
        return date.toDateString()+', '+diff+' ago';
  }

    },
    created(){
        //if the book is with a user
        if(this.alreadyBorrowed){
            this.get_book_user()
        }

    },
    watch:{
        _book: function(newData){
            this.book = newData
            if(this.book.user){ //if the book user has been changed, get the new person
                this.get_book_user()
            }
        },
        _user: function(newData){
            this.profile = newData
        },
        _other_users: function(newData){
            this.other_users = newData
        }
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