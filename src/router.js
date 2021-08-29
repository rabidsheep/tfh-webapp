import Vue from 'vue'
import Router from 'vue-router'
import Matches from './views/Matches.vue'
import Uploads from './views/Uploads.vue'
import Edit from './views/Edit.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'matches',
      component: Matches
    },
    {
      path: '/upload',
      name: 'upload',
      component: Uploads
    },
    {
      path: '/edit',
      name: 'edit',
      component: Edit,
      props: (route) => ({
        tournamentId: route.query.tournamentId,
        matchId: route.query.matchId,
        videoId: route.query.videoId,
        fromUser: route.query.fromUser,
        tournament: route.params.tournament,
      })
    }
  ]
})