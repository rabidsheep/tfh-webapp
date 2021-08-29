<template>
    <v-row class="preview">
        <v-col
        cols="12"
        class="header">
            <div
            :class="$vuetify.breakpoint.smAndDown ? `leader mr-3` : `leader mr-3` ">
                <button
                aria-label="Remove Match"
                :ripple="false"
                class="remove"
                @click.prevent="$emit('remove')">
                    <RemoveButton />
                </button>
                
                <div class="matchinfo">
                    <b>{{ 'Match #' + (index+1) }}</b>
                    <br />
                    File Date: {{ fileDate }}
                </div>
            </div>
            
            <v-divider :vertical="$vuetify.breakpoint.smAndDown" />

            <v-col
            class="name ml-3"
            :cols="undefined">
                <v-text-field
                readonly
                class="filename"
                v-model="file.name"
                prepend-icon="mdi-file"
                dense
                label="File"
                outlined
                hide-details />
            </v-col>

            
        </v-col>

        <v-col
        class="swap">
            <button
            aria-label="Move Up"
            :disabled="firstMatch"
            :class="!firstMatch ? `move up` : `move up disabled`"
            @click.prevent="$emit('move-up')">
                <UpButton />
            </button>

            <button
            aria-label="Move Down"
            :disabled="lastMatch"
            :class="!lastMatch ? `move down` : `move down disabled`"
            @click.prevent="$emit('move-down')">
                <DownButton />
            </button>
        </v-col>

        <v-col
        class="data">
            <v-col
            class="players"
            :cols="$vuetify.breakpoint.smAndDown ? ($vuetify.breakpoint.xsOnly ? 12 : undefined) : 8">
                <v-col
                :cols="$vuetify.breakpoint.smAndDown ? 12 : undefined"
                :class="`player p${i+1}`"
                v-for="(player, i) in [p1, p2]"
                :key="i"
                :reverse="i === 0 && !$vuetify.breakpoint.smAndDown">
                    <CharacterSelect
                    :currentCharacter ="player.character"
                    :index="i"
                    :selectionEnabled="true"
                    :anyEnabled="false"
                    @character-select="$emit('update-character', { character: $event, index: i})"/>
                                    
                    <v-text-field
                    :label="`Player ${i + 1}`"
                    v-model="player.name"
                    maxLength="64"
                    counter="64"
                    single-line
                    required
                    :rules="rules.name"
                    :reverse="i === 0 && !$vuetify.breakpoint.smAndDown" />

                    <!-- just here for form validation so people
                    don't submit matches without any characters -->
                    <v-select
                    v-model="player.character"
                    :items="$characters"
                    :return-object="false"
                    item-text="name"
                    item-value="name"
                    required
                    :rules="rules.character"
                    v-show="false" />
                </v-col>
                
                <v-col
                cols="1"
                class="vs"
                v-if="!$vuetify.breakpoint.smAndDown">
                    vs.
                </v-col>
            </v-col>

            <v-col
            class="add"
            :cols="$vuetify.breakpoint.smOnly ? 3 : undefined">
                <v-col
                cols="12"
                class="link">
                    <v-text-field
                    ref="url"
                    label="YouTube Link"
                    v-model="url"
                    prepend-icon="mdi-youtube"
                    hint="Optional"
                    persistent-hint
                    single-line
                    @blur="url = tempUrl"
                    :clearable="!isTournament"
                    :dense="!$vuetify.breakpoint.smOnly"
                    :rules="rules.url"
                    :readonly="isTournament" />
                </v-col>

                
                <v-col
                cols="12"
                class="timestamp">
                    <v-text-field
                    ref="timestamp"
                    label="Timestamp"
                    v-model="timestamp"
                    prepend-icon="mdi-timer-outline"
                    hint="##h##m##s"
                    persistent-hint
                    single-line
                    clearable
                    :dense="!$vuetify.breakpoint.smOnly"
                    :rules="rules.timestamp"
                    :disabled="!url || !$refs.url.validate()" />
                </v-col>
            </v-col>
        </v-col>
    </v-row>
</template>

<script>
import CharacterSelect from './CharacterSelect.vue'
import RemoveButton from '.././assets/img/svg/remove'
import DownButton from '.././assets/img/svg/down'
import UpButton from '.././assets/img/svg/up'

export default {
    components: {
        CharacterSelect,
        RemoveButton,
        DownButton,
        UpButton,
    },
    name: 'FilePreview',
    props: {
        file: {
            name: String,
        },
        video: [Object, null],
        players: Array,
        p1: Object,
        p2: Object,
        version: Number,
        index: Number,
        progress: Number,
        fileDate: String,
        uploading: Boolean,
        videoUrl: [String, null],
        currentTimestamp: [String, null],
        //matchDate: [String, Object, null],
        isTournament: Boolean,
        firstMatch: Boolean,
        lastMatch: Boolean,
    },
    data: () => {
        return {
            hidden: true,
            valid: false,
            url: null,
            tempUrl: null,
            timestamp: null,
            datepicker: false,
            date: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
            dateFormatted: null,
            rules: {
                name: [
                    v => !!v || 'Required'
                ],
                url: [
                    v => !v || v && /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*)/.test(v) || 'Invalid URL',
                    v => !v || /(?:\?v=|youtu.be\/)([^#\&\?]*)/.test(v) && /(?:\?v=|youtu.be\/)([^#\&\?]{11}$)/.test(v) || 'Video ID must be 11 characters'
                ],
                timestamp: [
                    v => !v || v && (/^([0-9]{1,2}h)?([0-9]{1,3}m)?([0-9]{1,5}s)?$/).test(v) || 'Invalid format',
                ],
            }
        }
    },
    mounted() {
        this.url = this.videoUrl
    },
    // test url: https://www.youtube.com/watch?v=uciAaVk3xaE
    watch: {
        'url': function(url) {
            
            if (this.$refs.url.validate()) {
                this.tempUrl = url.match(this.$regex.ytUrl)[0]

                if (this.tempUrl && !this.video || this.tempUrl !== this.video.url) {
                    this.$emit('set-video-id', this.tempUrl.match(this.$regex.ytId)[1])
                }
                
                if (!this.isTournament && this.checkUrlForTimestamp(url)) {
                    this.timestamp = url.match(this.$regex.urlTimestamp)[1]
                }
            } else {
                this.tempUrl = null
                this.timestamp = null
                this.$emit('delete-video')
            }
        },

        'videoUrl': function(url) {
            if (url !== this.url) this.url = url
        },
        
        'timestamp': function(ts) {
            if (this.$refs.timestamp.validate()) {
                    if (ts !== this.currentTimestamp) {
                        this.$emit('set-timestamp', ts.match(this.$regex.strTimestamp)[0])
                    }
            } else {
                this.$emit('delete-timestamp')
            }
        },
        /* currently not enabled
        
        'date': function(v) {
            this.$emit('update-file-date', this.formatDate(new Date(v).toISOString().split('T')[0]))
            this.dateFormatted = this.formatDate(v)
        },
        'matchDate': function(date) {
            this.dateFormatted = date
        }
        */
    },
    methods: {
        /* currently not in use
        formatDate (date) {
            if (!date) return null

            const [year, month, day] = date.split('-')
            return `${month}-${day}-${year}`
        },
        */
        checkUrlForTimestamp(url) {
            return (this.$regex.urlTimestamp.test(url) && url.match(this.$regex.urlTimestamp)[1] !== this.timestamp)
        }
    }
}
</script>

<style scoped>
.small .header {
    justify-content: space-between;
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

.wide .p1 >>> .v-input__append-inner {
    padding-left: 0px;
    padding-right: 4px;
}
</style>