import Vue from 'vue'
import VueResource from 'vue-resource'
import config from './config'
//import firebase from 'firebase'

Vue.prototype.$config = config;

Vue.use(VueResource)
//let uri = 'https://us-central1-tfh-webapp.cloudfunctions.net/api'
let uri = 'http://localhost:5001/tfh-webapp/us-central1/api'

let matchesMethods = {
  get: { method: 'GET' },
  save: { method: 'PUT' },
  delete: { method: 'DELETE' }
}
let matchesRes = Vue.resource(`${uri}/matches/`, {}, matchesMethods)

Vue.prototype.$version = 2;
Vue.prototype.$characters = [
  {name: 'Any Character', devName: '', id: 0},
  {name: 'Arizona', devName: 'Cow', id: 1},
  {name: 'Oleander', devName: 'Uni', id: 2},
  {name: 'Paprika', devName: 'Paca', id: 3},
  {name: 'Pom', devName: 'Pom', id: 4},
  {name: 'Shanty', devName: 'Shanty', id: 5},
  {name: 'Tianhuo', devName: 'Tianhuo', id: 6},
  {name: 'Velvet', devName: 'Velvet', id: 7}
]

Vue.use({
  install: () => {
    Object.defineProperty(Vue.prototype, '$matches', {
      get () { return matchesRes }
    })
    Object.defineProperty(Vue.prototype, '$httpInterceptors', {
      get () { return Vue.http.interceptors }
    })
  }
})
