import Vue from 'vue'
import Router from 'vue-router'
import Matches from './views/Matches.vue'
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
  ]
})