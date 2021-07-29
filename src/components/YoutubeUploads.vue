<template>
    <v-form>
        wip
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
        }
    },
    methods: {

    },
}
</script>
