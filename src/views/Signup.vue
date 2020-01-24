<template>
    <div>
        <v-row
            align="center"
            justify="center"
        >
            <v-col
            md="6"
            >
                <v-card>
                    <v-card-title
                        class="headline"
                    >
                    Signup
                    </v-card-title>
                    <v-card-subtitle>Authentication</v-card-subtitle>
                        <v-card-text>
                            <v-form ref="loginForm" >
                                <v-text-field 
                                v-model="name" 
                                label="Fullname" 
                                :rules="[rules.required]" 
                                type="text"
                                >
                                </v-text-field>

                                <v-text-field 
                                v-model="email" 
                                label="Email" 
                                :rules="[rules.required, rules.email]" 
                                type="email"
                                >
                                </v-text-field>

                                <v-text-field 
                                v-model="password" 
                                :rules="[rules.required]" 
                                label="Password" 
                                :append-icon="show_password ? 'mdi-eye' : 'mdi-eye-off'" 
                                :type="show_password ? 'text' : 'password'"
                                @click:append="show_password = !show_password"
                                >
                                >
                                </v-text-field>
                                <v-checkbox v-model="teacher" label="Signup as teacher"></v-checkbox>

                                <v-btn text class="success ml-2" @click="signup" :loading="signingup">
                                    <span>Sign up</span> 
                                </v-btn>
                            </v-form>
                        </v-card-text>
                </v-card>

            </v-col>

        </v-row>
    </div>
</template>

<script>
import firebase from './../firebase'
import router from './../router'

export default {
    data(){
        return {
            signingup: false,
            name: '',
            email: '',
            password: '',
            teacher: false,
            show_password: false,
            rules: {
                required: value => !!value || 'Required.',
                counter: value => value.length <= 20 || 'Max 20 characters',
                email: value => {
                    const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                    return pattern.test(value) || 'Invalid e-mail.'
                },
            },
        }
    },
    methods:{
        signup(){
            this.signingup = true;
            if(this.$refs.loginForm.validate()){
                firebase.auth.createUserWithEmailAndPassword(this.email, this.password)
                .then((user) => {
                    return firebase.db.collection('users').doc(user.user.uid).set({
                        name: this.name,
                        role: this.teacher ? 'teacher' : 'student'
                    })
                })
                .then(() => {
                    this.signingup = false;
                    router.push({name: 'home'})
                })
                .catch(e => {
                    this.signingup = false;
                    alert(`${this.email} failed to sign up: ${e.message}`)
                })
            }
        },    },
    created(){

    }
}
</script>