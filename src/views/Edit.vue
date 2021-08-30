<template>
    <v-container v-if="$route.query.uploadId && $route.query.uploadForm" id="edit">
        <v-overlay v-show="uploading || finished">
            <v-container fluid fill-height>
                <v-layout class="status" column justify-center align-center>
                    <template v-if="uploading">
                        <h1>Uploading...</h1>

                        <br />

                        <v-progress-linear
                        color="accent"
                        indeterminate />
                    </template>

                    <template v-else-if="finished">
                        <v-icon
                        class="green--text lighten-2"
                        large>
                            mdi-check-circle
                        </v-icon>

                        <h1>
                            Upload Finished
                        </h1>

                        <v-btn
                        rounded
                        @click="reload()"
                        color="accent">
                            OK
                        </v-btn>
                    </template>
                </v-layout>
            </v-container>
        </v-overlay>

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
                        Edit Details
                    </v-stepper-step>
                </v-stepper-header>
                
                <!-- sign in -->
                <v-stepper-content step="1">
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
                            height="50"
                            rounded
                            :disabled="!allowLogin"
                            @click="signIn('google')">
                                <v-icon left>mdi-google</v-icon>
                                Google
                            </v-btn>
                            <!--
                            <v-btn height="50"
                            v-show="!$firebase.auth().currentUser"
                            @click="signIn('twitter')">
                                <v-icon left>mdi-twitter</v-icon> Twitter
                            </v-btn>
                            -->
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
                </v-stepper-content>

                <v-stepper-content step="2">
                    <div
                    id="step__edit"
                    class="step">
                        <h1>Edit Match Details</h1>
                        
                        <br /> 
                        
                        <v-progress-circular
                        class="progress"
                        v-show="loadingMatches"
                        indeterminate />

                        <v-row
                        class="tournament-info"
                        v-if="tournament">
                            <v-col
                            class="tournament name pa-0"
                            :cols="$vuetify.breakpoint.smAndDown ? 12 : 4">
                                <v-text-field
                                ref="tournament" 
                                label="Tournament Name"
                                v-model="tournament.name"
                                readonly />
                            </v-col>

                            <v-col
                            class="tournament num"
                            :cols="$vuetify.breakpoint.smAndDown ? 3 : undefined">
                                <v-text-field
                                label="No. #"
                                v-model="tournament.num"
                                readonly />
                            </v-col>

                            <v-col
                            class="tournament date pa-0"
                            :cols="$vuetify.breakpoint.smAndDown ? undefined : 4">
                                <v-text-field
                                ref="date"
                                label="Date"
                                v-model="tournament.date"
                                prepend-icon="mdi-calendar"
                                readonly />
                            </v-col>
                    </v-row>

                        <v-form
                        v-model="valid"
                        ref="form"
                        :id="`${$route.query.uploadForm}`"
                        v-if="!loadingMatches && Object.keys(original).length > 0 && !failedMatchGet">

                            <v-text-field
                            v-if="$route.query.uploadForm === 'youtube' || updated[0].type === 'Tournament'"
                            v-model="url"
                            class="upload-url"
                            label="YouTube URL"
                            prepend-icon="mdi-youtube"
                            :readonly="$route.query.uploadForm === 'youtube'" />

                            <div class="match-list">
                                <template v-for="(match, i, j) in updated">
                                    <Preview
                                    :key="i"
                                    :index="i"
                                    :firstMatch="i === 0"
                                    :lastMatch="i === updated.length - 1"
                                    :uploadForm="$route.query.uploadForm"
                                    :fileDate="match.file ? match.file.date : null"
                                    :fileName="match.file ? match.file.name : null"
                                    :p1="match.p1"
                                    :p2="match.p2"
                                    :timestampRequired="$route.query.uploadForm === 'youtube' || original[0].type === 'Tournament'"
                                    :tournament="match.tournament ? match.tournament : null"
                                    :video="match.video ? match.video : null"
                                    :file="match.file ? match.file : null"
                                    :type="match.type"
                                    :resetData="resetData"
                                    @set-timestamp="setTimestamp($event, i)"
                                    @set-url="setUrl($event, i)"
                                    @delete-timestamp="deleteTimestamp(i)"
                                    @delete-video="deleteVideo(i)" />

                                    <hr :key="j" v-if="i < updated.length - 1" />
                                </template>
                            </div>
                            
                            <br />

                            <v-row
                            class="buttons"
                            v-show="!loading && Object.keys(original).length > 0"
                            align="center"
                            justify="space-around">
                                <v-col class="reset pr-5">
                                    <v-btn
                                    rounded
                                    color="accent"
                                    @click="resetMatches()">
                                        Reset
                                    </v-btn>
                                </v-col>

                                <v-col class="submit pl-5">
                                    <v-btn
                                    rounded
                                    :disabled="!valid || !changesFound"
                                    color="accent"
                                    @click="updateMatches()">
                                        Submit
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </v-form>
                    </div>
                </v-stepper-content>
            </v-stepper-items>
        </v-stepper>
    </v-container>
</template>

<script>
import Preview from '.././components/Preview.vue'
import 'firebase/storage'


export default {
    name: 'Edit',
    components: {
        Preview
    },
    props: {
    },
    data: () => {
        return {
            query: null,
            uid: null,
            hidden: true,
            loading: false,
            step: 1,
            original: {},
            updated: {},
            valid: false,
            uploading: false,
            finished: false,
            changesFound: false,
            resetData: false,
            isAdmin: false,
            isRegistered: true,
            loggingIn: false,
            loadingMatches: false,
            failedMatchGet: false,
            allowLogin: false,
            uploadId: null,
            url: null,
            tournament: null,
        }
    },
    mounted: function () {
        if (this.$route.query.uploadId && this.$route.query.uploadForm) {
            // auth state watcher
            this.$firebase.auth().onAuthStateChanged((user) => {
            if (!user) {
                    this.uid = null
                    this.step = 1
                    
                    this.allowLogin = true
                    console.log('User not found')
                    return
                } else {
                    this.loggingIn = true
                    this.uid = user.uid

                    let loginRef = null

                    if (process.env.NODE_ENV == "production") {
                        console.log("Production Environment")

                        loginRef = this.setAuthToken()
                        .then(() => {
                            console.log('Checking user')
                            return this.$users.get({ uid: user.uid })
                        })

                    } else {
                        console.log("Dev Environment")

                        loginRef = this.$users.get({ uid: user.uid })
                    }

                    loginRef.then((response) => {
                        let userData = response.body[0]

                        if (userData) {
                            console.log("Retrieved user data")
                            this.isAdmin = userData.admin
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
                        
                        this.getMatches(this.$route.query.uploadId)
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
        }
    },
    watch: {
        'updated': {
            deep: true,
            handler(newVal) {
                /* only allow submission if user changed anything */
                if (JSON.stringify(newVal) !== JSON.stringify(this.original)) {
                    this.changesFound = true
                } else {
                    this.changesFound = false
                }
            }
        },
        
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
                return this.$httpInterceptors.push((request) => {
                    request.headers.set('Authorization', token)
                })
            })
            .catch((error) => console.log(error))
        },
        getMatches(uploadId) {
            this.loadingMatches = true

            let ref = null

            /*if (this.tournamentId) {
                ref = 
                this.$matches.get({tournamentId: this.tournamentId, videoId: this.videoId, fromUser: this.fromUser})
            } else {
                ref = this.$matches.get({matchId: this.matchId})
            }*/

            ref = this.$matches.get({uploadId: uploadId})

            ref
            .then((response) => {
                if (response.ok) {
                    this.tournament = response.body.groups[0]._id.tournament
                    this.original = response.body.groups[0].matches
                    this.updated= JSON.parse(JSON.stringify(this.original))
                    this.url = (this.original[0].video ? 'https://youtu.be/' + this.original[0].video.id : null)
                    this.loadingMatches = false
                }
            })
            .catch((error) => {
                 console.log(error)
                 this.loadingMatches = false
                 this.failedMatchGet = true
            })
        },
        resetMatches() {
            this.updated = JSON.parse(JSON.stringify(this.original))
            this.resetData = !this.resetData
        },
        updateCharacter(character, i) {
            this.$set(this.updated.players[i], 'character', character)
        },
        updateMatches() {
            this.uploading = true
            let updated = this.updated.filter((match) => {
                let i = this.original.findIndex(original => 
                    original._id === match._id
                )

                if (JSON.stringify(match) !== JSON.stringify(this.original[i])) {
                    return true
                } else {
                    return false
                }
            })
            .map((match) => {
                return match
            })

            console.log(JSON.parse(JSON.stringify(updated)))

            

            this.$update.save(updated)
            .then((response) => {
                if (response.ok) {
                    console.log('Updates successful')
                } else {
                    console.log('Updates failed')
                }
                this.uploading = false
                this.finished = true
            })
            .catch((error) => {
                console.log(error)
                this.uploading = false
                this.finished = true
            })

        },
        setUrl(url, i) {
            console.log('setting video')
            if (!this.updated[i].video) {
                
                this.$set(this.updated[i], 'video', {})
            }

            if (this.updated[i].video.url !== url || !this.updated[i].video.url) {
                this.$set(this.updated[i].video, 'url', 'https://youtu.be/watch?v=' + url.match(this.$regex.ytId)[1])
                this.$set(this.updated[i].video, 'id', url.match(this.$regex.ytId)[1])
            }

            if (i === 0 && !this.individualUrls) {
                this.staticUrl = url
                console.log(url)
            }
        },
        setTimestamp(timestamp, i) {
            if (this.updated[i].video && !this.updated[i].video.timestamp || this.updated[i].video.timestamp !== timestamp) {
                this.$set(this.updated[i].video, 'timestamp', timestamp)
            }
        },
        deleteVideo(i) {
            if (this.updated[i].video) {
                console.log('deleting video')
                this.$delete(this.updated[i], 'video')
            }
        },
        deleteTimestamp(i) {
            if (this.updated[i].video && this.updated[i].video.timestamp) {
                console.log('deleting timestamp')
                this.$delete(this.updated[i].video, 'timestamp')
            }
        },
        reload() {
            this.$router.go(this.$router.currentRoute)
        }
    }
}
</script>

<style scoped>
@import '../assets/css/uploads.css';

.v-stepper >>> .v-stepper__wrapper {
    overflow: visible !important;
}

.v-input--is-readonly >>> .v-input__slot::before {
    border-color: rgba(255, 255, 255, 0.7) !important;
}

.v-input--is-readonly >>> i {
    color: #5e5e5e !important
}

.v-input--is-readonly >>> .v-label,
.v-input--is-readonly >>> .v-messages,
.v-input--is-readonly >>> input {
    color: rgba(255, 255, 255, 0.7) !important;
}

</style>