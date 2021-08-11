<template>
    <v-row
    
    class="preview">

        <v-col
        justify="center"
        :cols="$vuetify.breakponSmAndDown ? 3 : undefined"
        class="remove__wrapper">
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
        </v-col>

        <v-col
        class="players"
        :cols="$vuetify.breakpoint.smAndDown ? 7 : 10">
            <v-row
            align-self="center">
                <v-layout
                :class="`player p${i+1}`"
                v-for="(player, i) in players"
                :key="i"
                :reverse="i === 0 && !$vuetify.breakpoint.smAndDown">
                    <CharacterSelect
                    :currentCharacter ="player.character"
                    :index = "i"
                    :selectionEnabled="true"
                    :anyEnabled="false"
                    @character-select="$emit('update-character', { character: $event, index: i })"/>
                                    
                    <v-text-field
                    v-model="player.name"
                    :rules="rules.name"
                    :label="`Player ${i + 1}`"
                    :reverse="i === 0 && !$vuetify.breakpoint.smAndDown"
                    maxLength="64"
                    counter="64"
                    required
                    />
                </v-layout>
                
                <v-layout
                align-center
                justify-center
                class="vs"
                v-if="!$vuetify.breakpoint.smAndDown">
                    vs.
                </v-layout>
            </v-row>
        </v-col>

        <v-col
        class="timestamp"
        :cols="$vuetify.breakpoint.smAndDown ? 3 : 2">
            <v-text-field
            v-model="video.timestamp"
            :rules="!timestampRequired ? rules.timestamp.req : rules.timestamp.noReq"
            label="Timestamp"
            :required="timestampRequired" />
        </v-col>
    </v-row>
</template>

<script>
import CharacterSelect from './CharacterSelect.vue'

export default {
    components: { CharacterSelect },
    name: 'YoutubePreview',
    props: {
        players: Array,
        version: Number,
        index: Number,
        progress: Number,
        uploading: Boolean,
        video: {
            timestamp: String,
            url: String,
        },
        timestampRequired: Boolean,
    },
    data: () => {
        return {
            re: {
                yt: /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*)/,
                id: /(?<=\?v=)[^#\&\?]*/,
                ts: /(?<=t=)\d+m\d+s|\d+m|\d+s/,
            },
            hidden: true,
            valid: false,
            rules: {
                name: [
                    v => !!v || 'Required'
                ],
                timestamp: {
                    req: [
                        v => !!v || 'Required',
                        v => /\d+h\d+m\d+s|\d+h|\d+m|\d+s/.test(v) || 'Invalid format'
                    ],
                    noReq: [
                        v => !v || /\d+h\d+m\d+s|\d+h|\d+m|\d+s/.test(v) || 'Invalid format'
                    ]
                },
            }
        }
    },
    methods: {
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