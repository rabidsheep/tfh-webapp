import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import mixin from './plugins/mixin'
import './plugins/globals.js'
import './registerServiceWorker'

Vue.config.productionTip = false
new Vue({
  vuetify,
  router,
  mixin,
  render: h => h(App)
}).$mount('#app')