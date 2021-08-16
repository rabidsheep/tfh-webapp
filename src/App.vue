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

        <router-link :user="user" to="/upload">
            <v-btn icon>
                <v-icon>mdi-plus-box</v-icon>
            </v-btn>
        </router-link>
    </v-toolbar>

    <v-main>
      <v-layout column align-center>
        <div id="router-view"
        :class="$vuetify.breakpoint.smAndDown ? ($vuetify.breakpoint.xsOnly ? 'small xsmall' : 'small') : 'wide'">
          <router-view :user="user" />
        </div>
      </v-layout>
    </v-main>

    <v-container class="footer">
      <v-row>
        <v-col class="copyright">
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
      user: null,
    }
  },
  mounted: function () {
    this.$firebase.auth()
    .onAuthStateChanged((user) => {
        
      if (!user) {
        return null
      }

      if (process.env.NODE_ENV == "production") {
        console.log("Production Environment")

        this.setAuthToken()
        .then(() => {
            console.log('Checking user')
            this.loggingIn = true
            return this.$users.get({ uid: user.uid })
        })
        .then((response) => {
            let userData = response.body[0]
            if (userData) {
                console.log("Retrieved user data")

                this.isAdmin = userData.admin
                this.user = userData
            } else {
                console.log("Not logged in")
            }
        })
        .catch((error) => {
            console.log(error)
        })
    } else {
        if (user) {
            console.log('Signed in')
            this.uid = user.uid
            this.user = user.uid
        } else {
            console.log('Signed out')
        }
      }
    })
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
