<template>
    <v-row class="preview">
        <v-col
        class="players"
        :cols="!$vuetify.breakpoint.xsOnly ? 10 : 8">
            <v-row
            align-self="center">
                <v-layout
                :class="`player p${i+1}`"
                v-for="(player, i) in players"
                :key="i"
                :reverse="i === 0 && !$vuetify.breakpoint.xsOnly">
                    <CharacterSelect
                    :currentCharacter ="player.character"
                    :index = "i"
                    :selectionEnabled="true"
                    :anyEnabled="false"
                    @character-select="$emit('update-character', { character: $event, pIndex: i })"/>
                                    
                    <v-text-field
                    v-model="player.name"
                    :label="`Player ${i + 1}`"
                    :reverse="i === 0 && !$vuetify.breakpoint.xsOnly"
                    required
                    />
                </v-layout>
                
                <v-layout
                align-center
                justify-center
                class="vs"
                v-if="!$vuetify.breakpoint.xsOnly">
                    vs.
                </v-layout>
            </v-row>
        </v-col>

        <v-col
        class="timestamp"
        >
            <v-text-field
            v-model="video.timestamp"
            label="Timestamp" />
        </v-col>
    </v-row>
</template>

<script>
import CharacterSelect from './CharacterSelect.vue'
// youtube test video url: https://www.youtube.com/watch?v=uciAaVk3xaE

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
        }
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