<template>
    <v-row
    class="preview">
        <v-col
        class="header"
        :cols="12">
            <div
            class="leader">
                <button
                aria-label="Remove Match"
                :ripple="false"
                class="remove"
                @click.prevent="$emit('remove')">
                    <RemoveButton />
                </button>
                
                <div class="matchinfo">
                    <b>Match #{{ index + 1 }}</b>
                </div>
            </div>

            <v-divider />
        </v-col>

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
            :class="!lastMatch ? `move down` : `move up disabled`"
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
                :key="i"
                :class="`player p${i+1}`"
                :cols="$vuetify.breakpoint.smAndDown ? 12 : undefined">
                    <CharacterSelect
                    :currentCharacter="player.character ? player.character : `Any`"
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
                    v-show="false"
                    v-model="player.character"
                    :items="$characters"
                    :return-object="false"
                    item-text="name"
                    item-value="name"
                    required
                    :rules="rules.character" />
                </v-col>
                
                <v-col
                v-show="!$vuetify.breakpoint.smAndDown"
                class="vs"
                cols="1"
                align-center
                justify-center>
                    vs.
                </v-col>
            </v-col>

            <v-col
            class="add"
            :cols="$vuetify.breakpoint.smOnly ? 3 : undefined">
                <v-col
                class="timestamp"
                cols="12">
                    <v-text-field
                    ref="timestamp"
                    label="Timestamp"
                    v-model="timestamp"
                    prepend-icon="mdi-timer-outline"
                    :hint="timestampRequired ? `Required` : `Optional`"
                    persistent-hint
                    single-line
                    clearable
                    :dense="!$vuetify.breakpoint.smOnly"
                    :rules="timestampRequired ? rules.timestamp.req : rules.timestamp.noReq"
                    :required="timestampRequired" />
                </v-col>
                
                <v-col
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
                    @change="$emit('add-file', $event.target.files[0])"
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
        index: Number,
        currentTimestamp: [String, null],
        timestampRequired: Boolean,
        lastMatch: Boolean,
        firstMatch: Boolean,
        fileName: [String, null]
    },
    data: () => {
        return {
            hidden: true,
            valid: false,
            file: null,
            isSelecting: false,
            timestamp: null,
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
    mounted() {
        this.timestamp = this.currentTimestamp
    },
    watch: {
        'timestamp': function(timestamp) {
            if (timestamp && this.$refs.timestamp.validate() && timestamp !== this.currentTimestamp) {
                this.$emit('set-timestamp', timestamp)
            } else if (!timestamp) {
                this.$emit('delete-timestamp')
            }
        }
    },
}
</script>

<style scoped>
.wide .p1 >>> .v-input__append-inner {
    padding-left: 0px;
    padding-right: 4px;
}
</style>