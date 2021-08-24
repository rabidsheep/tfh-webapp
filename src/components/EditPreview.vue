<template>
    <v-row
    class="preview">
        <v-col
        class="file-info align-center"
        :cols="$vuetify.breakpoint.smAndDown ? 12 : 8">
            <v-col
            :cols="$vuetify.breakpoint.smAndDown ? 12 : undefined"
            :class="`player p${i+1}`"
            v-for="(player, i) in [p1, p2]"
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
            <v-col
            :cols="12"
            v-if="type === 'Casual' || type === 'Tournament' && file"
            class="link">
                <v-text-field
                ref="url"
                v-model="url"
                @blur="url = tempUrl"
                :dense="$vuetify.breakpoint.mdAndUp"
                :clearable="!file ? false : true"
                :rules="!file ? rules.url.req : rules.url.noReq"
                :required="!file ? true : false"
                :label="file ? `YouTube Link (Optional)` : `YouTube Link (Required)`"
                prepend-icon="mdi-youtube" />
            </v-col>

            <v-col
            :cols="12"
            class="timestamp">
                <v-text-field
                v-model="timestamp"
                :dense="$vuetify.breakpoint.mdAndUp && (type === 'Casual' ||  type === 'Tournament' && file)"
                :rules="rules.timestamp"
                :disabled="!video"
                ref="timestamp"
                clearable
                prepend-icon="mdi-timer-outline"
                label="Timestamp"/>
            </v-col>
        </v-col>

        
    </v-row>
</template>

<script>
import CharacterSelect from './CharacterSelect.vue'


export default {
    name: 'EditPreview',
    components: {
        CharacterSelect,
    },
    props: {
        p1: Object,
        p2: Object,
        video: [Object, null],
        file: [Object, null],
        tournament: [Object, null],
        type: String,
        resetData: Boolean,
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
            },
        }
    },
    mounted: function () {
        this.url = this.video?.url
        this.timestamp = this.video?.timestamp
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
.upload .player >>> .v-input__slot::before {
    width: calc(100% - 1px);
}

.wide .p1 >>> .v-input__append-inner {
    padding-left: 0px;
    padding-right: 4px;
}
</style>