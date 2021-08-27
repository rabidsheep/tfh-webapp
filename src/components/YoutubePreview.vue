<template>
    <v-row
    class="preview">
        <v-col
        class="header pb-4"
        :cols="12">
            <button
            class="remove mr-3"
            @click.prevent="$emit('remove')">
                <RemoveButton />
            </button>


            <v-divider />

            <v-col
            justify="center"
            class="counter mx-4">
                <h4>Match #{{ index + 1 }}</h4>
            </v-col>

            <v-divider />
                
                <button
                :disabled="firstMatch"
                :class="!firstMatch ? `move up ml-3` : `move up ml-3 disabled`"
                @click.prevent="$emit('move-up')">
                    <UpButton />
                </button>

                <button
                :disabled="lastMatch"
                :class="!lastMatch ? `move down ml-3` : `move up ml-3 disabled`"
                @click.prevent="$emit('move-down')">
                    <DownButton />
                </button>

            <!--
                <button
                class="icon-btn roundbtn move-up sm button3 mdi-arrow-up-bold mr-2 ml-3"
                @click.prevent="$emit('move-up')" />

                <button
                class="icon-btn roundbtn sm move-down button3 mdi-arrow-down-bold"
                @click.prevent="$emit('move-down')" />
                --->
        </v-col>

        <v-col
        class="preview__data"
        cols="12">
            <v-col
            class="players"
            :cols="$vuetify.breakpoint.smAndDown ? ($vuetify.breakpoint.xsOnly ? 12 : undefined) : 8">
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
                    @character-select="$emit('update-character', { character: $event, index: i })" />
                                    
                    <v-text-field
                    v-model="player.name"
                    :rules="rules.name"
                    :label="`Player ${i + 1}`"
                    :reverse="i === 0 && !$vuetify.breakpoint.smAndDown"
                    maxLength="64"
                    counter="64"
                    required />

                    <v-select
                    v-model="player.character"
                    :items="$characters"
                    :rules="rules.character"
                    item-text="name"
                    item-value="name"
                    :return-object="false"
                    style="display:none"
                    required />
                </v-col>
                
                <v-col
                v-if="!$vuetify.breakpoint.smAndDown"
                cols="1"
                align-center
                justify-center
                class="vs">
                    vs.
                </v-col>
            </v-col>

        <v-col
        class="timestamp-file"
        :cols="$vuetify.breakpoint.smAndDown ? ($vuetify.breakpoint.xsOnly ? undefined : 3) : undefined">
            <v-col
            class="timestamp"
            :cols="$vuetify.breakpoint.xsOnly ? undefined : 12">
                <v-text-field
                prepend-icon="mdi-timer-outline"
                v-model="video.timestamp"
                :dense="!$vuetify.breakpoint.smOnly"
                hide-details
                :rules="!timestampRequired ? rules.timestamp.req : rules.timestamp.noReq"
                label="Timestamp"
                :required="timestampRequired" />
            </v-col>
            
            <v-col
            class="file"
            :cols="$vuetify.breakpoint.xsOnly ? undefined : 12">
                <v-text-field
                v-model="file"
                prepend-icon="mdi-paperclip"
                :dense="!$vuetify.breakpoint.smOnly"
                hide-details
                label="File"
                @click="selectFiles()"
                @click:clear="$emit('remove-file', file)"
                clearable />

                <input
                style="display: none;"
                ref="uploadFilesBtn"
                type="file"
                accept=".tfhr"
                @change="$emit('add-file', $event.target.files[0])"
                required />
            </v-col>
        </v-col>
        </v-col>
    </v-row>
</template>

<script>
import CharacterSelect from './CharacterSelect.vue'
import RemoveButton from '.././assets/img/remove'
import DownButton from '.././assets/img/down'
import UpButton from '.././assets/img/up'

export default {
    components: {
        CharacterSelect,
        RemoveButton,
        DownButton,
        UpButton
    },
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
        lastMatch: Boolean,
        firstMatch: Boolean,
        fileName: [String, null]
    },
    watch: {

    },
    data: () => {
        return {
            hidden: true,
            valid: false,
            file: null,
            isSelecting: false,
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
                character: [
                    v => !!v || 'Required'
                ]
            }
        }
    },
    watch: {
        'fileName': function(name) {
            this.file = name
        }
    },
    methods: {
        /* makes visible upload button act like html file upload button */
        selectFiles() {
            this.isSelecting = true

            window.addEventListener('focus', () => {
                this.isSelecting = false
            }, { once: true })

            this.$refs.uploadFilesBtn.click()
        },
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