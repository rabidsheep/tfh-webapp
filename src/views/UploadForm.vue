<template>
    <v-form v-model="valid">
        <v-container id="upload-form">
            
            <input type="file" id="match-upload">

            <v-layout v-for="i in [0, 1]" :key=i>
                <div
                class="character-select"
                :style="!$vuetify.breakpoint.xsOnly ? `padding-right: 20px;` : `padding-right: 20px;` ">
                    <v-menu
                    max-height="400px"
                    transition="slide-y-transition"
                    offset-y>
                        <!-- char select button -->
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn :ripple="false" class="char-select" v-bind="attrs" v-on="on" height="auto" icon>
                                <v-avatar v-if="!playerCharacters[i]" height="100%" tile>
                                    <img :src="require(`../assets/img/sel/random.png`)" />
                                </v-avatar>

                                <v-avatar v-if="playerCharacters[i]" height="100%" tile>
                                    <img :src="require(`../assets/${playerCharacters[i].imgUrl}`)" />
                                </v-avatar>
                            </v-btn>
                        </template>
                        <!-- /char select button -->
                        
                        <!-- char select list
                        add @click="selectCharacter(i, character) once hooked up to db-->
                        <v-list width="200px">
                            <v-list-item
                            v-for="(character, id) in $characters"
                            :key="id"
                            @click="selectCharacter(i, character)">
                                <v-avatar class="mb-2 mr-2" height="100%" tile>
                                    <img :src="require(`../assets/${character.imgUrl}`)">
                                </v-avatar>
                                {{ character.name }}
                            </v-list-item>
                        </v-list>
                        <!-- /char select list -->
                    </v-menu>
                </div>
                
                <div style="width: 100%;">
                    <v-text-field
                    v-model="p1Name"
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
export default {
    name: 'UploadForm',
    data: () => ({
        valid: false,
        p1Name: '',
        p2Name: '',
        nameRules: [
            v => !!v || 'Required'
        ],
        p1Char: '',
        p2Char: '',
        charRules: [
            v => !!v || 'Required'
        ],
        playerCharacters: [],

    }),
    methods: {
        selectCharacter: function (playerNum, character) {
            this.playerCharacters[playerNum] = character;
        }
    }
}
</script>