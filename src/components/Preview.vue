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
                    
                    <template v-if="file">
                        <br />
                        File Date: {{ fileDate }}
                    </template>
                </div>
            </div>
            
            <v-divider :vertical="$vuetify.breakpoint.smAndDown && uploadForm === 'files'" />

            <v-col
            v-if="uploadForm === 'files'"
            class="name ml-3"
            :cols="undefined">
                <v-text-field
                readonly
                class="filename"
                v-model="fileName"
                prepend-icon="mdi-file"
                dense
                label="File"
                outlined
                hide-details />
            </v-col>

            
        </v-col>

        <v-col
        v-show="type !== 'Casual' && $route.path !== '/edit'"
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
                v-if="uploadForm === 'files'"
                cols="12"
                class="link">
                    <v-text-field
                    :readonly="uploadForm === 'youtube' ? true : false"
                    ref="url"
                    label="YouTube Link"
                    v-model="url"
                    prepend-icon="mdi-youtube"
                    hint="Optional"
                    persistent-hint
                    single-line
                    @blur="url = tempUrl"
                    :dense="!$vuetify.breakpoint.smOnly"
                    :rules="rules.url.noReq" />
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
                    :required="timestampRequired"
                    :rules="rules.timestamp" />
                </v-col>

                <v-col
                v-if="uploadForm === 'youtube'"
                class="file"
                cols="12">
                    <v-file-input
                    label="File"
                    accept=".tfhr"
                    hint="Optional"
                    persistent-hint
                    single-line
                    clearable
                    :dense="!$vuetify.breakpoint.smOnly"
                    @change="$emit('add-file', $event)"
                    @click:clear="$emit('remove-file', file)" />
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
    name: 'EditPreview',
    components: {
        CharacterSelect,
        RemoveButton,
        DownButton,
        UpButton,
    },
    props: {
        p1: Object,
        p2: Object,
        index: Number,
        video: [Object, null],
        file: [Object, null],
        tournament: [Object, null],
        type: String,
        fileName: String,
        firstMatch: Boolean,
        lastMatch: Boolean,
        uploadForm: String,
        resetData: Boolean,
        fileDate: String,
        timestampRequired: Boolean,
    },
    data: () => {
        return {
            valid: false,
            tempUrl: null,
            url: null,
            timestamp: null,
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
    },
    watch: {
        'resetData': function() {
            this.reset()
        },
        'url': function(v) {  
            if (v && this.$regex.ytUrl.test(v) && this.$regex.ytIdLength.test(v)) {
                this.tempUrl = v.match(this.$regex.ytUrl)[0]

                if (this.tempUrl && !this.video || this.tempUrl !== this.video.url) {
                    this.$emit('set-url', this.tempUrl)
                }
                
                if (this.$regex.urlTimestamp.test(v) && v.match(this.$regex.urlTimestamp)[1] !== this.timestamp) {
                    this.$emit('set-timestamp', v.match(this.$regex.urlTimestamp)[1])
                }
            } else {
                this.tempUrl = null
                this.timestamp = null
                this.$emit('delete-video')
            }
        },
        
        'timestamp': function(v) {
            if (v && v.match(this.$regex.strTimestamp)) {
                    if (this.timestamp !== this.video.timestamp) {
                        this.$emit('set-timestamp', this.timestamp.match(this.$regex.strTimestamp)[0])
                    }
            } else {
                this.$emit('delete-timestamp')
            }
        },
    },
    methods: {
       updateCharacter(character, i) {
            this.$set(this.updated.players[i], 'character', character)
        },
        reset() {
            this.url = this.video?.url
            this.timestamp = this.video?.timestamp
        }
    }
}
</script>

<style scoped>
.wide .p1 >>> .v-input__append-inner {
    padding-left: 0px;
    padding-right: 4px;
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
</style>