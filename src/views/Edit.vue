<template>
    <v-container v-if="id" id="edits">
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
                        <pre v-if="match.file"
                        style="max-width: 99%;
                        overflow: clip;
                        white-space: break-spaces;
                        text-overflow: ellipsis;">{{ match.file.name }}</pre>
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
                        v-show="!loading && Object.keys(match).length > 0"
                        class="preview">
                            <v-col
                            class="file-info align-center"
                            :cols="$vuetify.breakpoint.smAndDown ? 12 : 8">
                                <v-col
                                :cols="$vuetify.breakpoint.smAndDown ? 12 : undefined"
                                :class="`player p${i+1}`"
                                v-for="(player, i) in updated.players"
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
                                class="link">
                                    <v-text-field
                                    ref="url"
                                    v-model="url"
                                    :dense="$vuetify.breakpoint.mdAndUp"
                                    @blur="url = tempUrl"
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
                                    v-model="timestamp"
                                    :dense="$vuetify.breakpoint.mdAndUp"
                                    @blur="timestamp = ( timestamp ? timestamp.match(re.timestamp)[0] : null )"
                                    :rules="rules.timestamp"
                                    :disabled="!url || !$refs.url.valid"
                                    ref="timestamp"
                                    clearable
                                    prepend-icon="mdi-timer-outline"
                                    label="Timestamp"/>
                                </v-row>
                            </v-col>

                            
                        </v-row>
                        
                        <v-row
                        class="buttons"
                        v-show="!loading && Object.keys(match).length > 0"
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
        user: [String, null]
    },
    data: () => {
        return {
            uid: null,
            hidden: true,
            loading: false,
            step: 1,
            match: {},
            updated: {},
            valid: false,
            changesFound: false,
            url: null,
            tempUrl: null,
            timestamp: null,
            isAdmin: false,
            isRegistered: true,
            loggingIn: false,
            loadingMatch: false,
            re: {
                youtube: /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*)/,
                id: /(?<=\?v=)\w*(?=[^#\&\?]*)/,
                //for timestamp at end of youtube urls
                urlTimestamp: /(?<=&t=)((?:[0-9]{1,2})h)?((?:[0-9]{1,3})m)?((?:[0-9]{1,5})s)?/g,
                // for checking if full timestamp string is valid
                timestamp: /^([0-9]{1,2}h)?([0-9]{1,3}m)?([0-9]{1,5}s)?$/g,
            },
            rules: {
                name: [
                    v => !!v || 'Required'
                ],
                url: {
                    noReq: [
                        v => !v || v && /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*)/.test(v) || 'Invalid URL',
                        v => !v || /(?<=\?v=)([^#\&\?]*)/.test(v) && v.match(/(?<=\?v=)([^#\&\?]*)/)[0].length === 11 || 'Video ID must be 11 characters'
                    ],
                    req: [
                        v => !!v || 'Required',
                        v => !v || v && /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*)/.test(v) || 'Invalid URL',
                        v => !v || /(?<=\?v=)([^#\&\?]*)/.test(v) && v.match(/(?<=\?v=)([^#\&\?]*)/)[0].length === 11 || 'Video ID must be 11 characters'                    ]
                },
                timestamp: [
                        v => !v || v && (/^(?=(?:[0-9]{1,5}))([0-9]{1,2}h){0,1}([0-9]{1,3}m){0,1}([0-9]{1,5}s){0,1}?$/g).test(v) || 'Invalid format',
                ],
            },
        }
    },
    mounted: function () {
        if (this.id && !this.user) {
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
                            this.loading = false
                            this.loggingIn = false
                            this.getMatch(this.id)
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
                                this.loading = false
                                this.isRegistered = true
                                this.loggingIn = false
                                this.getMatch(this.id)
                                this.step = 2
                                
                            })
                        }
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                } else {
                    if (user) {
                        
                        this.loading = false;
                        this.getMatch(this.id)
                        console.log('Signed in')
                        this.uid = user.uid
                        this.step = 2
                    } else {
                        console.log('Signed out')
                    }

                }
            })
        } else if (this.id && this.user) {
            this.getMatch(this.id)
            this.step = 2
            this.loading = false
            console.log("Skipping sign in")
        }
    },
    watch: {
        'updated': {
            deep: true,
            handler(newVal) {
                /* only allow submission if user changed anything */
                if (JSON.stringify(newVal) !== JSON.stringify(this.match)) {
                    this.changesFound = true
                } else {
                    this.changesFound = false
                }
            }
        },
        'url': function(v) {
            if (v && v.match(/(?<=\?v=)([^#\&\?]*)/) && v.match(/(?<=\?v=)([^#\&\?]*)/)[0].length === 11) {
                this.tempUrl = v.match(this.re.youtube)[0]

                if (this.tempUrl && !this.video || this.tempUrl !== this.video.url) {
                    this.$emit('set-url', this.tempUrl)
                }

                if (this.re.urlTimestamp.test(v) && v.match(this.re.urlTimestamp)[0] !== this.timestamp) {
                    this.timestamp = v.match(this.re.urlTimestamp)[0]
                }
            } else {
                
                this.tempUrl = (this.video ? this.video.url : null)
                this.timestamp = (this.video && this.video.timestamp ? this.video.timestamp : null)
                this.$emit('delete-video')
                return null
            }
        },
        
        'timestamp': function(v) {
            ///^(?=(?:[0-9]{1,5}))([0-9]{1,2}h){0,1}([0-9]{1,3}m){0,1}([0-9]{1,5}s){0,1}?$/g
            if (this.timestamp && (this.re.timestamp).test(v)) {
                    if (this.timestamp !== this.currentTimestamp)
                    this.$emit('set-timestamp', this.timestamp.match(this.re.timestamp)[0])
            } else {
                //this.$delete(this.updated.video, 'timestamp')
                this.$emit('delete-timestamp')
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
        },
        getMatch(id) {
            this.loadingMatch = true
            this.$matches.get({id}).then((response) => {
                if (response.ok) {
                    this.match = response.body.matches[0]
                    this.updated= JSON.parse(JSON.stringify(this.match))

                    if (this.match.video) {
                        this.url = this.match.video.url
                        
                        if (this.match.video.timestamp) {
                            this.timestamp = this.match.video.timestamp
                        }
                    }

                    this.loadingMatch = false
                }
            })
        },
        resetMatch() {
            this.updated = JSON.parse(JSON.stringify(this.match))
            this.url = (this.match.video ? this.match.video.url : null)
            this.timestamp = (this.match.video ? this.match.video.timestamp : null)
            this.tempUrl = this.url
        },
        updateCharacter(character, i) {
            this.$set(this.updated.players[i], 'character', character)
        },
        updateMatch() {

        },
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