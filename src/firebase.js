import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

//initialize firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDYItDPNrz_BEYNZO1jZ7vnpFZs8MXCleU",
    authDomain: "vlibrary-3fcc6.firebaseapp.com",
    databaseURL: "https://vlibrary-3fcc6.firebaseio.com",
    projectId: "vlibrary-3fcc6",
    storageBucket: "vlibrary-3fcc6.appspot.com",
    messagingSenderId: "181540859764",
    appId: "1:181540859764:web:beefa37f1736f551998621",
    measurementId: "G-4S8YEE6MGF"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig)
  
  const db = firebase.firestore()
  const auth =  firebase.auth()
  db.settings({})

  export default {db, auth};
