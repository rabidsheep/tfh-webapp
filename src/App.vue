<template>
  <v-app :dark="$vuetify.theme.dark">
    <v-main>
      <v-layout column align-center>
          <Topbar />
          <div id="router-view">
            <router-view />
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
  watch: {
    onScroll: function (event) {
      this.showToTop = event.currentTarget.scrollY >= 250
    }
  }
}
</script>

<style scoped lang="scss">
@import './assets/css/global.css';

.theme--dark.v-application {
  background-color: #3a3939;
}

#app .v-application--wrap {
  max-width: inherit !important;
}

.v-toolbar {
  width: 100%;
}

::v-deep .v-menu__content.player-select-menu {
  max-width: 0% !important;
}

::v-deep .v-application--wrap {
    max-width: inherit !important;
  }

#app {
  overflow: auto;
}

#router-view {
  padding-top: 30px;
  width: 90%;
  max-width: 960px;
  padding-bottom: 30px;
}
</style>
