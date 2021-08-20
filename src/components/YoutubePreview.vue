<template>
    <v-row
    class="preview">
    <v-col
    :cols="$vuetify.breakpoint.xsOnly ? 2 : undefined"
    class="leader">
        <v-col
        justify="center"
        class="counter">
            {{ index + 1 }}
        </v-col>


        <v-col
        justify="center"
        class="remove">
            <v-btn
            :ripple="false"
            fab
            height="24px"
            width="24px"
            @click="$emit('remove')"
            color="accent">
                <v-icon size="15px">
                    mdi-close-thick
                </v-icon>
            </v-btn>
        </v-col>

        
        
    </v-col>

        <v-col
        class="players"
        :cols="$vuetify.breakpoint.smAndDown ? ($vuetify.breakpoint.xsOnly ? 12 : undefined) : 8">
            <v-row
            align-self="center">
                <v-col
                :cols="$vuetify.breakpoint.smAndDown ? ($vuetify.breakpoint.xsOnly ? 12 : 12) : undefined"
                :class="`player p${i+1}`"
                v-for="(player, i) in [p1, p2]"
                :key="i">
                    <CharacterSelect
                    :currentCharacter ="player.character"
                    :index="i"
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
                </v-col>
                
                <v-col
                v-if="!$vuetify.breakpoint.smAndDown"
                cols="1"
                align-center
                justify-center
                class="vs">
                    vs.
                </v-col>
            </v-row>
        </v-col>

        <v-col
        class="timestamp"
        :cols="$vuetify.breakpoint.smAndDown ? ($vuetify.breakpoint.xsOnly ? undefined : 3) : 3">
                <v-col class="field" :cols="$vuetify.breakpoint.smAndDown ? ($vuetify.breakpoint.xsOnly ? undefined : undefined) : undefined">
                <v-text-field
                v-model="video.timestamp"
                :dense="$vuetify.breakpoint.xsOnly"
                :rules="!timestampRequired ? rules.timestamp.req : rules.timestamp.noReq"
                label="Timestamp"
                :required="timestampRequired" />
                </v-col>
        </v-col>
    </v-row>
</template>

<script>
import CharacterSelect from './CharacterSelect.vue'

export default {
    components: { CharacterSelect },
    name: 'YoutubePreview',
    props: {
        p1: Object,
        p2: Object,
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
            hidden: true,
            valid: false,
            rules: {
                name: [
                    v => !!v || 'Required'
                ],
                timestamp: {
                    req: [
                        v => !!v || 'Required',
                        v => /^([0-9]{1,2}h)?([0-9]{1,3}m)?([0-9]{1,5}s)?$/.test(v) || 'Invalid format'
                    ],
                    noReq: [
                        v => !v || v && /^([0-9]{1,2}h)?([0-9]{1,3}m)?([0-9]{1,5}s)?$/.test(v) || 'Invalid format'
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