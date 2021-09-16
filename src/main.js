import Vue from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import router from './router';
import './plugins/globals.js';
import './registerServiceWorker';

export default Vue.mixin({
  methods: {
    test() {
        console.log("test")
    },
    // print objects to console log without having to type
    // JSON functions to get rid of getter & setter text
    printObj(obj) {
      return console.log(JSON.parse(JSON.stringify(obj)));
    },

    // format date to MM-DD-YYYY format
    formatDate(date) {
      if (!date) return null;

      const [year, month, day] = date.split('-');
      return `${month}-${day}-${year}`;
    },

    formatRegex(string) {
      return new RegExp([string.replace(/[-[\]{}()*+?.,\\^$|]/g, "\\$&")], 'i')
    },

    // overridden in Edit.vue
    updateCharacter(character, j, i) {
      this.$set(this.matches[i][`p${j}`], 'character', character);
    },

    
    changeVerifyBtn() {
      this.changeButton = true;

      window.setInterval(() => {
          this.changeButton = false;
      }, 3000);
    },

  }
})

Vue.config.productionTip = false;

new Vue({
  vuetify,
  router,
  render: h => h(App)
}).$mount('#app')