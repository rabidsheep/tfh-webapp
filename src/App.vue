<template>
  <v-app :dark="$vuetify.theme.dark">
    <v-main>
      <v-layout column align-center>
          <Topbar
          @force-rerender="componentKey = forceRerender()"/>
          <div id="router-view"
          :class="$vuetify.breakpoint.smAndDown ? 'small' : 'wide'">
            <router-view :key="componentKey" />
          </div>
      </v-layout>
    </v-main>
  </v-app>
</template>

<script>
import Topbar from './components/Topbar.vue'

export default {
	components: {
    Topbar
	},
  data() {
    return {
      componentKey: 0,
    }
  },
  watch: {
    onScroll: function (event) {
      this.showToTop = event.currentTarget.scrollY >= 250
    }
  },
  methods: {
    // this is just to force the match view component to re-render when the router link is clicked
    forceRerender() {
      return ( this.componentKey === 0 ? 1 : 0 )
    }
  }
}
</script>

<style scoped lang="scss">
@import './assets/css/global.css';

.theme--dark.v-application {
  background-color: #3a3939;
}

::v-deep .v-menu__content.player-select-menu {
  max-width: 0% !important;
}

</style>
