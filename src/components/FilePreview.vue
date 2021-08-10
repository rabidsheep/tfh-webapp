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
            color="primary">
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

        <v-col
        class="youtube"
        :cols="$vuetify.breakpoint.smAndDown ? 12 : 4 ">
            <v-row
            class="link">
                <v-text-field
                :dense="!$vuetify.breakpoint.smAndDown"
                v-model="userUrl"
                :error-messages="urlErrors"
                @input="$v.url.$touch()"
                @blur="$v.url.$touch()"
                label="YouTube Link (Optional)"
                prepend-icon="mdi-youtube" />
            </v-row>
            
            <br v-if="!$vuetify.breakpoint.smAndDown" />

            <v-row
            class="timestamp">
                <v-text-field
                :dense="!$vuetify.breakpoint.smAndDown"
                v-model="youtube.ts"
                :disabled="!userUrl"
                prepend-icon="mdi-timer-outline"
                label="Timestamp"/>
            </v-row>
        </v-col>
    </v-row>
</template>

<script>
import CharacterSelect from './CharacterSelect.vue'
import { url } from 'vuelidate/lib/validators'

export default {
    components: { CharacterSelect },
    name: 'FilePreview',
    props: {
        file: {
            name: String,
        },
        players: Array,
        version: Number,
        index: Number,
        progress: Number,
        uploading: Boolean,
    },
    data: () => {
        return {
        userUrl: null,
        timestamp: null,
        youtube: {},
        re: {
            yt: /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*)/,
            id: /(?<=\?v=)[^#\&\?]*/,
            ts: /(?<=t=)\d+m\d+s|\d+m|\d+s/,
        },
        hidden: true,
        valid: false,
        }
    },
    validations: {
        url: { url }
    },
    computed: {
        urlErrors() {
            const errors = []
            if (!this.$v.url.$dirty || !this.userUrl) return errors

            !this.$v.url.url && errors.push('Must be valid URL')

            var yt = {}

            if (this.re.yt.test(this.userUrl)) {
                yt['id'] = this.userUrl.match(this.re.id)
                
                if (this.re.ts.test(this.userUrl)) {
                    yt['ts'] = this.userUrl.match(this.re.ts)
                }
            } else {
                errors.push('Invalid URL format')
            }

            this.youtube = yt

            this.$emit('set-youtube', this.youtube)

            return errors
        }
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