import Vue from 'vue'
import VueResource from 'vue-resource'
import config from './AppConfig'
import firebase from 'firebase/app'
Vue.prototype.$config = config;

Vue.prototype.$regex = {
  ytUrl: /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*)/,
  ytId: /(?:\?v=|youtu.be\/)([^#\&\?]*)/,
  ytIdLength: /(?:\?v=|youtu.be\/)([^#\&\?]{11}$)/,
  //for timestamp at end of youtube urls
  urlTimestamp: /(?:\&t=)(((?:[0-9]{1,2})h)?((?:[0-9]{1,3})m)?((?:[0-9]{1,5})s)?)/,
  // for checking if timestamp string is valid
  strTimestamp: /^([0-9]{1,2}h)?([0-9]{1,3}m)?([0-9]{1,5}s)?$/g,
}

Vue.use(VueResource)

let uri = null

if (process.env.NODE_ENV == "development") {
  uri = 'http://localhost:5001/tfh-webapp/us-central1/api'
} else {
  uri = 'https://us-central1-tfh-webapp.cloudfunctions.net/api'
}

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

let updateMethods = {
  save: { method: 'PUT' },
  delete: { method: 'DELETE' }
}
let updateRes = Vue.resource(`${uri}/matches/update`, {}, updateMethods)

let filesMethods = {
  save: { method: 'PUT' }
}
let filesRes = Vue.resource(`${uri}/files`, {}, filesMethods)

let usersMethods = {
  get: { method: 'GET' },
  save: { method: 'PUT' }
}
let usersRes = Vue.resource(`${uri}/users/`, {}, usersMethods)

let filterContentMethods = {
  get: { method: 'GET' }
}
let filterContentRes = Vue.resource(`${uri}/filter/content`, {}, filterContentMethods)

let youtubeMethods = {
  get: { method: 'GET' }
}
let youtubeDataRes = Vue.resource(`${uri}/youtube-data/`, {}, youtubeMethods)

Vue.prototype.$version = 2;
Vue.prototype.$characters = [
  {name: 'Any Character', value: null, devName: '', id: 0, names: ['Any Character', 'Any']},
  {name: 'Arizona', value: 'Arizona', devName: 'Cow', id: 1, names: ['Arizona', 'Ari', 'Cow']},
  {name: 'Oleander', value: 'Oleander', devName: 'Uni', id: 2, names: ['Oleander', 'Ole', 'Uni']},
  {name: 'Paprika', value: 'Paprika', devName: 'Paca', id: 3, names: ['Paprika', 'Pap', 'Paca']},
  {name: 'Pom', value: 'Pom', devName: 'Pom', id: 4, names: ['Pom']},
  {name: 'Shanty', value: 'Shanty', devName: 'Shanty', id: 5, names: ['Shanty']},
  {name: 'Tianhuo', value: 'Tianhuo', devName: 'Tianhuo', id: 6, names: ['Tianhuo', 'Tian']},
  {name: 'Velvet', value: 'Velvet', devName: 'Velvet', id: 7, names: ['Velvet', 'Vel']}
]

Vue.use({
  install: () => {
    Object.defineProperty(Vue.prototype, '$matches', {
      get () { return matchesRes }
    })

    Object.defineProperty(Vue.prototype, '$update', {
      get () { return updateRes }
    })
    
    Object.defineProperty(Vue.prototype, '$users', {
      get () { return usersRes }
    })

    Object.defineProperty(Vue.prototype, '$filterContent', {
      get () { return filterContentRes }
    })

    Object.defineProperty(Vue.prototype, '$youtubeData', {
      get () { return youtubeDataRes }
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
