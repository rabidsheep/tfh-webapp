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
      component: Uploads,
    },
    {
      path: '/edit',
      name: 'edit',
      component: Edit,
      props: (route) => ({
        uploadId: route.params.uploadId,
        uploadForm: route.params.uploadForm,
      })
    }
  ]
})