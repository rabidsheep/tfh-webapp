<template>
    <v-form
    id="youtube"
    class="form"
    ref="form"
    v-model="valid">
        <StatusOverlay
        v-bind="{
            error,
            errors,
            uploading,
            finished,
            succeeded,
            failed,
            }"
        @clear-errors="clearErrors()"
        @close="resetForm()" />

        <v-layout
        class="wrapper"
        column
        align-center
        justify-center>
            <v-layout
            class="body"
            column
            align-center
            justify-center>
                <v-row
                class="url-input py-5">
                    <v-text-field
                    class="url"
                    ref="url"
                    label="YouTube Link"
                    v-model="url"
                    prepend-icon="mdi-youtube"
                    hide-details
                    clearable
                    required
                    :rules="rules.url" />

                    <v-btn
                    v-if="$refs.url"
                    color = "accent"
                    rounded
                    :ripple="false"
                    :disabled="!$refs.url.valid"
                    @click="validateYoutubeID()">
                        Go
                    </v-btn>
                </v-row>

                <v-progress-circular
                v-if="loading"
                indeterminate />
                
                <template v-if="!loading">
                    <template v-if="invalidId">
                        No video found under ID '{{ vid }}'
                    </template>

                    <div
                    v-if="Object.keys(video).length"
                    class="data"
                    column
                    justify-center
                    align-center>
                        <template v-if="Object.keys(video).length > 0">
                            <v-row
                            class="date-title">
                                <v-text-field
                                class="title"
                                label="Video Title"
                                v-model="video.title"
                                readonly
                                disabled />

                                <v-text-field
                                class="date"
                                label="Date Uploaded"
                                v-model="video.date"
                                readonly
                                disabled />
                            </v-row>

                            <v-row
                            style="position: relative; width: 100%;"
                            justify="space-between"
                            class="desc">
                                <v-textarea
                                class="desc"
                                label="Description"
                                v-model="currentDescription"
                                hint="Format: HH:mm:ss Name (Character) vs Name (Character)"
                                persistent-hint
                                no-resize />
                                
                                <div v-show="$vuetify.breakpoint.smAndDown" style="width: 100%;"><br /></div>

                                <v-row
                                class="desc-buttons">
                                    <v-btn
                                    class="parse"
                                    color="accent"
                                    rounded
                                    :width="$vuetify.breakpoint.smAndDown? `150px` : undefined"
                                    :ripple="false"
                                    @click="parseVideoDescription(currentDescription)">
                                        Parse Timestamps
                                    </v-btn>
                                
                                    <v-btn
                                    class="reset"
                                    color="button2"
                                    rounded
                                    :width="$vuetify.breakpoint.smAndDown? `150px` : undefined"
                                    :ripple="false"
                                    @click="currentDescription = video.description">
                                        Reset Timestamps
                                    </v-btn>
                                </v-row>
                            </v-row>
                        </template>
                    </div>

                    <v-row
                    v-show="currentDescription"
                    class="tournament pa-0"
                    justify="center">
                        <v-col
                        :cols="$vuetify.breakpoint.xsOnly ? 12 : undefined"
                        :class="$vuetify.breakpoint.xsOnly? `name pa-0 mb-6` : `name pa-0 mr-2`">
                            <v-text-field
                            label="Tournament Name"
                            v-model="tournament.name"
                            hint="Required"
                            persistent-hint
                            dense
                            clearable
                            required
                            :rules="rules.tournament" />
                        </v-col>

                        <v-col
                        :class="$vuetify.breakpoint.xsOnly? `num pa-0 mr-2` : `num pa-0 mx-2`"
                        :cols="$vuetify.breakpoint.xsOnly ? undefined : 2">
                            <v-text-field
                            label="No. #"
                            v-model="tournament.num"
                            hint="Optional"
                            persistent-hint
                            clearable
                            dense />
                        </v-col>

                        <v-col
                        class="date pa-0 ml-2">
                            <v-menu
                            v-model="datepicker"
                            :close-on-content-click="false"
                            :nudge-right="40"
                            transition="scale-transition"
                            offset-y
                            min-width="auto">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-text-field
                                    label="Date"
                                    v-model="dateFormatted"
                                    v-bind="attrs"
                                    v-on="on"
                                    prepend-icon="mdi-calendar"
                                    hint="Required"
                                    persistent-hint
                                    dense
                                    required
                                    :rules="rules.date" />
                                </template>

                                <v-date-picker
                                v-model="date"
                                @input="datepicker = false" />
                            </v-menu>
                        </v-col>
                    </v-row>

                    <div
                    class="match-list">
                        <template v-if="!loading && matches.length > 0">
                            <template v-for="(match, i, j) in matches">
                                <YoutubePreview
                                :key="i"
                                :index="i"
                                :uploadType="'youtube'"
                                v-bind="match.video"
                                :p1="match.p1"
                                :p2="match.p2"
                                :currentTimestamp="match.video.timestamp"
                                :fileName="match.file ? match.file.name : null"
                                :firstMatch="i === 0"
                                :lastMatch="i === matches.length - 1"
                                :timestampRequired="matches.length > 1 ? true : false"
                                @remove="removeMatch(i)"
                                @update-character="updateCharacter($event.character, $event.index, i)"
                                @move-up="swapMatches(i, i-1)"
                                @move-down="swapMatches(i, i+1)"
                                @add-file="addFile($event, i)"
                                @remove-file="removeFile($event, i, true)"
                                @set-timestamp="matches[i].video.timestamp = $event"
                                @delete-timestamp="delete matches[i].video.timestamp" />

                                <hr v-if="i < matches.length - 1" :key="j" />
                            </template>
                        </template>
                    </div>

                    <center v-show="matches.length <= 0 && parsed">
                        No matches found!
                    </center>

                    <center v-if="vid">
                        <v-btn
                        class="mt-5 mb-6"
                        height="auto"
                        :ripple="false"
                        :disabled="matches.length > 16"
                        @click="addBlankMatch()"
                        plain>
                            <v-icon left>mdi-plus-thick</v-icon> Add Match
                        </v-btn>
                    </center>

                    <div
                    v-if="matches.length > 0"
                    class="buttons"
                    justify-center
                    align-center>
                        <v-btn
                        color="accent"
                        rounded
                        :ripple="false"
                        :disabled="!valid"
                        @click="youtubeUpload()">
                            Upload
                        </v-btn>
                    </div>
                </template>
            </v-layout>
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
            dateFormatted: null,
            matches: [],
            files: [],
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
    mounted() {
        if (process.env.NODE_ENV === 'development' ) {
            this.url = 'https://www.youtube.com/watch?v=73vR-i3N4CY'
        }
    },
    watch: {
        'date': function(v) {
            this.dateFormatted = this.formatDate(v)
            
            this.tournament.date = this.dateFormatted
      }
    },
    methods: {
        validateYoutubeID() {
            this.loading = true
            this.vid = this.url.match(this.$regex.ytId)[1]
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
                    this.dateFormatted = this.video.date

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
                .catch((error) => console.log(error))
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
                                video: {
                                    id: this.video.id,
                                    timestamp: timestamp,
                                },
                                p1: {
                                        name: matched[1],
                                        character: ((this.$characters).find(c => c.names.includes(matched[2]))?.name)
                                    },
                                p2: {
                                        name: matched[3],
                                        character: ((this.$characters).find(c => c.names.includes(matched[4]))?.name)
                                    }
                            })
                        }
                    }
                }
            })

            this.parsed = true
        },
        addBlankMatch() {
            this.matches.push({
                p1: {},
                p2: {},
                video: {
                    id: this.video.id,
                    timestamp: null,
                },
            })
        },
        /** upload youtube-only object */
        youtubeUpload() {
            this.uploading = true
            let succeed = 0
            let fail = 0

            let matches = this.matches.map((match) => {
                let time = (new Date()).toISOString().split('T')

                //this.printObj(match)

                match = {
                    userId: this.uid,
                    uploadForm: 'youtube',
                    type: 'Tournament',
                    uploadDate: time[0],
                    uploadTime: time[1],
                    tournament: this.tournament,
                    channel: this.video.channel,
                    ...match
                }
                
                //this.printObj(match)

                return match
            })

            
            this.$matches.save({matches: matches, form: this.form})
            .then((response) => {
                if (response.ok) {
                    console.log('Uploaded matches:')
                    for (const i in response.body.matchIds) {
                        console.log('ID:', response.body.matchIds[i])
                    }
                } else {
                    this.setErrors('upload', null)
                    console.log('Failed to upload')
                }

                this.uploading = false
                this.finished = true
            })
            .catch((error) => console.log(error))
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
            this.$refs.url.resetValidation()
        },
        removeMatch(i) {
            if (this.matches[i].file) this.removeFile(this.matches[i].file.name, i, false)
            this.matches.splice(i, 1)
        },
        updateCharacter(character, j, i) {
            this.$set(this.matches[i][`p${j + 1}`], 'character', character)
        },
        swapMatches(i, j) {
            let temp = this.matches[i]
            this.$set(this.matches, i, this.matches[j])
            this.$set(this.matches, j, temp)
        },
        addFile(file, i) {
            this.$set(this.matches[i], 'file', {name: file.name, url: null})
            this.files.push(file)

            //this.printObj(this.matches[i])
            //console.log(this.files)
        },
        removeFile(file, i, deleteFromMatch) {
            //this.printObj(this.matches[i])
            let index = this.files.findIndex((f) => f.name === file)
            //console.log(this.files[index])
            if (index >= 0) this.files.splice(index, 1)
            if (deleteFromMatch) delete this.matches[i].file
            //console.log(this.files[index])
            //this.printObj(this.matches[i])
        }
    }
}
</script>
