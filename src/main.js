import Vue from 'vue'
import router from './router'
import vuetify from './plugins/vuetify'
import firebase from './firebase'
import App from './App.vue'

Vue.config.productionTip = false
let app;

firebase.auth.onAuthStateChanged(() =>{
  if(!app){
   app = new Vue({
      router,
      vuetify,
      render: h => h(App)
    }).$mount('#app')
    }
  })
