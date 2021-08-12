import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import '@mdi/font/css/materialdesignicons.css' // Ensure you are using css-loader
Vue.use(Vuetify)

const themes = {
  arizona: {
    background: {
      base: '#3a3939',
      darken1: '#2e2e2e',
    },
    text: '#ffffff',
    accent: '#b21d45',
    primary: '#ffffff',
    success: '#4CAF50',
    info: '#2196F3',
    warning: '#FB8C00',
    error: '#FF5252'
  },
  oleander: {
    background: {
      base: '#3a3939',
      darken1: '#2e2e2e',
    },
    text: '#ffffff',
    accent: '#8e0d57',
    primary: '#fffff',
    secondary: '#2e2e2e',
    success: '#4CAF50',
    info: '#2196F3',
    warning: '#FB8C00',
    error: '#FF5252'
  },
  paprika: {

  },
  pom: {
    background: {
      base: '#f1f1f1',
      darken1: '#cbcbcb',
    },
    text: '#f7e0f4',
    accent: '#f7e0f4',
    primary: '#786d89',
  },
  shanty: {

  },
  tianhuo: {

  },
  velvet: {

  },
}

export default new Vuetify({
    rtl: false,
    icons: {
      iconfont: 'mdi'
    },
    breakpoint: {
      thresholds: {
        xs: 600,
        sm: 800,
        md: 960,
        lg: 1280,
      },
      mobileBreakpoint: 740,
    },
    theme: {
      dark: true,
      options: {customProperties: true},
      themes: {
        dark: themes.arizona
      }
    }
  });