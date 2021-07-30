import Vue from 'vue'
import Vuelidate from 'vuelidate'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import './plugins/globals.js'
Vue.use(vuetify);
Vue.use(Vuelidate)

Vue.config.productionTip = false;

new Vue({
  vuetify,
  Vuelidate,
  router,
  render: h => h(App)
}).$mount('#app')