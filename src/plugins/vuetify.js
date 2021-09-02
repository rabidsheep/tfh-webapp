import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import 'vuetify/dist/vuetify.min.css'
import '@mdi/font/css/materialdesignicons.min.css' // Ensure you are using css-loader
Vue.use(Vuetify)

const themes = {
  arizona: {
    background: '#3a3939',
    subBackground: '#2e2e2e',
    subBackground2: '#212121',
    text: '#ffffff',
    accent: '#b21d45',
    primary: '#ffffff',
    success: '#4CAF50',
    info: '#2196F3',
    warning: '#FB8C00',
    error: '#FF5252',
    button2: '#212121',
    button3: '#628f3a',
    button4: '#171717',
    buttonDisabled: '#5e5e5e',
    matchRowHover: '#2e2e2e',
  },
}

export default new Vuetify({
    rtl: false,
    icons: {
      iconfont: 'mdi'
    },
    breakpoint: {
      thresholds: {
        xxs: 450,
        xs: 650,
        sm: 800,
        md: 900,
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