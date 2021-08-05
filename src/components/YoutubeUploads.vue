<template>
    <v-form
    id="youtube"
    class="form"
    ref="form"
    v-model="valid">
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
                <v-row>
                    <v-text-field
                    class="url"
                    v-model="url"
                    :error-messages="urlErrors"
                    @input="$v.url.$touch()"
                    @blur="$v.url.$touch()"
                    label="YouTube Link"
                    prepend-icon="mdi-youtube"
                    required
                    />

                    <v-btn
                    rounded
                    :ripple="false"
                    color = "primary"
                    :disabled="$v.url.$invalid"
                    @click="validateYoutubeID()">
                        Go
                    </v-btn>
                </v-row>

                <v-progress-circular
                    indeterminate
                    v-if="loading" />

                <v-layout
                column
                justify-center
                align-center
                class="data">
                    <template v-if="Object.keys(video).length > 0">
                        <v-row>
                            <v-text-field
                            class="title"
                            readonly
                            disabled
                            label="Video Title"
                            v-model="video.title" />

                            <v-text-field
                            class="upload"
                            readonly
                            disabled
                            label="Date Uploaded"
                            v-model="video.date" />
                        </v-row>

                        <v-textarea
                        class="desc"
                        width="85%"
                        readonly
                        disabled
                        label="Description"
                        v-model="video.description" />

                        <v-btn
                        rounded
                        :ripple="false"
                        color = "primary"
                        @click="parseVideoDescription(video.description)">
                            Generate Match List
                        </v-btn>
                    </template>
                </v-layout>

                <template v-if="matches.length > 0">
                        <YoutubePreview
                        v-for="(match, i) in matches"
                        :key="i"
                        :index="i"
                        v-bind="match"
                        :uploadType="'youtube'"
                        @remove-file="$emit('remove', $event)"
                        @update-character="$emit('update-character', { event: $event, mIndex: i })" />
                </template>
            </v-layout>

            <v-layout
            v-if="showSubmit"
            class="buttons"
            justify-center
            align-center>
                <v-btn
                rounded
                :ripple="false"
                color = "primary"
                :disabled="!valid"
                @click="submitMatches()">
                    Submit
                </v-btn>
            </v-layout>
        </v-layout>
    </v-form>
</template>

<script>
import YoutubePreview from './YoutubePreview.vue'
import { required, url, helpers } from 'vuelidate/lib/validators'
const youtubeUrl = helpers.regex('youtubeUrl', /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*)/)
// youtube test video url: https://www.youtube.com/watch?v=uciAaVk3xaE

export default {
    components: { YoutubePreview },
    name: 'YoutubeUploads',
    props: {
        matches: Array,
        errors: Array,
    },
    data: () => {
        return {
            valid: false,
            loading: false,
            url: null,
            showSubmit: false,
            timestamp: null,
            getVideo: false,
            youtube: {},
            video: {},
            re: {
                yt: /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*)/,
                id: /(?<=\?v=)[^#\&\?]*/,
                ts: /(?<=t=)\d+m\d+s|\d+m|\d+s/,
            },
            hidden: true,
            valid: false,
            validUrl: false,
        }
    },
    validations: {
        url: {
            required,
            url,
            youtubeUrl,
        }
    },
    computed: {
        urlErrors() {
            const errors = []
            
            if (!this.$v.url.$dirty) return errors 
            !this.url && errors.push('Required')
            !this.$v.url.url && errors.push('Must be valid URL')

            var yt = {}

            if (!this.$v.url.$invalid) {
                yt['id'] = this.url.match(this.re.id)
                
                if (this.re.ts.test(this.url)) {
                    yt['ts'] = this.url.match(this.re.ts)
                }
            } else {
                errors.push('Invalid URL format')
            }

            this.youtube = yt
            this.$emit('set-youtube', { yt: this.youtube, index: this.index })

            return errors
        }
    },
    methods: {
        validateYoutubeID: function () {
            this.loading = true
            this.video = {}

            this.$youtubeData.get({ v: this.youtube.id })
            .then((response) => {
                this.loading = false
                this.error = false
                if (response.ok) {
                        this.video = response.body
                        console.log(JSON.parse(JSON.stringify(this.video)))
                }
             })
            /*.catch((response) => {
                this.step = 2
                this.loading = false
                this.displayError(`${response.bodyText} (${this.link})`)
            })*/
        },
        parseVideoDescription(desc) {
            let matches = []
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
                            matches.push({
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
            
            console.log(JSON.parse(JSON.stringify(matches)))
            this.$emit('update', matches)

            this.showSubmit = true
        },
        submitMatches() {
            this.$emit('yt-upload', this.matches)
        }
    }
}
</script>
