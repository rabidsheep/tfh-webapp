<template>
    <v-row
    class="preview">
        <v-col
        cols="12"
        class="header">
            <button
            aria-label="Remove Match"
            :ripple="false"
            class="remove"
            @click.prevent="$emit('remove')">
                <RemoveButton />
            </button>
            
            <b class="match__num">{{ 'Match #' + (index+1) }}</b>                 
            
            <v-divider />

            <p class="file__date" v-if="fileDate && fileUpload">
                File Date: {{ fileDate }}
            </p>
        </v-col>

        <v-col
        class="main"
        cols="12">
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
            :cols="$vuetify.breakpoint.smAndDown ? ($vuetify.breakpoint.xsOnly ? 12 : undefined) : undefined">
                <v-col
                v-for="(player, i) in [p1, p2]"
                :cols="$vuetify.breakpoint.smAndDown ? 12 : undefined"
                :class="`player p${i+1}`"
                :key="i"
                :reverse="i === 0 && !$vuetify.breakpoint.smAndDown">
                    <CharacterSelect
                    :invalid="!player.character ? true : false"
                    :currentCharacter ="player.character ? player.character : `Any`"
                    :index="i"
                    :selectionEnabled="true"
                    :anyEnabled="false"
                    @character-select="$emit('update-character', { character: $event, index: i+1 })"/>
                                    
                    <v-text-field
                    :label="`Player ${i + 1}`"
                    v-model="player.name"
                    maxLength="64"
                    counter="64"
                    clearable
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

            <div
            class="add">
                <v-text-field
                :class="youtubeUpload ? 'file clearable' : 'file'"
                label="File"
                :title="fileNameStr ? fileNameStr : 'No File'"
                readonly
                v-model="fileNameStr"
                prepend-icon="mdi-paperclip"
                hint="Optional"
                persistent-hint
                :clearable="youtubeUpload"
                :disabled="fileUpload"
                @click="youtubeUpload ? selectFiles() : undefined"
                @click:clear="youtubeUpload ? $emit('remove-file') : undefined" />

                <input
                v-show="false"
                ref="uploadFileBtn"
                type="file"
                accept=".tfhr"
                @change="$emit('add-file', $event.target.files[0])" />

                <v-text-field
                class="timestamp clearable mt-0"
                ref="timestamp"
                label="Timestamp"
                v-model="timestamp"
                prepend-icon="mdi-timer-outline"
                hint="##h##m##s"
                persistent-hint
                placeholder="(ex: 01h02m03s)"
                clearable
                :required="timestampRequired"
                :disabled="!hasVideo"
                :rules="timestampRequired ? rules.timestamp.req : rules.timestamp.noReq" />
            </div>
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
    name: 'EditPreview',
    components: {
        CharacterSelect,
        RemoveButton,
        DownButton,
        UpButton,
    },
    props: {
        index: Number,
        youtubeUpload: [Boolean, null],
        fileUpload: [Boolean, null],
        groupMode: Boolean,
        p1: Object,
        p2: Object,
        video: [Object, null],
        fileName: [String, null],
        fileDate: [String, null],
        firstMatch: Boolean,
        lastMatch: Boolean,
        resetData: Boolean,
        timestampRequired: Boolean,
        masterUrl: [String, null],
        hasVideo: Boolean,
    },
    data: () => {
        return {
            valid: false,
            url: null,
            timestamp: null,
            fileNameStr: null,
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
                timestamp: {
                    req: [
                        v => !!v || 'Required',
                        v => !v || v && (/^([0-9]{1,2}h)?([0-9]{1,3}m)?([0-9]{1,5}s)?$/).test(v) || 'Invalid format',
                    ],
                    noReq: [
                        v => !v || v && (/^([0-9]{1,2}h)?([0-9]{1,3}m)?([0-9]{1,5}s)?$/).test(v) || 'Invalid format',
                    ]
                },
                character: [
                    v => !!v || 'Required'
                ]
            },
        }
    },
    mounted: function () {
        this.fileNameStr = this.fileName

        if (this.video) {
            this.url = 'https://youtu.be/' + this.video.id
            this.timestamp = this.video.timestamp
        }

        if (this.masterUrl)
            this.url = this.masterUrl
    },
    watch: {
        'resetData': function() {
            this.reset()
        },
        'url': function(url) {  
            if (url && this.$regex.ytUrl.test(url) && this.$regex.ytIdLength.test(url)) {
                this.$emit('set-video-id', url.match(this.$regex.ytId)[1])
            } else if (!url) {
                this.$emit('delete-video')
            }
        },
        
        'timestamp': function(timestamp) {
            if (timestamp && timestamp.match(this.$regex.strTimestamp)) {
                    if (!this.video?.timestamp || timestamp !== this.video.timestamp) {
                        this.$emit('set-timestamp', timestamp)
                    }
            } else if (!timestamp) {
                this.$emit('delete-timestamp')
            }
        },

        'fileName': function(name) {
            this.fileNameStr = name
        },

        'masterUrl': function(url) {
            this.url = url

            if (!url && this.timestamp) this.timestamp = null
        },

        'video.timestamp': function(time) {
            if (time !== this.timestamp) {
                this.timestamp = time
            }
        }
    },
    methods: {
        /* makes visible upload button act like html file upload button */
        selectFiles() {
            this.isSelecting = true
            window.addEventListener('focus', () => {
                this.isSelecting = false
            }, { once: true })
            this.$refs.uploadFileBtn.click()
        },
        reset() {
            this.url = this.video?.url
            this.timestamp = this.video?.timestamp
        },
    }
}
</script>

<style scoped>
.wide .p1 >>> .v-input__append-inner {
    padding-left: 0px;
    padding-right: 4px;
}

::v-deep .add >>> .v-text-field__slot {
    overflow: visible !important;
}

</style>