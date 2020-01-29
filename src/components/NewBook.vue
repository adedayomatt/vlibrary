<template>
  <div class="text-center">
      <v-responsive>
            <v-dialog
            v-model="dialog"
            width="500"
            >
            <template v-slot:activator="{ on }">
                <v-btn
                    v-on="on"
                    color="blue"
                    dark
                    small
                    fixed
                    bottom
                    right
                    fab>
                    <v-icon>mdi-plus</v-icon>
                </v-btn>
            </template>

            <v-card>
                <v-card-title
                class="headline text-center"
                primary-title
                >
                Add Book
                </v-card-title>
                <hr>

                <v-card-text>
                    <template v-if="profile.role && profile.role == 'teacher'">
                        <v-form ref="form" >
                            <v-text-field v-model="isbn" :rules="isbnRules" :counter="13" label="Book ISBN" required></v-text-field>
                            <div>
                                <small>Book will be fetched with ISBN from <a href="https://openlibrary.org" target="_blank">https://openlibrary.org</a>  API</small>
                            </div>
                            <template v-if="book_fetch_status == 'fetched' && book != null">
                                 <v-card class="mx-auto">
                                    <v-container>
                                    <v-row justify="space-between">
                                        <v-col cols="12" md="8">
                                        <v-img
                                            height="auto"
                                            width="100%"
                                            :src="book.thumbnail_url"
                                        ></v-img>
                                        </v-col>

                                        <v-col
                                        cols="12" md="4"
                                        class="text-center pl-0"
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
                                        </v-col>
                                    </v-row>
                                    </v-container>
                                </v-card>
                            </template>
                            <template v-else-if="book_fetch_status == 'fetching'">
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
                            <div class="mt-5">
                                <v-btn text small dark class="red" @click="dialog = false" >
                                    <span>cancel</span>
                                </v-btn>
                                <v-btn text small class="success ml-2" @click="fetchBook" :loading="book_fetch_status == 'fetching' ? true : false">
                                    <span>Fetch Book</span> 
                                </v-btn>
                                <v-btn text small class="success ml-2" v-if="book_fetch_status == 'fetched' && book != null" @click="addBook" :loading="adding_book">
                                    <span>Add Book</span> 
                                </v-btn>
                            </div>
                        </v-form>
                    </template>
                    <template v-else>
                        <div class="text-center my-5">
                            <h4>Oops, you are not authorized!</h4>
                            <p>Only teachers are allowed to add book to the library</p>
                        </div>
                    </template>
                </v-card-text>

                <v-card-actions>
                
                </v-card-actions>
            </v-card>


            </v-dialog>

      </v-responsive>
  </div>
</template>

<script>
import firebase from './../firebase'
import axios from 'axios'
export default {
    data(){
        return {
            dialog: false,
            profile: this.user,
            isbn: '',
            book: null,
            adding_book: false,
            book_fetch_status: null,
            isbnRules: [
                v => !!v || 'ISBN is required',
            ]
        }
    },
    props: ['user'],
    methods:{
        fetchBook(){
            this.book_fetch_status = 'fetching';
            let book;
            if(this.$refs.form.validate()){
                axios.get(`https://openlibrary.org/api/books?bibkeys=ISBN:${this.isbn}&format=json`)
                .then(response => {
                    this.book_fetch_status = 'fetched'
                    book = response.data[`ISBN:${this.isbn}`] == undefined ? null : response.data[`ISBN:${this.isbn}`]
                    if(book == null){
                        this.$emit('do-snackbar', `No book was found with ISBN: ${this.isbn}`, 'red')
                    }else{
                        this.$emit('do-snackbar', `Book with ISBN: ${this.isbn} found!`, 'success')
                    }
                        this.book = book
                        this.book_fetch_status = 'fetched'

                })
                .catch(e => {
                    this.book_fetch_status = 'fetched'
                    this.$emit('do-snackbar', `could not fetch the ISBN from the openlibrary API. ${e.message}`, 'red');
                })
            }
        },
        addBook(){
                this.adding_book = true
                if(this.book != null){
                    firebase.db.collection('books').add({...this.book, trashed: null})
                    .then(() => {
                        this.adding_book = false;
                        this.$emit('do-snackbar', `New book added successfully`, 'success')
                        this.dialog = false;
                    })
                    .catch(() => {
                        this.loading = false;
                        this.$emit('do-snackbar', `failed to add new book`, 'red');
                    })
                }else{
                        this.$emit('do-snackbar', `No book to add`, 'red');
                }
        },

    reset(){
            this.isbn = '';
            this.book = null;
        }
    },
    watch: {
        user: function(newData){
            this.profile = newData
        }
    }
}
</script>