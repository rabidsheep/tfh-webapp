<template>
    <v-container v-if="tournamentId || matchId" id="edit">
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
                    <v-layout
                    id="step__sign-in"
                    class="step"
                    column
                    justify-center
                    align-center>
                        <h1>Sign In</h1>

                        <div style="width:100%;"><br /></div>

                        <v-layout
                        class="body"
                        column
                        justify-center
                        v-show="!$firebase.auth().currentUser && !loggingIn"
                        align-center>
                            <v-btn
                            height="50"
                            rounded
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
                        </v-layout>

                        <v-progress-linear
                        color="accent"
                        indeterminate
                        v-show="loggingIn"/>

                        <template v-if="loggingIn">
                            <div style="width: 100%;"><br /></div>
                            {{ isRegistered ? 'Verifying user...' : 'Registering user...'}}
                        </template>
                    </v-layout>
                </v-stepper-content>

                <v-stepper-content step="2">
                    <center>
                        <h1>Edit Match Details</h1>
                        <p
                        style="max-width: 99%;
                        overflow: clip;
                        white-space: break-spaces;
                        text-overflow: ellipsis;">
                            <template v-if="matchId">
                                Match ID: {{ matchId }}
                            </template>
                            
                            <!--
                            <template v-if="tournament">
                                {{ tournament.name }}

                                <template v-if="tournament.num">
                                    {{ tournament.num }}
                                </template>

                                <br />

                                {{ tournament.date }}
                            </template>
                            -->
                        </p>
                    </center>
                    
                    <center v-show="loadingMatches">
                        <br />
                        <v-progress-circular
                        indeterminate />
                    </center>

                    <v-form
                    v-model="valid"
                    ref="form"
                    id="edit"
                    v-if="!loading && Object.keys(original).length > 0 && !failedMatchGet">
                        <div style="width: 100%;"><br /></div>
                        
                        <EditPreview
                        v-for="(match, i) in updated"
                        :key="i"
                        :p1="match.p1"
                        :p2="match.p2"
                        :tournament="match.tournament ? match.tournament : null"
                        :video="match.video ? match.video : null"
                        :file="match.file ? match.file : null"
                        :type="match.type"
                        :resetData="resetData"
                        @set-timestamp="setTimestamp($event, i)"
                        @set-url="setUrl($event, i)"
                        @delete-timestamp="deleteTimestamp(i)"
                        @delete-video="deleteVideo(i)" />
                        
                        <v-row
                        class="buttons"
                        v-show="!loading && Object.keys(original).length > 0"
                        align="center"
                        justify="space-around">
                            <v-col class="reset">
                                <v-btn
                                rounded
                                color="accent"
                                @click="resetMatches()">
                                    Reset
                                </v-btn>
                            </v-col>

                            <v-col class="submit">
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
                </v-stepper-content>
            </v-stepper-items>
        </v-stepper>
    </v-container>
</template>

<script>
import EditPreview from '.././components/EditPreview.vue'
import 'firebase/storage'


export default {
    name: 'Edit',
    components: {
        EditPreview
    },
    props: {
        tournamentId: [String, null],
        matchId: [String, null],
        videoId: [String, null],
        fromUser: [String, null]
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
        }
    },
    mounted: function () {
    // auth state watcher
    this.$firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            this.uid = null
            this.step = 1
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
                
                this.getMatches()
            })
            .catch((error) => {

                this.loading = false
                this.isRegistered = true
                this.loggingIn = false
                this.step = 1
                console.log(error)
            })
        }
    })
        
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
                return this.$httpInterceptors.push((request) => {
                    request.headers.set('Authorization', token)
                })
            })
            .catch((error) => console.log(error))
        },
        getMatches() {
            this.loadingMatches = true

            let ref = null

            if (this.tournamentId) {
                ref = 
                this.$matches.get({tournamentId: this.tournamentId, videoId: this.videoId, fromUser: this.fromUser})
            } else {
                ref = this.$matches.get({matchId: this.matchId})
            }

            ref
            .then((response) => {
                if (response.ok) {
                    this.original = response.body.groups[0].matches
                    this.updated= JSON.parse(JSON.stringify(this.original))

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
.v-stepper >>> .v-stepper__wrapper {
    overflow: visible !important;
}

.upload .player >>> .v-input__slot::before {
    width: calc(100% - 1px);
}

.wide .p1 >>> .v-input__append-inner {
    padding-left: 0px;
    padding-right: 4px;
}
</style>