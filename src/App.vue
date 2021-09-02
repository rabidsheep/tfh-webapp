<template>
  <v-app dark>
    <v-toolbar id="menubar" height="58px" maxHeight="58px" dense color="accent">
        <!-- replace <a> with <router-link> eventually -->
        <router-link to="/" @click.native="forceRerenderMain($event)">
          <div class="logo">
            <img src="./assets/img/pixel/1.png" :alt="$title" />
          
          <v-toolbar-title class="name">
              {{ $title }}
          </v-toolbar-title>
          </div>
        </router-link>


        <router-link :to="{path: 'upload'}">
            <v-btn icon>
                <v-icon>mdi-plus-box</v-icon>
            </v-btn>
        </router-link>

        <v-spacer />

        <v-divider vertical />


        <v-toolbar-items>
          <v-col
          class="version">
            v0.1.0
          </v-col>
        </v-toolbar-items>
    </v-toolbar>

    <v-main>
      <v-layout column align-center justify-center>
        <div id="router-view"
        :class="$vuetify.breakpoint.smAndDown ? ($vuetify.breakpoint.xsOnly ? 'small xsmall' : 'small') : 'wide'">
          <router-view :key="mainKey" />
        </div>
      </v-layout>

    </v-main>


    <v-container id="footer" class="pb-4">
      <v-row>
        <v-col class="copyright pa-0">
          THEM’S FIGHTIN’ HERDS ® & © 2017-2020 Mane6, Inc.
          <br />
          THEM’S FIGHTIN’ HERDS is a registered trademark of Mane6, Inc.
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
export default {
  data: () => {
    return {
      mainKey: true,
      uploadKey: true,
    }
  },
  mounted: function () {
  },
  watch: {
    onScroll: function (event) {
      this.showToTop = event.currentTarget.scrollY >= 250
    }
  },
  methods: {
    setAuthToken: function () {
      return this.$firebase.auth().currentUser
      .getIdToken()
      .then((token) => {
        console.log('Setting auth token')
        return this.$httpInterceptors.push((request) => {
          request.headers.set('Authorization', token)
        })
      })
      .catch((error) => console.log(error))
    },
    forceRerenderMain(e) {
      if (this.$route.path === '/' && !e.ctrlKey) {
        this.mainKey = !this.mainKey
      }
    },
  }
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

::v-deep .v-toolbar__content {
  padding-right: 0px !important;
}

::v-deep #filters__main {
  background: var(--v-subBackground-base);
}

::v-deep .theme--dark.v-stepper {
  background: var(--v-subBackground-base);
}

::v-deep .v-menu__content.player-select-menu {
  max-width: 0% !important;
}

::v-deep .theme--dark.v-icon.v-icon.v-icon--disabled {
  color: #5e5e5e !important;
}

::v-deep .preview .v-input--dense > .v-input__control > .v-input__slot {
    margin-bottom: 5px !important;
}

::v-deep .v-main__wrap {
  display: flex;
  padding: 24px 0px;
}

::v-deep .mdi {
  display: flex !important;
  
}

::v-deep .v-text-field__slot > input {
    text-overflow: ellipsis;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;  
}

::v-deep .small .v-form .match-list .v-text-field__slot {
    white-space: nowrap;
    overflow: hidden;
}

::v-deep .small .v-form .match-list .v-text-field__slot {
  max-width: calc(100% - 30px);
}
</style>
