<template>
    <v-row
    class="preview">
        <v-col
        cols="12"
        class="header">
            <div
            class="leader mr-3">
                <button
                aria-label="Remove Match"
                :ripple="false"
                class="remove"
                @click.prevent="$emit('remove')">
                    <RemoveButton />
                </button>
                
                <div class="matchinfo">
                    <b>{{ 'Match #' + (index+1) }}</b>
                    
                    <template v-if="fileDate && fileUpload">
                        <br />
                        File Date: {{ fileDate }}
                    </template>
                </div>
            </div>
            
            <v-divider />
            <!--<v-divider :vertical="$vuetify.breakpoint.smAndDown && fileUpload" />

            <v-col
            v-if="fileUpload"
            class="name ml-3">
                <v-text-field
                readonly
                class="filename"
                v-model="fileName"
                prepend-icon="mdi-file"
                dense
                label="File"
                outlined
                hide-details />
            </v-col>-->

            
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
            :cols="$vuetify.breakpoint.smAndDown ? ($vuetify.breakpoint.xsOnly ? 12 : undefined) : 8">
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
                    @character-select="$emit('update-character', { character: $event, index: i})"/>
                                    
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
                <!--<v-text-field
                v-if="fileUpload"
                readonly
                ref="url"
                label="YouTube Link"
                placeholder="YouTube Link"
                persistent-placeholder
                v-model="url"
                prepend-icon="mdi-youtube"
                hint="Optional"
                persistent-hint
                :dense="!$vuetify.breakpoint.smOnly"
                :rules="rules.url.noReq" />-->

                <v-text-field
                v-if="fileUpload"
                class="file"
                :title="fileName"
                label="File"
                disabled
                readonly
                v-model="fileName"
                prepend-icon="mdi-paperclip"
                hint="Optional"
                persistent-hint
                clearable />
                
                <v-text-field
                v-else
                class="file"
                label="File"
                :title="fileNameStr ? fileNameStr : 'No File'"
                readonly
                v-model="fileNameStr"
                prepend-icon="mdi-paperclip"
                hint="Optional"
                persistent-hint
                clearable
                @click="selectFiles()"
                @click:clear="$emit('remove-file')" />

                <input
                v-show="false"
                ref="uploadFileBtn"
                type="file"
                accept=".tfhr"
                @change="$emit('add-file', $event.target.files[0])" />

                <v-text-field
                class="timestamp"
                ref="timestamp"
                label="Timestamp"
                v-model="timestamp"
                prepend-icon="mdi-timer-outline"
                hint="##h##m##s"
                persistent-hint
                placeholder="(ex: 01h02m03s)"
                persistent-placeholder
                clearable
                :required="timestampRequired"
                :disabled="fileUpload && !this.masterUrl ? true : undefined"
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
        masterUrl: [String, null]
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
        if (this.video) {
            this.url = 'https://youtu.be/' + this.video.id
            this.timestamp = this.video.timestamp
        }

        if (this.masterUrl) {
            this.url = this.masterUrl
        }
    },
    watch: {
        'resetData': function() {
            this.reset()
        },
        'url': function(v) {  
            if (v && this.$regex.ytUrl.test(v) && this.$regex.ytIdLength.test(v)) {
                this.$emit('set-video-id', v.match(this.$regex.ytId))
            } else if (!v) {
                this.$emit('remove-video')
            }
        },
        
        'timestamp': function(v) {
            if (v && v.match(this.$regex.strTimestamp)) {
                    if (this.timestamp !== this.video.timestamp) {
                        this.$emit('set-timestamp', this.timestamp.match(this.$regex.strTimestamp)[0])
                    }
            } else if (!v) {
                this.$emit('delete-timestamp')
            }
        },

        'fileName': function(name) {
            this.fileNameStr = name
        },

        'masterUrl': function(url) {
            this.url = url
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
       updateCharacter(character, i) {
            this.$set(this.updated.players[i], 'character', character)
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