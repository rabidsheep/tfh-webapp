import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
//import router from './router'

Vue.use(vuetify);

Vue.config.productionTip = false;

// current game version
Vue.prototype.$version = 2.07;

// filter to capitalize first letter of a word
Vue.filter('capitalize', function (value) {
  if (!value) return ''
  value = value.toString()
  return value.charAt(0).toUpperCase() + value.slice(1)
})

// filter to lowercase first letter of a word
Vue.filter('lowercase', function (value) {
  if (!value) return ''
  value = value.toString()
  return value.charAt(0).toLowerCase() + value.slice(1)
})



new Vue({
  vuetify,
  data: {
    version: 2.07
  },
  render: h => h(App)
}).$mount('#app')