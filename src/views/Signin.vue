<template>
    <div>
          <v-dialog
            v-model="profile.dialog"
            width="500"
            >
              <v-card>
                  <v-card-title
                  class="headline"
                  primary-title
                  >
                  Set up profile
                  </v-card-title>
                  
                  <v-card-text>
                    <div class="text-center">
                      <p>It's awesome that you signed in with Google! We found out that it's your first sign in, Now let's get to know you here too.</p>
                      <h4>It's just a one time thingy</h4>
                    </div>
                      <v-form ref="profile" >
                         <v-text-field 
                                v-model="profile.email" 
                                label="Email" 
                                type="email"
                                readonly
                                >
                          </v-text-field>

                            <v-text-field 
                              v-model="profile.name" 
                              label="Fullname" 
                              :rules="[rules.required]" 
                              type="text"
                              >
                              </v-text-field>

                           <v-text-field 
                                v-model="profile.password" 
                                :rules="[rules.required]" 
                                label="Password" 
                                :append-icon="show_password ? 'mdi-eye' : 'mdi-eye-off'" 
                                :type="show_password ? 'text' : 'password'"
                                @click:append="profile.show_password = !profile.show_password"
                                >
                           </v-text-field>
                            <v-checkbox v-model="profile.teacher" label="I am teacher, i can add books"></v-checkbox>
                        <v-btn text class="ma-2" @click="cancelProfileSetup">
                            <span>cancel</span> 
                        </v-btn>
                        <v-btn text class="success ma-2" @click="setupProfile" :loading="profile.setting_up">
                            <span>Save</span> 
                        </v-btn>
                      </v-form>
                  </v-card-text>
              </v-card>
            </v-dialog>

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
                                <v-btn text class="success ma-2"  :loading="signingin" @click="signin" >
                                    <span>Sign in</span> 
                                </v-btn>
                                <v-btn text dark class="primary ma-1" @click="signInWithGoogle">
                                    Signin with Google
                                </v-btn>

                            </v-form>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
    </div>
</template>

<script>
import fb from 'firebase'
import firebase from './../firebase'
import router from './../router'

export default {
    data(){
        return {
            profile_dialog: false,
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
            profile: {
                uid: '',
                dialog: false,
                name: '',
                email: '',
                password: '',
                teacher: false,
                show_password: false,
                setting_up: false
            }

        }
    },
    methods:{
        signin(){
            this.signingin = true;
            let signed_in_user
            if(this.$refs.loginForm.validate()){
                firebase.auth.signInWithEmailAndPassword(this.email, this.password)
                .then((user) => {
                    signed_in_user = user.user
                   return firebase.db.collection('users').doc(user.user.uid).update({last_signin: Math.floor(new Date().getTime())})
                })
                .then(() =>{
                    this.signingin = false
                    alert(`signed in as ${signed_in_user.email}`)
                    this.goOn()
                })
                .catch(e => {
                    this.signingin = false;
                    this.$emit('sign-in', `${this.email} failed to log in: ${e.message}`, 'danger')
                    alert(`${this.email} failed to sign in: code: ${e.code} message:${e.message}`)
                })
            }
        },

        signInWithGoogle(){
            let userRef, signin, setup_profile = false
            let provider = new fb.auth.GoogleAuthProvider()
            firebase.auth.signInWithPopup(provider).then((result) => {
                // This gives a Google Access Token. You can use it to access the Google API.
                // var token = result.credential.accessToken;

                //pass some data to the global scope of the method to be used in other chined promise
                signin = result
                userRef = firebase.db.collection('users').doc(result.user.uid)
                return userRef.get()
                })
                .then((snapshot) => {
                  if(snapshot.exists){//if the user record already exist
                      return userRef.update({
                          last_signin: Math.floor(new Date().getTime())
                      })
                    }
                    else{//if no record before, first time sign in
                      setup_profile = true
                      this.profile.uid = snapshot.id
                      this.profile.email = signin.user.email
                      return userRef.set({
                          email: signin.user.email,
                          last_signin: Math.floor(new Date().getTime())
                      })
                    }
                })
                .then(() => {
                  if(setup_profile){//if there is need to set up profile (first time Google sign in)
                    this.profile.dialog = true
                  }
                  else{
                    this.goOn()
                  }
                })
                .catch((error) => {
                   alert(`Sign in failed: ${error.message}`)
                    // // Handle Errors here.
                    // let errorCode = error.code;
                    // let errorMessage = error.message;
                    // // The email of the user's account used.
                    // let email = error.email;
                    // // The firebase.auth.AuthCredential type that was used.
                    // let credential = error.credential;
            });
        },
        setupProfile(){
          if(this.$refs.profile.validate()){
            this.profile.setting_up = true
              firebase.db.collection('users').doc(this.profile.uid).update({
                name: this.profile.name,
                role: this.profile.teacher ? 'teacher' : 'student',
              })
              .then(() => {
                //create an email/password credentials
                let credential = fb.auth.EmailAuthProvider.credential(this.profile.email, this.profile.password);
                // link the account with email auuthentication
                fb.auth().currentUser.linkWithCredential(credential)
                .then(() => {
                    this.profile.setting_up = false
                    alert('You can now sign in with your Google account or email/password')
                    this.goOn()
                  }, (error) => {
                    alert("Account linking error", error);
                  });
              })
          }
        },
        cancelProfileSetup(){
          this.profile_dialog = false
          alert("Alright, you can only be signing in with your google account")
          this.goOn()
        },
        goOn(){
            router.go({path: '/'})
        }
    },
}
</script>