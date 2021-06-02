import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
Vue.use(Vuetify)

export default new Vuetify({
    rtl: false,
    theme: {
      dark: true,
      opions: {customProperties: true},
      themes: {
        dark: {
          background: '#4b4b4b',
          primary: '#b21d45',
          accent: '#FEE86B',
          secondary: '#2e2e2e',
          success: '#4CAF50',
          info: '#2196F3',
          warning: '#FB8C00',
          error: '#FF5252'
        }
      }
    }
  });