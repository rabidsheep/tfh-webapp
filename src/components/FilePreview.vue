<template>
    <v-row class="preview">
        <v-col
        cols="12"
        class="header">
            <v-btn
            :ripple="false"
            class="remove"
            fab
            height="24px"
            width="24px"
            @click="$emit('remove')"
            color="accent">
                <v-icon size="15px">
                    mdi-close-thick
                </v-icon>
            </v-btn>
            
            <h4>
                {{ index + 1 }}. {{ file.name }}
            </h4>
        </v-col>

        <div style="width:100%;"><br /></div>

        <v-col
        class="file-info"
        :cols="$vuetify.breakpoint.smAndDown ? 12 : 8">
            <v-col
            :cols="$vuetify.breakpoint.smAndDown ? 12 : undefined"
            :class="`player p${i+1}`"
            v-for="(player, i) in players"
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
                :dense="$vuetify.breakpoint.mdAndUp"
                v-model="url"
                @blur="url = tempUrl"
                clearable
                :rules="rules.url"
                label="YouTube Link (Optional)"
                prepend-icon="mdi-youtube" />
            </v-row>

            
            <v-row
            class="timestamp">
                <v-text-field
                v-model="timestamp"
                :dense="$vuetify.breakpoint.mdAndUp"
                @blur="timestamp = ( timestamp && timestamp.match(/((?:[0-9]{1,2})h)?((?:[0-9]{1,3})m)?((?:[0-9]{1,5})s)?/g)
                        ? timestamp.match(/((?:[0-9]{1,2})h)?((?:[0-9]{1,3})m)?((?:[0-9]{1,5})s)?/g)[0]
                        : null )"
                :rules="rules.timestamp"
                :disabled="!url || !$refs.url.valid"
                ref="timestamp"
                clearable
                prepend-icon="mdi-timer-outline"
                label="Timestamp"/>
            </v-row>
        </v-col>

        
    </v-row>
</template>

<script>
import CharacterSelect from './CharacterSelect.vue'

export default {
    components: {
        CharacterSelect,
    },
    name: 'FilePreview',
    props: {
        file: {
            name: String,
        },
        video: [Object, null],
        players: Array,
        version: Number,
        index: Number,
        progress: Number,
        uploading: Boolean,
        currentTimestamp: [String, null],
    },
    data: () => {
        return {
            hidden: true,
            valid: false,
            url: null,
            tempUrl: null,
            timestamp: null,
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
    // test url: https://www.youtube.com/watch?v=uciAaVk3xaE
    watch: {
        'url': function(v) {
            
            if (v && this.$regex.ytUrl.test(v) && this.$regex.ytIdLength.test(v)) {
                this.tempUrl = v.match(this.$regex.ytUrl)[0]

                if (this.tempUrl && !this.video || this.tempUrl !== this.video.url) {
                    this.$emit('set-url', this.tempUrl)
                }
                
                if (this.$regex.urlTimestamp.test(v) && v.match(this.$regex.urlTimestamp)[1] !== this.timestamp) {
                    this.timestamp = v.match(this.$regex.urlTimestamp)[1]
                }
            } else {
                this.tempUrl = null
                this.timestamp = null
                this.$emit('delete-video')
            }
        },
        
        'timestamp': function(v) {
            if (v && v.match(this.$regex.strTimestamp)) {
                    if (this.timestamp !== this.currentTimestamp) {
                        this.$emit('set-timestamp', this.timestamp.match(this.$regex.strTimestamp)[0])
                    }
            } else {
                //this.$delete(this.updated.video, 'timestamp')
                this.$emit('delete-timestamp')
            }
        },
    },
    methods: {
        remove: function() {
            this.$emit('remove-file', this.index)
        },
    }
}
</script>

<style scoped>
.upload .player >>> .v-input__slot::before {
    width: calc(100% - 1px);
}

.upload__data {
    flex-wrap: nowrap;
}

.wide .upload__match {
    flex-wrap: nowrap;
}

.wide .p1 >>> .v-input__append-inner {
    padding-left: 0px;
    padding-right: 4px;
}
</style>