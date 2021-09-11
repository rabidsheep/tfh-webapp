<template>
    <v-container
    id="forms"
    class="uploads">
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
                <div v-show="step === 1">
                    <div
                    id="step__sign-in"
                    class="step">
                        <h1>Sign In</h1>

                        
                        <br />

                        <div
                        class="body"
                        v-show="allowLogin"
                        column
                        justify-center
                        align-center>
                            <v-btn
                            color="button2"
                            height="50px"
                            rounded
                            :disabled="!allowLogin"
                            @click="signIn('google')">
                                <v-icon left>mdi-google</v-icon>
                                Google
                            </v-btn>
                            
                            <!--<v-btn height="50"
                            v-show="!$firebase.auth().currentUser"
                            @click="signIn('twitter')">
                                <v-icon left>mdi-twitter</v-icon> Twitter
                            </v-btn>-->
                        </div>

                        <div
                        v-show="!loggingIn && !allowLogin || loggingIn">
                            <v-progress-linear
                            color="accent"
                            indeterminate/>

                            <br />

                            <template v-if="!allowLogin && !loggingIn">
                                Checking auth state...
                            </template>

                            <template v-if="loggingIn">
                                {{ isRegistered ? 'Verifying user...' : 'Registering user...'}}
                            </template>
                        </div>

                        
                        
                    </div>
                </div>

                <div v-show="step === 2">
                    <div
                    id="step__select"
                    class="step">
                        <h1>Select Upload Type</h1>

                        <br />

                        <v-btn
                        height="50px"
                        color="button2"
                        rounded
                        @click="setUploadType('files')">
                            <v-icon left>mdi-file</v-icon>
                            TFHR File
                        </v-btn>
                        
                        <br />
                        
                        <v-btn
                        height="50px"
                        color="button2"
                        rounded
                        @click="setUploadType('youtube')">
                            <v-icon left>mdi-youtube</v-icon>
                            YouTube Link
                        </v-btn>
                    </div>
                </div>

                <!-- upload form -->
                <div v-show="step === 3">
                    <div
                    id="step__upload"
                    class="step">
                        <div
                        class="heading">
                            <v-btn
                            color="button2"
                            class="back"
                            x-small
                            fab
                            :ripple="false"
                            @click="goBack()">
                                <v-icon size="25px">mdi-arrow-left-thick</v-icon>
                            </v-btn>

                            <h1>Upload Matches</h1>
                        </div>
                        
                        <FileUploads
                        v-if="uploadType == 'files'"
                        :key="fileKey"
                        :uid="uid"
                        @reload-form="fileKey = !fileKey" />

                        <YoutubeUploads
                        v-else-if="uploadType === 'youtube'"
                        :key="youtubeKey"
                        :uid="uid"
                        @reload-form="youtubeKey = !youtubeKey" />
                    </div>
                </div>
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
            allowLogin: false,
            loggedIn: false,
            youtubeKey: false,
            fileKey: false,
        }
    },
    watch: {
    },
    mounted() {
            this.$firebase.auth().onAuthStateChanged((user) => {
                if (!user) {
                    this.uid = null
                    this.step = 1
                    
                    this.allowLogin = true
                    console.log('User not found')
                    return null
                } else {
                    this.loggingIn = true
                    this.uid = user.uid

                    let loginRef = null

                    if (this.$dev) {
                        console.log("Dev Environment")

                        loginRef = this.$users.get({ uid: user.uid })
                    } else {
                        console.log("Production Environment")

                        loginRef = this.setAuthToken()
                        .then(() => {
                            console.log('Checking user')
                            return this.$users.get({ uid: user.uid })
                        })
                    }

                    loginRef.then((response) => {
                        let userData = response.body[0]

                        if (userData) {
                            console.log("Retrieved user data")
                            this.isAdmin = userData.admin
                            return null
                        } else {
                            console.log("Creating new user")

                            this.isRegistered = false

                            let newUser = {
                                uid: user.uid,
                                email: user.email,
                                admin: false
                            }

                            return this.$users.save(newUser)
                            .then(() => {
                                console.log('User created') 
                            })
                        }
                    })
                    .then(() => {
                        this.loading = false
                        this.loadingMatches = true
                        this.isRegistered = true
                        this.loggingIn = false
                        this.step = 2
                    })
                    .catch((error) => {

                        this.loading = false
                        this.isRegistered = true
                        this.loggingIn = false
                        this.step = 1
                        this.allowLogin = true
                        console.log(error)
                    })
                }
            })
    },
    methods: {
        signIn: function (providerName) {
            this.loading = true
            this.allowLogin = false

            this.$firebase.auth()
            .signInWithPopup(this.$providers[providerName])
            .then(() => {
                this.loading = false
            })
            .catch((error) => {
                console.log(error)
                this.allowLogin = true
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
        },
    }
}
</script>

<style scoped>
@import '../assets/css/uploads.css';

  .v-stepper >>> .v-stepper__wrapper {
      overflow: visible !important;
  }

  
</style>