import Vue from 'vue'
import VueResource from 'vue-resource'
import config from './config'
//import firebase from 'firebase'

Vue.prototype.$config = config;

Vue.use(VueResource)

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
