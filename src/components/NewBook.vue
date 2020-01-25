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
                            <v-text-field v-model="title" :rules="titleRules" label="Book name" required></v-text-field>
                            <v-text-field v-model="isbn" :rules="isbnRules" :counter="10" label="Book ISBN" required></v-text-field>
                            <v-text-field v-model="author" :rules="authorRules" label="Author" required></v-text-field>
                            <v-textarea outlined v-model="description" label="Book description"></v-textarea>

                            <!-- <v-select v-model="select" :items="items" :rules="[v => !!v || 'Item is required']" label="Is it available for borrow" required></v-select> -->

                            <v-checkbox v-model="available" label="Book is open to student"></v-checkbox>

                            <v-btn text dark class="red" @click="dialog = false" >
                                <span>cancel</span>
                        </v-btn>
                        <v-btn text class="success ml-2" @click="submitBook" :loading="loading">
                            <span>save</span> 
                        </v-btn>
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
export default {
    data(){
        return {
            dialog: false,
            profile: this.user,
            title: '',
            isbn: '',
            author: '',
            description: '',
            available: true,
            loading: false,
            titleRules: [
                v => !!v || 'Book title is required',
            ],
            authorRules: [
                v => !!v || 'Author name is required',
            ],

            isbnRules: [
                v => (v && v.length == 10) || 'ISBN must be 10 digits',
            ]
        }
    },
    props: ['user'],
    methods:{
        submitBook(){
            if(this.$refs.form.validate()){
                const book = {
                    title: this.title,
                    isbn: this.isbn,
                    author: this.author,
                    description: this.description,
                    available: this.available
                }
                this.loading = true
                firebase.db.collection('books').add(book)
                .then(() => {
                    this.loading = false;
                    this.dialog = false;
                    this.$emit('do-snackbar', `${book.title} added successfully`, 'success')
                    this.emptyFields()
                })
                .catch(() => {
                    this.loading = false;
                    this.$emit('do-snackbar', `${book.title} failed to add`, 'danger');
                })
            }
        },
        emptyFields(){
            this.title = '',
            this.isbn = '',
            this.author = '',
            this.description = '',
            this.available = true
        }
    },
    watch: {
        user: function(newData){
            this.profile = newData
        }
    }
}
</script>