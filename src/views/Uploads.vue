<template>
    <v-container id="uploads">
        <v-stepper v-model="step" flat>
            <v-stepper-items>
                <v-stepper-header>
                    <v-stepper-step color="accent" step="1"
                    :complete="step > 1">
                        Sign In
                    </v-stepper-step>

                    <v-divider />

                    <v-stepper-step color="accent" step="2"
                    :complete="step > 2">
                        Select Upload Type
                    </v-stepper-step>

                    <v-divider />

                    <v-stepper-step color="accent" step="3"
                    :complete="step > 3">
                        Upload Matches
                    </v-stepper-step>
                </v-stepper-header>
                
                <!-- sign in -->
                <v-stepper-content step="1">
                    <v-layout
                    id="step__sign-in"
                    class="step"
                    column
                    justify-center
                    align-center>
                        <h1>Sign In</h1>

                        <v-layout
                        class="body"
                        column
                        justify-center
                        align-center>
                            <v-btn
                            height="50"
                            rounded
                            v-show="!$firebase.auth().currentUser"
                            @click="signIn('google')">
                                <v-icon left>mdi-google</v-icon>
                                Google
                            </v-btn>
                        </v-layout>

                        <v-progress-linear
                        color="accent"
                        indeterminate
                        v-show="$firebase.auth().currentUser || loggingIn"/>

                        <template v-if="$firebase.auth().currentUser || loggingIn">
                            <br />
                            {{ isRegistered ? 'Verifying user...' : 'Registering user...'}}
                        </template>

                        
                        <!--<v-btn height="50" v-show="!$firebase.auth().currentUser" @click="signIn('twitter')">
                            <v-icon left>mdi-twitter</v-icon> Twitter
                        </v-btn>-->
                    </v-layout>
                </v-stepper-content>

                <v-stepper-content step="2">
                    <v-layout
                    id="step__select"
                    class="step"
                    column
                    justify-center
                    align-center>
                        <h1>Select Upload Type</h1>

                        <v-layout
                        column
                        class="body"
                        justify-center
                        align-center>
                            <v-btn
                            rounded
                            @click="setUploadType('files')">
                                <v-icon left>mdi-file</v-icon>
                                TFHR File
                            </v-btn>

                            <v-btn
                            rounded
                            @click="setUploadType('youtube')">
                                <v-icon left>mdi-youtube</v-icon>
                                YouTube Link
                            </v-btn>
                        </v-layout>
                    </v-layout>
                </v-stepper-content>

                <!-- upload form -->
                <v-stepper-content step="3">
                    <v-layout
                    id="step__upload"
                    class="step"
                    column
                    justify-center
                    align-center>
                        <v-layout
                        column
                        align-center
                        justify-center
                        class="heading">
                            <v-btn
                            class="back"
                            x-small
                            fab
                            :ripple="false"
                            @click="goBack()">
                                <v-icon size="25px">mdi-arrow-left-thick</v-icon>
                            </v-btn>

                            <h1>Upload Matches</h1>
                        </v-layout>
                        
                        <FileUploads
                        v-if="uploadType === 'files'"
                        :uid="uid" />

                        <YoutubeUploads
                        v-else-if="uploadType === 'youtube'"
                        :uid="uid"/>
                    </v-layout>
                </v-stepper-content>
            </v-stepper-items>
        </v-stepper>
    </v-container>
</template>

<script>
import FileUploads from '../components/FileUploads.vue'
import YoutubeUploads from '../components/YoutubeUploads.vue'
import 'firebase/auth'

export default {
    components: {
        FileUploads,
        YoutubeUploads,
    },
    name: 'Uploads',
    props: {
        user: [String, null]
    },
    data: () => {
        return {
            uid: null,
            hidden: true,
            step: 1,
            uploadType: null,
            loading: false,
            loginError: false,
            uploadValue: 0,
            isAdmin: false,
            isRegistered: true,
            loggingIn: false,
        }
    },
    mounted: function () {
        if (!this.user) {
            this.$firebase.auth().onAuthStateChanged((user) => {
                
                if (!user) {
                    this.step = 1
                    return
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
                            this.step = 2
                            this.loading = false
                            this.loggingIn = false
                        } else {
                            console.log("Creating new user")
                            this.isRegistered = false

                            let newUser = {
                                uid: user.uid,
                                email: user.email,
                                admin: false
                            }

                            this.$users.save(newUser)
                            .then(() => {
                                this.step = 2
                                this.loading = false
                                this.isRegistered = true
                                this.loggingIn = false
                            })
                        }
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                } else {
                    if (user) {
                        console.log('Signed in')
                        this.uid = user.uid
                        this.step = 2
                    } else {
                        console.log('Signed out')
                    }

                    this.loading = false;
                }
            })
        } else {
            this.step = 2
            this.loading = false
        }
    },
    methods: {
        signIn: function (providerName) {
            this.$firebase.auth()
            .signInWithPopup(this.$providers[providerName])
            .then(() => {
                this.loading = false
            })
            .catch((error) => {
                console.log(error)
                this.loading = false
            })
        },
        setAuthToken: function () {
            return this.$firebase.auth().currentUser.getIdToken()
                .then((token) => {
                    console.log('Setting auth token')
                    return this.$httpInterceptors.push((request) => {
                        request.headers.set('Authorization', token)
                    })
                })
                .catch((error) => console.log(error))
        },
        /** determines what upload form to use */
        setUploadType(type) {
            this.uploadType = type
            this.step = 3
        },
        /** return to upload type selection step */
        goBack() {
            this.step = 2
            this.uploadType = null
        }
    }
}
</script>

<style scoped>
  .v-stepper >>> .v-stepper__wrapper {
      overflow: visible !important;
  }
</style>