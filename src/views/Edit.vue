<template>
    <v-container v-if="id || tournament" id="edits">
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

                        <br />

                        <v-progress-linear
                        color="accent"
                        indeterminate
                        v-show="$firebase.auth().currentUser"/>

                        <v-layout
                        class="body"
                        column
                        justify-center
                        align-center>
                            <v-btn
                            height="50"
                            rounded
                            v-show="!$firebase.auth().currentUser && !uid"
                            @click="signIn('google')">
                                <v-icon left>mdi-google</v-icon>
                                Google
                            </v-btn>
                        </v-layout>
                        <!--<v-btn height="50" v-show="!$firebase.auth().currentUser" @click="signIn('twitter')">
                            <v-icon left>mdi-twitter</v-icon> Twitter
                        </v-btn>-->
                    </v-layout>
                </v-stepper-content>

                <v-stepper-content step="2">
                    <center>
                        <h1>Edit Match Details</h1>
                        <pre v-if="id"
                        style="max-width: 99%;
                        overflow: clip;
                        white-space: break-spaces;
                        text-overflow: ellipsis;">Match ID: {{ id }} </pre>
                        <pre v-if="matches.file"
                        style="max-width: 99%;
                        overflow: clip;
                        white-space: break-spaces;
                        text-overflow: ellipsis;">{{ matches.file.name }}</pre>
                    </center>
                    
                    
                    
                    <center v-show="loadingMatch">
                        <br />
                        <v-progress-circular
                        indeterminate />
                    </center>

                    <v-form
                    v-model="valid"
                    ref="form"
                    id="edit">
                        <div style="width: 100%;"><br /></div>
                        
                        <v-row
                        v-for="(match, i) in matches"
                        :key="i"
                        v-show="!loading && Object.keys(matches).length > 0"
                        class="preview">
                            <v-col
                            class="file-info align-center"
                            :cols="$vuetify.breakpoint.smAndDown ? 12 : 8">
                                <v-col
                                :cols="$vuetify.breakpoint.smAndDown ? 12 : undefined"
                                :class="`player p${i+1}`"
                                v-for="(player, i) in [updated[i].p1, updated[i].p2]"
                                :key="i"
                                :reverse="i === 0 && !$vuetify.breakpoint.smAndDown">
                                    <CharacterSelect
                                    :currentCharacter ="player.character"
                                    :index = "i"
                                    :selectionEnabled="false"
                                    :anyEnabled="false"
                                    @character-select="$emit('update-character', { character: $event, index: i})"/>
                                                    
                                    <v-text-field
                                    v-model="player.name"
                                    :rules="rules.name"
                                    :label="`Player ${i + 1}`"
                                    :reverse="i === 0 && !$vuetify.breakpoint.smAndDown"
                                    maxLength="64"
                                    counter="64"
                                    required
                                    />
                                </v-col>
                                
                                <v-col
                                cols="1"
                                align="center"
                                justify="center"
                                class="vs"
                                v-if="!$vuetify.breakpoint.smAndDown">
                                    vs.
                                </v-col>
                            </v-col>
                                

                            <v-col
                            class="youtube"
                            :cols="$vuetify.breakpoint.smAndDown ? 12 : 4 ">
                                <v-row
                                v-if="!tournament"
                                class="link">
                                    <v-text-field
                                    ref="url"
                                    v-model="urls[i]"
                                    :dense="$vuetify.breakpoint.mdAndUp"
                                    @blur="urls[i] = tempUrls[i]"
                                    :clearable="!match.file ? false : true"
                                    :rules="!match.file ? rules.url.req : rules.url.noReq"
                                    :disabled="!match.file ? true : false"
                                    :required="!match.file ? true : false"
                                    :label="match.file ? `YouTube Link (Optional)` : `YouTube Link (Required)`"
                                    prepend-icon="mdi-youtube" />
                                </v-row>

                                <v-row
                                class="timestamp">
                                    <v-text-field
                                    v-model="timestamps[i]"
                                    :dense="$vuetify.breakpoint.mdAndUp && !tournament"
                                    :rules="rules.timestamp"
                                    :disabled="!urls[i]"
                                    ref="timestamp"
                                    clearable
                                    prepend-icon="mdi-timer-outline"
                                    label="Timestamp"/>
                                </v-row>
                            </v-col>

                            
                        </v-row>
                        
                        <v-row
                        class="buttons"
                        v-show="!loading && Object.keys(matches).length > 0"
                        align="center"
                        justify="space-around">
                            <v-col class="reset">
                                <v-btn
                                rounded
                                color="accent"
                                @click="resetMatch()">
                                    Reset
                                </v-btn>
                            </v-col>

                            <v-col class="submit">
                                <v-btn
                                rounded
                                :disabled="!valid || !changesFound"
                                color="accent"
                                @click="updateMatch()">
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
import CharacterSelect from '.././components/CharacterSelect.vue'
import 'firebase/storage'


export default {
    name: 'Edit',
    components: {
        CharacterSelect,
    },
    props: {
        id: String,
        tournament: String
    },
    data: () => {
        return {
            query: null,
            uid: null,
            hidden: true,
            loading: false,
            step: 1,
            matches: {},
            updated: {},
            valid: false,
            changesFound: false,
            urls: [],
            tempUrl: null,
            timestamps: [],
            isAdmin: false,
            isRegistered: true,
            loggingIn: false,
            loadingMatch: false,
            rules: {
                name: [
                    v => !!v || 'Required'
                ],
                url: {
                    req: [
                        v => !!v || 'Required',
                        v => !v || v && /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*)/.test(v) || 'Invalid URL',
                        v => !v || /(?:\?v=|youtu.be\/)([^#\&\?]*)/.test(v) && /(?:\?v=|youtu.be\/)([^#\&\?]{11}$)/.test(v) || 'Video ID must be 11 characters'
                    ],
                    noReq: [
                        v => !v || v && /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*)/.test(v) || 'Invalid URL',
                        v => !v || /(?:\?v=|youtu.be\/)([^#\&\?]*)/.test(v) && /(?:\?v=|youtu.be\/)([^#\&\?]{11}$)/.test(v) || 'Video ID must be 11 characters'
                    ]
                },
                timestamp: [
                    v => !v || v && (/^([0-9]{1,2}h)?([0-9]{1,3}m)?([0-9]{1,5}s)?$/).test(v) || 'Invalid format',
                ],
            },
        }
    },
    mounted: function () {


        if (this.tournament) {
            this.query = JSON.parse(this.tournament)
        } else {
            this.query = this.id
        }

        //console.log(this.query)

        if ((this.id || this.tournament) && !localStorage.getItem('user')) {
            this.$firebase.auth().onAuthStateChanged((user) => {
                
                if (!user) {
                    localStorage.removeItem('user')
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
                        this.uid = user.uid

                        if (userData) {
                            console.log("Retrieved user data")
                            localStorage.setItem('user', user.uid)

                            this.isAdmin = userData.admin
                            this.loading = false
                            this.loggingIn = false
                            
                            this.getMatch()

                            this.step = 2
                            
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
                                console.log('User created')
                                
                                localStorage.setItem('user', user.uid)
                                this.loading = false
                                this.isRegistered = true
                                this.loggingIn = false
                                this.getMatch()
                                this.step = 2
                                
                            })
                        }
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                } else {
                    if (user) {
                        console.log('Signed in')

                        localStorage.setItem('user', user.uid)
                        this.uid = user.uid
                        this.getMatch()
                        this.loading = false;
                        this.step = 2
                        
                    } else {
                        console.log('Signed out')

                        localStorage.removeItem('user')
                    }

                }
            })
        } else if ((this.id || this.tournament) && localStorage.getItem('user')) {
            console.log("Skipping sign in")

            this.uid = localStorage.getItem('user')
            this.getMatch()
            this.loading = false
            this.step = 2
        }
    },
    watch: {
        'updated': {
            deep: true,
            handler(newVal) {
                /* only allow submission if user changed anything */
                if (JSON.stringify(newVal) !== JSON.stringify(this.matches)) {
                    this.changesFound = true
                } else {
                    this.changesFound = false
                }
            }
        },
        'url': function(v) {
            if (v && this.$regex.ytUrl.test(v) && this.$regex.ytIdLength.test(v)) {
                this.tempUrl = v.matches(this.$regex.ytUrl)[0]

                if (this.tempUrl && !this.video || this.tempUrl !== this.video.url) {
                    this.$emit('set-url', this.tempUrl)
                }
                
                if (this.$regex.urlTimestamp.test(v) && v.matches(this.$regex.urlTimestamp)[1] !== this.timestamp) {
                    this.timestamp = v.matches(this.$regex.urlTimestamp)[1]
                }
            } else {
                this.tempUrl = (this.video ? this.video.url : null)
                this.timestamp = (this.video && this.video.timestamp ? this.video.timestamp : null)
                this.$emit('delete-video')
                return null
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
        getMatch() {
            this.loadingMatch = true
            let ref = null

            if (this.tournament) {
                ref = this.$matches.get({tournament: this.query})
            } else {
                ref = this.$matches.get({id: this.query})
            }

            ref
            .then((response) => {
                if (response.ok) {
                    this.matches = response.body.groups[0].matches
                    this.updated= JSON.parse(JSON.stringify(this.matches))

                    this.urls = this.matches.map((match) => {
                        if (match.video) {
                            return match.video.url
                        }
                    })

                    console.log(this.urls)

                    this.timestamps = this.matches.map((match) => {
                        if (match.video && match.video.timestamp) {
                            return match.video.timestamp
                        }
                    })

                    console.log(this.timestamps)

                    this.loadingMatch = false
                }
            })
            .catch((error) => console.log(error))
        },
        resetMatch() {
            this.updated = JSON.parse(JSON.stringify(this.matches))
            this.urls = this.matches.map((match) => {
                if (match.video) {
                    return match.video.url
                }
            })
            this.timestamps = this.matches.map((match) => {
                if (match.video.timestamp) {
                    return match.video.timestamp
                }
            })

            this.tempUrl = this.urls
        },
        updateCharacter(character, i) {
            this.$set(this.updated.players[i], 'character', character)
        },
        updateMatch() {

        },
        changeTimestamp(timestamp, i) {
            console.log(timestamp.match(/^([0-9]{1,2}h)?([0-9]{1,3}m)?([0-9]{1,5}s)?$/))
            return (timestamp.match(this.$regex.strTimestamp) ?
                timestamp.match(this.$regex.strTimestamp)[0] :
                null
            )
        },
        validateTimestamp(timestamp) {

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