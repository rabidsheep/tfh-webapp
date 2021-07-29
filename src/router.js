import Vue from 'vue'
import Router from 'vue-router'
import Matches from './views/Matches.vue'
import Uploads from './views/Uploads.vue'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'matches',
      component: Matches,
      props: (route) => ({
        query: route.query
      })
    },
    {
      path: '/upload',
      name: 'upload',
      component: Uploads,
      props: (route) => ({
        v: route.query.v
      })
    }
  ]
})