<template>
  <v-app :dark="$vuetify.theme.dark">
    <v-main>
      <v-layout column align-center>
          <Topbar />
          <div id="router-view">
            <Matches />
          </div>
      </v-layout>
    </v-main>
  </v-app>
</template>

<script>
import Topbar from './components/Topbar.vue'
import Matches from './views/Matches.vue'

export default {
	components: {
    Topbar,
    Matches
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

::v-deep .v-application--wrap {
    max-width: inherit !important;
  }

#app {
  overflow: auto;
}

#router-view {
  width: 100%;
  max-width: 960px;
}
</style>
