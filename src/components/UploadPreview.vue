<template>
    <v-layout justify-center row class="preview">
        <v-layout
        class="preview__name"
        align-center
        row>
            <v-btn
            :ripple="false"
            class="remove"
            fab
            height="25px"
            width="25px"
            
            @click="remove()"
            color="primary">
                <v-icon size="15px">
                    mdi-close-thick
                </v-icon>
            </v-btn>
            <h4>
                {{ index + 1 }}. {{ fileName }}
            </h4>
        </v-layout>

        <v-layout
        class="preview__data"
        row>
            <v-layout
            class="preview__match"
            :column="$vuetify.breakpoint.xsOnly"
            :row="!$vuetify.breakpoint.xsOnly">
                    <v-layout
                    :class="`player p${i+1}`"
                    v-for="(player, i) in players"
                    :key="i"
                    :reverse="i === 0 && !$vuetify.breakpoint.xsOnly">
                        <CharacterSelect
                        :currentCharacter ="player.character"
                        :index = "i"
                        :selectionEnabled="false"
                        @character-select="selectCharacter($event, i)"/>
                                        
                        <v-text-field
                        v-model="player.name"
                        :rules="rules.names"
                        :label="`Player ${i + 1}`"
                        :reverse="i === 0 && !$vuetify.breakpoint.xsOnly"
                        required
                        />
                    </v-layout>

                    <div
                    class="vs"
                    v-if="!$vuetify.breakpoint.xsOnly">
                        vs.
                    </div>
            </v-layout>
        </v-layout>
    </v-layout>
</template>

<script>
import CharacterSelect from './CharacterSelect.vue';


export default {
    components: { CharacterSelect },
    name: 'UploadPreview',
    props: {
        fileName: String,
        players: Array,
        version: Number,
        index: Number,
        progress: Number,
        uploading: Boolean,
    },
    data: () => ({
        hidden: true,
        valid: false,
        rules: {
            names: [ v => !!v || 'Required' ],
            characters: [ v => v.name != 'Any Character' && v.name != null ]
        },
    }),
    methods: {
        remove: function() {
            this.$emit('remove-file', this.index)
        }
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