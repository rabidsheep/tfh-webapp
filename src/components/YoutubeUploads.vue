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
            succeeded,
            failed,
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
                                        Parse Timestamps
                                    </v-btn>
                                </v-col>
                                
                                <v-col>
                                    <v-btn
                                    rounded
                                    :ripple="false"
                                    color="button2"
                                    @click="currentDescription = video.description">
                                        Reset Timestamps
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </v-row>
                    </template>
                </div>

                <v-row
                class="mt-8"
                v-show="currentDescription">
                    <v-col
                    :cols="$vuetify.breakpoint.xsOnly ? 8 : undefined"
                    class="tournament">
                        <v-text-field
                        dense
                        v-model="tournament.name"
                        :rules="rules.tournament"
                        label="Tournament Name"
                        required />
                    </v-col>

                    <v-col
                    class="tournament"
                    :cols="$vuetify.breakpoint.xsOnly ? undefined : 2">
                        <v-text-field
                        dense
                        v-model="tournament.num"
                        label="No." />
                    </v-col>

                    <v-col
                    :cols="$vuetify.breakpoint.xsOnly ? 12 : undefined"
                    class="tournament">
                        <v-menu
                        v-model="datepicker"
                        :close-on-content-click="false"
                        :nudge-right="40"
                        transition="scale-transition"
                        offset-y
                        min-width="auto">
                            <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                v-model="tournament.date"
                                label="Date"
                                :rules="rules.date"
                                required
                                prepend-icon="mdi-calendar"
                                dense
                                v-bind="attrs"
                                v-on="on" />
                            </template>

                            <v-date-picker
                            v-model="date"
                            @input="datepicker = false" />
                        </v-menu>
                    </v-col>
                </v-row>

                <div
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

                    <center v-show="matches.length <= 0 && parsed">
                        No matches found!
                    </center>

                    <center v-if="vid && !loading">
                        <v-btn
                        :ripple="false"
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
            form: 1,
            valid: false,
            loading: false,
            url: '',
            currentDescription: '',
            datepicker: false,
            date: null,
            tournament: {
                name: null,
                num: null,
                date: null
            },
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
            rules: {
                name: [
                    v => !!v || 'Required'
                ],
                url: [
                    v => !!v || 'Required',
                    v => !v || v && /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*)/.test(v) || 'Invalid URL',
                    v => !v || /(?:\?v=|youtu.be\/)([^#\&\?]*)/.test(v) && /(?:\?v=|youtu.be\/)([^#\&\?]{11}$)/.test(v) || 'Video ID must be 11 characters'
                ],
                timestamp: [
                    v => !v || v && (/^([0-9]{1,2}h)?([0-9]{1,3}m)?([0-9]{1,5}s)?$/).test(v) || 'Invalid format',
                ],
                tournament: [
                    v => !!v || 'Required',
                ],
                date: [
                    v => !!v || 'Required'
                ]
            },
            hidden: true,
            valid: false,
            matchesFound: false,
            parsed: false,
            invalidId: false,
        }
    },
    watch: {
        'date': function(v) {
          this.tournament.date = this.formatDate(v)
      }
    },
    methods: {
        formatDate(date) {
            if (!date) return null

            const [year, month, day] = date.split('-')
            return `${month}-${day}-${year}`
        },
        validateYoutubeID() {

            this.vid = this.url.match(this.$regex.ytId)[1]


            this.url = "https://youtu.be/watch?v=" + this.vid
            this.loading = true
            
            this.video = {}
            let youtubeRef = null

            if (process.env.NODE_ENV === "production") {
                youtubeRef = this.setAuthToken().then(() => {
                    console.log('Retrieving Youtube data')
                    return this.$youtubeData.get({ v: this.vid })
                })
            } else {
                youtubeRef = this.$youtubeData.get({ v: this.vid })
            }

            youtubeRef.then((response) => {
                
                if (response.ok) {
                    this.video = response.body
                    this.invalidId = false
                    this.currentDescription = this.video.description
                    this.tournament.name = this.video.title
                    this.tournament.date = this.video.date

                    this.parseVideoDescription(this.currentDescription)
                }
                this.loading = false
                this.error = false
            })
            .catch((error) => {
                this.invalidId = true
                this.loading = false
                console.log(error)
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
                                    id: this.video.id,
                                    timestamp: timestamp,
                                },
                                p1: {
                                        name: matched[1],
                                        character: ((this.$characters).find(c => c.names.includes(matched[2])).name)
                                    },
                                p2: {
                                        name: matched[3],
                                        character: ((this.$characters).find(c => c.names.includes(matched[4])).name)
                                    }
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
                p1: {},
                p2: {},
                video: {
                    url: "https://youtu.be/watch?v=" + this.video.id,
                    timestamp: null,
                }
            })
        },
        /** upload youtube-only object */
        youtubeUpload() {
            this.uploading = true
            let succeed = 0
            let fail = 0

            let matches = this.matches.map((match) => {
                let time = ((new Date()).toISOString()).split('T')
                match.type = 'Tournament'
                match.channel = this.video.channel
                match.uploadDate = time[0]
                match.uploadTime = time[1]

                match.tournament = this.tournament

                return match
            })

            console.log(JSON.parse(JSON.stringify(matches)))

            this.$matches.save({matches: matches, form: this.form}).then((response) => {
                if (response.ok) {
                    console.log('Uploaded matches:')
                    for (const i in response.body.matchIds) {
                        console.log('ID:', response.body.matchIds[i])
                    }
                } else {
                    this.setErrors('upload', this.files[i].name)
                    console.log('Failed to upload a match')
                }

                this.uploading = false
                this.finished = true
            })
            .catch((error) => console.log(error))

            /*for (let i = 0; i < this.matches.length; i++) {
                // upload match info to db
                this.$matches
                .save(this.matches[i])
                .then((response) => {
                    if (response.ok) {
                        succeed += 1
                        console.log('Successfully uploaded document #' + (fail + success) + ' (ID: ' + response.body.docId + ')')
                    } else {
                        fail += 1
                        console.log('Failed to upload a match')
                    }
                    
                    if (fail + succeed === this.matches.length) {
                        this.failed = fail
                        this.succeeded = succeed
                        this.uploading = false
                        this.finished = true
                    }
                })
            } */
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
            this.vid = null
            this.tournament = {
                name: null,
                num: null,
                date: null
            }
            this.currentDescription = null
            this.invalidId = false
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
