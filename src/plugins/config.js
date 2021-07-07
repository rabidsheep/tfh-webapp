import firebase from 'firebase'
import 'firebase/firestore'
import 'firebase/auth'

const configs = {
    apiKey: "AIzaSyDTFNrPqlFJ4M4b5S-PTB-l5Nbo4M8CLTk",
    authDomain: "tfh-webapp.firebaseapp.com",
    databaseURL: "https://tfh-webapp-default-rtdb.firebaseio.com",
    projectId: "tfh-webapp",
    storageBucket: "tfh-webapp.appspot.com",
    messagingSenderId: "456057828264",
    appId: "1:456057828264:web:dc5cc67f2c0807df29639d"
  }

firebase.initializeApp(configs);

const itemsPerPage = 10;
const db = firebase.firestore();
const auth = firebase.auth();
const matches = db.collection('matches');

export default {
  itemsPerPage,
  db,
  auth,
  matches }