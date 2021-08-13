<template>
    <v-form
    id="youtube"
    class="form"
    ref="form"
    v-model="valid">
        <StatusOverlay
        v-bind="{
            error,
            uploading,
            finished,
            progress,
            succeeded,
            failed
            }"
        :errors="errors"
        @clear-errors="clearErrors()"
        @close="resetForm()" />

        <v-layout
        column
        class="wrapper"
        align-center
        justify-center>
            <v-layout
            class="body"
            column
            align-center
            justify-center>
                <v-row
                class="url-input">
                    <!--<v-text-field
                    class="url"
                    v-model="url"
                    :error-messages="urlErrors"
                    @input="$v.url.$touch()"
                    @blur="$v.url.$touch()"
                    label="YouTube Link"
                    prepend-icon="mdi-youtube"
                    required
                    clearable />-->

                    <v-text-field
                    class="url"
                    ref="url"
                    v-model="url"
                    :rules="rules.url"
                    label="YouTube Link"
                    prepend-icon="mdi-youtube"
                    required
                    clearable />


                    <v-btn
                    v-if="$refs.url"
                    rounded
                    :ripple="false"
                    color = "accent"
                    :disabled="!$refs.url.valid"
                    @click="validateYoutubeID()">
                        Go
                    </v-btn>
                </v-row>

                <v-progress-circular
                    indeterminate
                    v-if="loading" />
                
                <template v-if="invalidId">
                    No video found under ID '{{ vid }}'
                </template>

                <div
                v-if="Object.keys(video).length && !loading"
                column
                justify-center
                align-center
                class="data">
                    <template v-if="Object.keys(video).length > 0">
                        <v-row
                        class="datetitle">
                            <v-text-field
                            class="title"
                            readonly
                            disabled
                            label="Video Title"
                            v-model="video.title" />

                            <v-text-field
                            class="date"
                            readonly
                            disabled
                            label="Date Uploaded"
                            v-model="video.date" />
                        </v-row>

                        <v-row
                        style="position: relative; width: 100%;"
                        justify="space-between"
                        class="desc">
                            <v-textarea
                            class="desc"
                            label="Description"
                            persistent-hint
                            hint="Format: HH:mm:ss Name (Character) vs Name (Character)"
                            v-model="currentDescription"
                            no-resize />
                            
                            <div v-show="$vuetify.breakpoint.smAndDown" style="width: 100%;"><br /></div>

                            <v-row
                            class="desc-buttons"
                            justify="center"
                            align="center">
                            
                                <v-col>
                                    <v-btn
                                    rounded
                                    :ripple="false"
                                    color="accent"
                                    @click="parseVideoDescription(currentDescription)">
                                        Parse Text
                                    </v-btn>
                                </v-col>
                                
                                

                                <v-col>
                                    <v-btn
                                    rounded
                                    :ripple="false"
                                    @click="currentDescription = video.description">
                                        Reset Text
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </v-row>
                    </template>
                </div>

                <div
                v-show="$refs.url && $refs.url.valid && parsed"
                class="match-list">
                    <template v-if="matches.length > 0">
                        <YoutubePreview
                        v-for="(match, i) in matches"
                        :key="i"
                        :index="i"
                        v-bind="match"
                        :uploadType="'youtube'"
                        :timestampRequired="matches.length > 1 ? false : true"
                        @remove="removeMatch(i)"
                        @update-character="updateCharacter($event.character, $event.index, i)" />
                    </template>

                    <template v-if="matches.length <= 0">
                        <center>No matches found!</center>
                    </template>

                    <center>
                        <v-btn
                        :disabled="matches.length > 16"
                        @click="addBlankMatch()"
                        plain>
                            <v-icon left>mdi-plus-thick</v-icon> Add Match
                        </v-btn>
                    </center>
                </div>
            </v-layout>

            <div
            v-if="matches.length > 0"
            class="buttons"
            justify-center
            align-center>
                <v-btn
                rounded
                :ripple="false"
                color = "accent"
                :disabled="!valid"
                @click="youtubeUpload()">
                    Upload
                </v-btn>
            </div>
        </v-layout>
    </v-form>
</template>

<script>
import YoutubePreview from './YoutubePreview.vue'
import StatusOverlay from './StatusOverlay.vue'
// youtube test video url: https://www.youtube.com/watch?v=uciAaVk3xaE

export default {
    components: { YoutubePreview, StatusOverlay },
    name: 'YoutubeUploads',
    props: {
        uid: String,
    },
    data: () => {
        return {
            valid: false,
            loading: false,
            url: '',
            currentDescription: '',
            matches: [],
            error: false,
            uploading: false,
            finished: false,
            matchCount: 0,
            succeeded: 0,
            failed: 0,
            progress: 0,
            errors: [],
            timestamp: null,
            vid: null,
            video: {},
            re: {
                yt: /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*)/,
                id: /(?<=\?v=)[^#\&\?]*/,
                ts: /(?<=t=)\d+m\d+s|\d+m|\d+s/,
            },
            rules: {
                name: [
                    v => !!v || 'Required'
                ],
                url: [
                    v => !!v || 'Required',
                    v => !v || v && /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*)/.test(v) || 'Invalid URL',
                    v => !v || /(?<=\?v=)([^#\&\?]*)/.test(v) && v.match(/(?<=\?v=)([^#\&\?]*)/)[0].length === 11 || 'Video ID must be 11 characters'
                ],
                timestamp: [
                    v => !v || v && (/^(?=(?:[0-9]{1,5}))([0-9]{1,2}h){0,1}([0-9]{1,3}m){0,1}([0-9]{1,5}s){0,1}?$/g).test(v) || 'Invalid format',
                ]
            },
            hidden: true,
            valid: false,
            matchesFound: false,
            parsed: false,
            invalidId: false,
        }
    },
    methods: {
        validateYoutubeID() {
            
            if (this.$refs.url.valid) {
                let matched = this.url.match(this.re.id)
                if (matched && matched[0].length === 11) {
                    this.vid = matched[0]
                }
            } else {
                this.invalidId = true;
                return
            }

            this.url = "https://youtu.be/watch?v=" + this.vid
            this.loading = true
            
            this.video = {}

            if (process.env.NODE_ENV === "production") {
                this.setAuthToken()
                .then(() => {
                    console.log('Retrieving Youtube data')
                    return this.$youtubeData.get({ v: this.vid })
                })
                .then((response) => {
                    this.loading = false
                    this.error = false
                    if (response.ok) {
                        this.video = response.body
                        this.invalidId = false
                        this.currentDescription = this.video.description
                    }
                })
                .catch(() => {
                    this.invalidId = true
                    this.loading = false
                })
            } else {
                this.$youtubeData.get({ v: this.vid })
                .then((response) => {
                    this.loading = false
                    this.error = false
                    if (response.ok) {
                        this.video = response.body
                        this.invalidId = false
                        this.currentDescription = this.video.description
                    }
                })
                .catch(() => {
                    this.invalidId = true
                    this.loading = false
                })
            }
        },
        setAuthToken: function () {
            return this.$firebase.auth().currentUser.getIdToken()
                .then((token) => {
                    console.log('Setting auth token')
                    return this.$httpInterceptors.push((request) => {
                        request.headers.set('Authorization', token)
                    })
                })
        },
        parseVideoDescription(desc) {
            this.matches = []
            let lines = desc.split('\n')
            let tsPattern = /(?:([0-9]{1,2})(?:h|:))?([0-9]{1,2})(?:m|:)([0-9]{1,2})(?:s)?\s+(.*)/i

            lines.forEach((line) => {
                if (line) {
                    let matched = line.match(tsPattern)
                    
                    if (matched) {
                        let hours = matched[1] ? matched[1] : '00'
                        let minutes = matched[2]
                        let seconds = matched[3]
                        let times = [hours, minutes, seconds]
                        for (let i = 0; i < 3; i++) {
                            while (times[i].length < 2) {
                                times[i] = `0${times[i]}`
                            }
                        }
                        let timestamp = `${times[0]}h${times[1]}m${times[2]}s`

                        let players = matched[4]
                        let playersPattern = /\s*(.*)\s+\(\s*(.*)\s*\)\s+vs\s+(.*)\s+\(\s*(.*)\s*\)\s*/i
                        if (players.match(playersPattern)) {
                            let matched = players.match(playersPattern)
                            this.matches.push({
                                userId: this.uid,
                                video: {
                                    url: "https://youtu.be/watch?v=" + this.video.id,
                                    timestamp: timestamp,
                                },
                                players: [
                                    {
                                        name: matched[1],
                                        character: (this.$characters).find(c => c.names.includes(matched[2]))
                                    },
                                    {
                                        name: matched[3],
                                        character: (this.$characters).find(c => c.names.includes(matched[4]))
                                    }
                                ]
                            })
                        }
                    }
                }
            })

            this.parsed = true

            this.showSubmit = true
        },
        addBlankMatch() {
            console.log(this.video)
            this.matches.push({
                userId: this.uid,
                players: [{}, {}],
                index: this.matches.length,
                video: this.video})
        },
        /** upload youtube-only object */
        youtubeUpload() {
            this.uploading = true

            for (let i = 0; i < this.matches.length; i++) {
                // upload match info to db
                this.$matches
                .save(this.matches[i])
                .then((response) => {
                    if (response.ok) {
                        console.log('Successfully uploaded document (ID: ' + response.body.docId + ')')
                        if (i === this.matches.length - 1) {
                            this.uploading = false
                            this.finished = true
                        }
                    } else {
                        this.showError = true
                    }
                })
            } 
        },
        /**
         * clears errors array
         */
        clearErrors() {
           this.errors = []
           this.error = false
        },
        resetForm() {
            this.matches = []
            this.youtube = {}
            this.video = {}
            this.parsed = false
            this.url = null
            this.finished = false
            this.$refs.url.reset()
        },
        removeMatch(i) {
            this.matches.splice(i, 1)
        },
        updateCharacter(character, j, i) {
            this.matches[i].players[j].character = character
        },
    }
}
</script>
