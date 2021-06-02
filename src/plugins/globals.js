import Vue from 'vue'

// current game version
Vue.prototype.$version = 2.07;

let charactersRes = [
    'Arizona',
    'Oleander',
    'Paprika',
    'Pom',
    'Shanty',
    'Tianhuo',
    'Velvet'
]

Vue.use({
    install: () => {
        Object.defineProperty(Vue.prototype, '$characters', {
          get () { return charactersRes }
        })
      }
    })