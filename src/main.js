import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import './plugins/globals.js'

Vue.config.productionTip = false

export const reset = new Vue()

new Vue({
  vuetify,
  router,
  render: h => h(App)
}).$mount('#app')