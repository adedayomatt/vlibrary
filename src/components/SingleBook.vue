<template>
<div>
    <template v-if="ready">
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
                <hr>
                <div>Added: {{timeDiff(book.timestamp.created)}}</div>
                <div>Last Borrowed: <span v-if="book.timestamp.last_borrowed">{{timeDiff(book.timestamp.last_borrowed)}}</span><span v-else><i>never borrowed</i></span></div>
                <div v-if="alreadyBorrowed">
                    Currently with <strong>{{username(book_user)}}</strong> 
                    <span v-if="book_user.last_signin"><i>(signed in:  {{timeDiff(book_user.last_signin)}})</i></span>
                    <span v-else><i>Not seen in a while</i></span>
                </div>
            </v-card-text>
        <v-card-actions>
                <template v-if="alreadyBorrowed">
                    <div>
                        <template v-if="isBookWithMe" >
                            <v-btn text dark small class="primary ma-2" @click="returnBook" :loading="processing">Return to shelf</v-btn>
                            <v-btn text dark small class="primary ma-2" @click="initiateTransfer">Transfer Book</v-btn>
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
                                    <hr>

                                    <v-card-text>
                                        <template v-if="other_users.length > 0">
                                            <p>Select another user to transfer book to</p>
                                            <template>
                                                <v-list rounded>
                                                        <v-list-item
                                                        v-for="(user, i) in other_users"
                                                        :key="i" @click="transferBookTo(user)"
                                                        >
                                                            <v-list-item-content>
                                                                <v-list-item-title>
                                                                    {{username(user)}} <span v-if="user.role">({{user.role}})</span>
                                                                </v-list-item-title>
                                                                <small>
                                                                    <span v-if="user.last_signin"><i>(signed in:  {{timeDiff(user.last_signin)}})</i></span>
                                                                    <span v-else><i>Not seen in a while</i></span>
                                                                </small>
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
                                        <v-btn text small dark class="red" @click="transfer_dialog = false" >
                                                <span>cancel</span>
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>

                        </template>
                    </div>
                </template>
                <template v-else >
                    <v-btn text  dark class="success" @click="borrowBook" :loading="processing">Borrow Book</v-btn>
                </template>
                <v-spacer></v-spacer>
                <v-btn text  dark class="red" small @click="removeBook" :loading="processing"  v-if="isTeacher">Remove Book</v-btn>
        </v-card-actions>
        </v-card>
    </template>
    <template v-else>
        <v-sheet
            :color="`grey lighten-4`"
            class="px-3 pt-3 pb-3"
        >
            <v-skeleton-loader
            class="mx-auto"
            type="card"
            ></v-skeleton-loader>
        </v-sheet>
    </template>
</div>
</template>


<script>
import firebase from './../firebase'

export default {
    data(){
        return {
            ready: false,
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
            return !this.profile.role || this.profile.role == 'student' ? true : false
        },
        alreadyBorrowed(){
            return this.book.user && this.book.user !== null ? true : false;
        },
        isBookWithMe(){
            return this.book.user == this.profile.id ? true : false;
        }
    },
    methods: {
        // prep the book for mounting
        prepBook(){
            this.ready = false
            
        //if the book is with a user
            if(this.alreadyBorrowed){
                this.get_book_user()
                .then((doc) => {
                    // confirm if the user exist first
                    if(doc.exists){
                        this.book_user = doc.data()
                    }else{
                        this.book_user = {name: 'user unavailable'}
                    }
                    // purposely set a delay in rendering
                    setTimeout(() => {
                        this.ready = true
                    },3000)
                   
                })
            }
            else{
                this.ready = true
            }
        },
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
          return firebase.db.collection('users').doc(this.book.user).get()
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
                this.$emit('do-snackbar', `Transfered ${this.book.title} to ${this.username(user)}`, 'success')
            })
            .catch(e=> {
                this.$emit('do-snackbar', `Could not transfer ${this.book.title} to ${this.username(user)}. ${e.message}`, 'warning')
            })
        },
        // decide what to use as displame for a user
        username(user){
            return user.name ? user.name : user.email
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
        this.prepBook()
    },
    watch:{
        _book: function(newData){
            //repreapare the book
            this.book = newData
            this.prepBook()
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