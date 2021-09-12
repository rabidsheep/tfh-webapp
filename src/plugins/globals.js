import Vue from 'vue'
import VueResource from 'vue-resource';
import config from './AppConfig';
import firebase from 'firebase/app';
Vue.use(VueResource);

Vue.prototype.$title = 'kickandstomp.in';
Vue.prototype.$dev = process.env.NODE_ENV === "development";
Vue.prototype.$itemsPerPage = config.itemsPerPage;
Vue.prototype.$replayVersion = 2;

Vue.prototype.$providers = {
  twitter: new firebase.auth.TwitterAuthProvider(),
  google: new firebase.auth.GoogleAuthProvider()
};

Vue.prototype.$regex = {
  ytUrl: /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*)/,
  ytId: /(?:\?v=|youtu.be\/)([^#\&\?]*)/,
  ytIdLength: /(?:\?v=|youtu.be\/)([^#\&\?]{11}$)/,
  //for timestamp at end of youtube urls
  urlTimestamp: /(?:\&t=)(((?:[0-9]{1,2})h)?((?:[0-9]{1,3})m)?((?:[0-9]{1,5})s)?)/,
  // for checking if timestamp string is valid
  strTimestamp: /^([0-9]{1,2}h)?([0-9]{1,3}m)?([0-9]{1,5}s)?$/g,
};

// alias[0] is always internal name (name found in TFHR files)
Vue.prototype.$characters = [
  {name: 'Any Character', value: null, img: 'Any', alias: ['Any', '?', '???']},
  {name: 'Arizona', value: 'Arizona', img: 'Arizona', alias: [ 'Cow', 'Arizona', 'Ari']},
  {name: 'Oleander', value: 'Oleander', img: 'Oleander', alias: ['Uni', 'Oleander', 'Ole']},
  {name: 'Paprika', value: 'Paprika', img: 'Paprika', alias: ['Paca', 'Paprika', 'Pap']},
  {name: 'Pom', value: 'Pom', img: 'Pom', alias: ['Pom']},
  {name: 'Shanty', value: 'Shanty', img: 'Shanty', alias: ['Shanty', 'Sha']},
  {name: 'Tianhuo', value: 'Tianhuo', img: 'Tianhuo', alias: ['Tianhuo', 'Tian']},
  {name: 'Velvet', value: 'Velvet', img: 'Velvet', alias: ['Velvet', 'Vel']}
];


let uri = process.env.NODE_ENV == "development" ? config.uris.dev : config.uris.prod;

let matchesMethods = {
  get: { method: 'GET' },
  save: { method: 'PUT' },
  delete: { method: 'DELETE' }
};
let matchesRes = Vue.resource(`${uri}/matches`, {}, matchesMethods);

let editMethods = {
  get: { method: 'GET'},
  save: { method: 'PUT' },
  delete: { method: 'DELETE' }
};
let editRes = Vue.resource(`${uri}/edit`, {}, editMethods);

let filesMethods = {
  save: { method: 'PUT' }
};
let filesRes = Vue.resource(`${uri}/files`, {}, filesMethods);

let usersMethods = {
  get: { method: 'GET' },
  save: { method: 'PUT' }
};
let usersRes = Vue.resource(`${uri}/users`, {}, usersMethods);

let filterContentMethods = {
  get: { method: 'GET' }
};
let filterContentRes = Vue.resource(`${uri}/filter/content`, {}, filterContentMethods);

let youtubeMethods = {
  get: { method: 'GET' }
};
let youtubeDataRes = Vue.resource(`${uri}/youtube-data/`, {}, youtubeMethods);


Vue.use({
  install: () => {
    Object.defineProperty(Vue.prototype, '$matches', {
      get () { return matchesRes }
    });

    Object.defineProperty(Vue.prototype, '$edit', {
      get () { return editRes }
    });
    
    Object.defineProperty(Vue.prototype, '$users', {
      get () { return usersRes }
    });

    Object.defineProperty(Vue.prototype, '$filterContent', {
      get () { return filterContentRes }
    });

    Object.defineProperty(Vue.prototype, '$youtubeData', {
      get () { return youtubeDataRes }
    });

    Object.defineProperty(Vue.prototype, '$files', {
      get () { return filesRes }
    });

    Object.defineProperty(Vue.prototype, '$firebase', {
      get () { return firebase }
    });

    Object.defineProperty(Vue.prototype, '$httpInterceptors', {
      get () { return Vue.http.interceptors }
    });
    
    Object.defineProperty(Vue.prototype, '$server', {
      get () { return serverRes }
    });
  }
});
