import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import './plugins/globals.js'
import firebase from 'firebase/app'
import 'firebase/storage'

Vue.use(vuetify);

Vue.config.productionTip = false;

new Vue({
  vuetify,
  router,
  render: h => h(App),

  created () {
    var firebaseConfig = {
      apiKey: "AIzaSyDTFNrPqlFJ4M4b5S-PTB-l5Nbo4M8CLTk",
      authDomain: "tfh-webapp.firebaseapp.com",
      databaseURL: "https://tfh-webapp-default-rtdb.firebaseio.com",
      projectId: "tfh-webapp",
      storageBucket: "tfh-webapp.appspot.com",
      messagingSenderId: "456057828264",
      appId: "1:456057828264:web:dc5cc67f2c0807df29639d"
    };

    firebase.initializeApp(firebaseConfig);
  }
}).$mount('#app')