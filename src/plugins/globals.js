import Vue from 'vue'
import VueResource from 'vue-resource'
import config from './config'
import firebase from 'firebase'

Vue.prototype.$config = config;

Vue.use(VueResource)
//let uri = 'https://us-central1-tfh-webapp.cloudfunctions.net/api'
let uri = 'http://localhost:5001/tfh-webapp/us-central1/api'

Vue.prototype.$providers = {
  twitter: new firebase.auth.TwitterAuthProvider(),
  google: new firebase.auth.GoogleAuthProvider()
}

let matchesMethods = {
  get: { method: 'GET' },
  save: { method: 'PUT' },
  delete: { method: 'DELETE' }
}
let matchesRes = Vue.resource(`${uri}/matches/`, {}, matchesMethods)

let playerMethods = {
  get: { method: 'GET' },
}
let playerRes = Vue.resource(`${uri}/players/`, {}, playerMethods)

let usersMethods = {
  get: { method: 'GET' },
  save: { method: 'PUT' }
}
let usersRes = Vue.resource(`${uri}/users/`, {}, usersMethods)

let filesMethods = {
  save: { method: 'PUT' },
}
let filesRes = Vue.resource(`${uri}/files/`, {}, filesMethods)

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

    Object.defineProperty(Vue.prototype, '$players', {
      get () { return playerRes }
    })

    Object.defineProperty(Vue.prototype, '$users', {
      get () { return usersRes }
    })

    Object.defineProperty(Vue.prototype, '$files', {
      get () { return filesRes }
    })

    Object.defineProperty(Vue.prototype, '$firebase', {
      get () { return firebase }
    })

    Object.defineProperty(Vue.prototype, '$httpInterceptors', {
      get () { return Vue.http.interceptors }
    })
  }
})
