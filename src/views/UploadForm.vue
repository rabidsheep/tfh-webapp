<template>
    <v-form v-model="valid">
        <v-container id="upload-form">
            
            <input type="file" id="match-upload">

            <v-layout v-for="i in [0, 1]" :key=i>
                <div
                class="character-select"
                :style="!$vuetify.breakpoint.xsOnly ? `padding-right: 20px;` : `padding-right: 20px;` ">
                    <CharacterSelect
                    :ripple = "false"
                    :selectedCharacters="selectedCharacters"
                    @character-select="selectCharacter($event, i)"/>

                </div>
                
                <div style="width: 100%;">
                    <v-text-field
                    v-model="players[i]"
                    :rules="nameRules"
                    :label="`Player ${i + 1}`"
                    required
                    />
                </div>
            </v-layout>

                <v-text-field
                label="YouTube Link (Optional)"
                />

                <v-text-field
                label="Version Number"
                disabled
                />

                <v-text-field
                label="Upload Date"
                disabled
                />

                <center><v-btn>Upload</v-btn></center>
        </v-container>
    </v-form>
</template>

<script>
import CharacterSelect from '../components/CharacterSelect.vue';

export default {
    components: { CharacterSelect },
    name: 'UploadForm',
    data: () => ({
        valid: false,
        players: [null, null],
        nameRules: [
            v => !!v || 'Required'
        ],
        charRules: [
            v => !!v || 'Required'
        ],
        selectedCharacters: [null, null]
    }),
    methods: {
        selectCharacter: function (character, index) {
            this.selectedCharacters[index] = JSON.parse(JSON.stringify(character));
            console.log(this.selectedCharacters); 
        },
    }
}
</script>