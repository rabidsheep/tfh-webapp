<template>
    <v-form
    id="youtube-form"
    class="form"
    ref="form"
    v-model="valid">
        <v-layout
        column
        class="youtube__wrapper"
        align-center
        justify-center>
            <v-layout
            class="youtube__body"
            align-center
            justify-center>
                <v-text-field
                class="url"
                v-model="url"
                :rules="rules.url"
                label="YouTube Link"
                prepend-icon="mdi-youtube"
                required
                />
            </v-layout>

            <v-layout
            class="buttons"
            justify-center
            align-center>
                <v-btn
                rounded
                :ripple="false"
                color = "primary"
                :disabled="!valid || matches.length <= 0"
                @click="submitMatches()">
                    Submit
                </v-btn>
            </v-layout>
        </v-layout>
    </v-form>
</template>

<script>
import CharacterSelect from './CharacterSelect.vue';

export default {
    components: { CharacterSelect },
    name: 'YoutubeUpload',
    props: {
        matches: Array,
        errors: Array,
    },
    data: () => {
        return {
            valid: false,
            url: null,
            rules: {
                url: [ v => !!v || 'https://www.youtube.com/watch?v=*******' ]
            }
        }
    },
    methods: {
        submitMatches() {
            this.$emit('yt-upload')
        }
    },
}
</script>
