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
                        Signin
                        </v-card-title>
                        <v-card-subtitle>Authentication</v-card-subtitle>
                        <v-card-text>
                            <v-form ref="loginForm" >
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
                                </v-text-field>
                                <v-btn text class="success ml-2"  :loading="signingin" @click="signin" >
                                    <span>Sign in</span> 
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
            signingin: false,
            signedin: false,
            show_password: false,
            email: '',
            password: '',
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
        signin(){
            this.signingin = true;
            if(this.$refs.loginForm.validate()){
                firebase.auth.signInWithEmailAndPassword(this.email, this.password)
                .then((user) => {
                    this.signingin = false
                    alert(`signed in as ${user.user.email}`)
                    router.push({name: 'home'})
                })
                .catch(e => {
                    this.signingin = false;
                    this.$emit('sign-in', `${this.email} failed to log in: ${e.message}`, 'danger')
                    alert(`${this.email} failed to log in: ${e.message}`)
                })
            }
        },
    },
    created(){

    }
}
</script>