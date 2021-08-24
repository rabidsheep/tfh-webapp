<template>
  <v-app dark>
    <v-toolbar id="menubar" height="58px" maxHeight="58px" dense color="accent">
        <!-- replace <a> with <router-link> eventually -->
        <router-link to="/" @click.native="componentKey = forceRerender($event)">
            <img class="logo" src="./assets/img/pixel/1.png" />
        </router-link>

        <v-toolbar-title>
            fortnite gaming
        </v-toolbar-title>

        <router-link to="/upload">
            <v-btn icon>
                <v-icon>mdi-plus-box</v-icon>
            </v-btn>
        </router-link>

        <v-spacer />

        <!--<v-divider vertical />

        <v-toolbar-items>
          <v-col
          justify="center"
          align="center">
            {{ userId ? 'Signed In' : 'Logged Out' }}
          </v-col>
        </v-toolbar-items>-->
    </v-toolbar>

    <v-main>
      <v-layout column align-center>
        <div id="router-view"
        :class="$vuetify.breakpoint.smAndDown ? ($vuetify.breakpoint.xsOnly ? 'small xsmall' : 'small') : 'wide'">
          <router-view :key="componentKey" />
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
      get userId() {
        return localStorage.getItem('user')
      },
      user: null,
      componentKey: 0,
    }
  },
  mounted: function () {
      /*this.$firebase.auth()
      .onAuthStateChanged((user) => {
          
        if (!user) {
          console.log('User is signed out')
          //this.user = this.$firebase.auth().currentUser
          console.log(this.user)
          return null
        } else {
          
          
          if (process.env.NODE_ENV == "production") {
            // only run this in production environment
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
                    this.userId = user.uid
                    //localStorage.setItem('user', user.uid)
                } else {
                    console.log("No account found")
                }

                
            })
            .catch((error) => {
                console.log(error)
            })
          } else {
            // only run this in dev environment
            console.log("Development Environment")
        
            console.log('Signed in')
            this.uid = user.uid
            this.userId = user.uid
            //this.user = this.$firebase.auth().currentUser
            console.log(this.user)
          }

          console.log('User is signed in')
        }
      })*/
    
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
    forceRerender(e) {
      if (this.$route.path === '/' && e.ctrlKey !== 'false') {
        return this.componentKey === 0 ? 1 : 0
      }
    }
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

::v-deep .preview .v-input--dense > .v-input__control > .v-input__slot {
    margin-bottom: 5px !important;
}

</style>
