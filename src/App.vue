<template>
  <v-app dark>
    <v-toolbar maxHeight="50px" dense color="accent">
        <!-- replace <a> with <router-link> eventually -->
        <a href="/">
            <img class="logo" src="./assets/img/pixel/1.png" />
        </a>

        <v-toolbar-title>
            fortnite gaming
        </v-toolbar-title>

        <router-link to="/upload">
            <v-btn icon>
                <v-icon>mdi-plus-box</v-icon>
            </v-btn>
        </router-link>
    </v-toolbar>

    <v-main>
      <v-layout column align-center>
        <div id="router-view"
        :class="$vuetify.breakpoint.smAndDown ? ($vuetify.breakpoint.xsOnly ? 'small xsmall' : 'small') : 'wide'">
          <router-view />
        </div>
      </v-layout>
    </v-main>
  </v-app>
</template>

<script>
export default {
  computed: {
    /*size: function() {
      if (this.$vuetify.breakpoint.lgOnly) {
        return 'lg'
      } else if (this.$vuetify.breakpoint.mdOnly) {
        return 'md'
      } else if (this.$vuetify.breakpoint.smOnly) {
        return 'sm'
      } else if (this.$vuetify.breakpoint.xsOnly) {
        return 'xs'
      }
    }*/
  },
  watch: {
    onScroll: function (event) {
      this.showToTop = event.currentTarget.scrollY >= 250
    }
  },
}
</script>

<style scoped lang="scss">
@import './assets/css/global.css';

.theme--dark.v-application {
  background-color: var(--v-background-base);
  color: var(--v-text-base);
}

.theme--dark.v-sheet {
  color: var(--v-text-base);
}

::v-deep #filters__main {
  background: var(--v-background-darken1);
}

::v-deep .theme--dark.v-stepper {
  background: var(--v-background-darken1);
}

::v-deep .v-menu__content.player-select-menu {
  max-width: 0% !important;
}

::v-deep .theme--dark.v-icon.v-icon.v-icon--disabled {
  color: #5e5e5e !important;
}

</style>
