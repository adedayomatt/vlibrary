<template>
<div>
    <template v-if="ready">
        <div class="text-left">
            <v-card :class="(isBookTrashed ? 'trashed' : (alreadyBorrowed ? 'unavailable' : 'available'))">
                <v-card-subtitle class="text-left">
                    <div class="text-left">
                        <p>{{book.bib_key}}</p>
                    </div>
                </v-card-subtitle>
                <v-row justify="space-between">
                    <v-col cols="12" md="6">
                        <v-img
                            height="auto"
                            width="100%"
                            :src="book.thumbnail_url"
                        ></v-img>
                    </v-col>

                    <v-col
                    cols="12" md="6"
                    class=""
                    >
                        <a :href="book.preview_url" target="_blank">
                            <v-btn text small class="primary d-md-block ma-2">
                                <v-icon>mdi-eye</v-icon> Preview
                            </v-btn> 
                        </a>
                        <a :href="book.info_url" target="_blank">
                            <v-btn text small class="primary d-md-block ma-2">
                                <v-icon>mdi-eye</v-icon> View info
                            </v-btn>
                        </a>
                        <template v-if="alreadyBorrowed">
                            <template v-if="authenticated && isBookWithMe" >
                                <v-btn text small class="primary ma-2" @click="returnBook" :loading="processing"><v-icon>mdi-restore</v-icon> Return to shelf</v-btn>
                                <v-btn text small class="primary ma-2" @click="initiateTransfer"><v-icon>mdi-share</v-icon> Transfer Book</v-btn>
                                <v-dialog
                                v-model="transfer_dialog"
                                width="500"
                                >     
                                <v-card>
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
                    </template>
                    <template v-else >
                        <v-btn text dark small class="primary ma-2 d-md-block" v-if="!isBookTrashed" @click="borrowBook" :loading="processing"><v-icon>mdi-arrow-right</v-icon> Borrow Book</v-btn>
                    </template>
                    <template v-if="isTeacher">
                        <v-btn text dark class="success ma-2 d-md-block" small @click="restoreBook" :loading="processing"  v-if="isBookTrashed"><v-icon>mdi-restore</v-icon> Restore Book</v-btn>
                        <v-btn text dark class="red ma-2 d-md-block" small @click="removeBook" :loading="processing"  v-else><v-icon>mdi-delete</v-icon> Remove Book</v-btn>
                    </template>
                    </v-col>
                </v-row>
                <v-card-text class="text-left">
                    <div>Added: {{timeDiff(book.timestamp.created)}}</div>
                    <div>Last Borrowed: <span v-if="book.timestamp.last_borrowed">{{timeDiff(book.timestamp.last_borrowed)}}</span><span v-else><i>never borrowed</i></span></div>
                    <div v-if="alreadyBorrowed">
                        Currently with <strong>{{username(book_user)}}</strong> 
                        <span v-if="book_user.last_signin"><i>(signed in:  {{timeDiff(book_user.last_signin)}})</i></span>
                        <span v-else><i>Not seen in a while</i></span>
                    </div>
                    <div v-else>
                        Available 
                    </div>
                </v-card-text>
            </v-card>
        </div>

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
        authenticated(){
            return this.profile == null ? false : true
        },
        isTeacher(){
            return this.authenticated && this.profile.role == 'teacher' ? true : false
        },
        isStudent(){
            return !this.profile.role || this.profile.role == 'student' ? true : false
        },
        alreadyBorrowed(){
            return this.book.user && this.book.user !== null ? true : false;
        },
        isBookWithMe(){
            return this.book.user == this.profile.id ? true : false;
        },
        isBookTrashed(){
            return this.book.trashed == null ? false : true
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
            if(this.authenticated){
                this.processing = true
                firebase.db.collection('books').doc(this.book.id).update({
                    user: this.profile.id
                })
                .then(() => {
                    this.processing = false
                    this.$emit('do-snackbar', `Book borrowed`, 'success')
                })
                .catch(e => {
                    this.processing = false
                    this.$emit('do-snackbar', `Could not get the book to you now. ${e.message}`, 'warning')
                })
            }else{
                this.$emit('do-snackbar', `Sign in first`, 'success')
            }
        },
        returnBook(){
            this.processing = true
            firebase.db.collection('books').doc(this.book.id).update({
                user: null
            })
            .then(() => {
                this.processing = false
                this.$emit('do-snackbar', `Thank you for the return`, 'success')
            })
            .catch(e => {
                this.processing = false
                this.$emit('do-snackbar', `Could not return the book at the moment. ${e.message}`, 'warning')
            })
        },
        removeBook(){
            if(this.alreadyBorrowed){
                this.$emit('do-snackbar', `Book is currently checked out cannot be removed`, 'red')
            }else{
                this.processing = true
                firebase.db.collection('books').doc(this.book.id).update({
                    trashed: this.nowTimestamp()
                })
                .then(() => {
                    this.processing = false
                    this.$emit('do-snackbar', `Book removed`, 'success')
                })
                .catch(e => {
                    this.processing = false
                    this.$emit('do-snackbar', `Could not remove the book at the moment. ${e.message}`, 'warning')
                })
            }
        },
        restoreBook(){
            if(this.alreadyBorrowed){
                this.$emit('do-snackbar', `Book is currently checked out cannot be removed`, 'red')
            }else{
                this.processing = true
                firebase.db.collection('books').doc(this.book.id).update({
                    trashed: null
                })
                .then(() => {
                    this.processing = false
                    this.$emit('do-snackbar', `Book restored`, 'success')
                })
                .catch(e => {
                    this.processing = false
                    this.$emit('do-snackbar', `Could not restore the book at the moment. ${e.message}`, 'warning')
                })
            }
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
                this.$emit('do-snackbar', `Book transfered to ${this.username(user)}`, 'success')
            })
            .catch(e=> {
                this.$emit('do-snackbar', `Could not transfer book to ${this.username(user)}. ${e.message}`, 'warning')
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
    },
    nowTimestamp(){
        return Math.round(new Date().getTime()/1000)
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
        border: 5px solid green;
    }
    .unavailable{
        border: 5px solid yellow;
    }
    .trashed{
        border: 5px solid red;
    }
</style>