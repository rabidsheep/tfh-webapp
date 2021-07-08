<template>
    <v-container id="upload-form">
        <v-overlay v-if="loading">
            <v-container fluid fill-height>
                <v-layout justify-center align-center>
                    <v-progress-circular indeterminate/>
                </v-layout>
            </v-container>
        </v-overlay>

        <v-overlay v-if="error">
            <v-container fluid fill-height>
            <v-layout justify-center align-center>
                <v-card width="50%">
                    <v-card-title>Upload Failed</v-card-title>
                    <v-card-subtitle>Error: {{ this.errorMsg }}</v-card-subtitle>
                    <v-card-text>Your file could not be submitted.
                        If you believe this to be a problem on the application's end,
                        please contact us at [devContact].
                    </v-card-text>
                    <v-card-actions>
                        <v-btn
                        @click="error=false"
                        color="primary"
                        style="margin: auto">OK</v-btn>
                    </v-card-actions>
                </v-card>
            </v-layout>
            </v-container>
        </v-overlay>

        <v-form 
        ref="form"
        v-model="valid">
                <v-layout align-center style="margin-bottom: 20px;">
                <v-btn
                @click="onButtonClick">
                Upload File
                </v-btn>

                <label class="file-name">{{ fileName ? fileName : 'No file chosen' }}</label>

                <input
                style="display: none;"
                ref="uploadBtn"
                type="file"
                id="match-upload"
                accept=".tfhr"
                @change="readFileData"
                required />
                </v-layout> 

                <v-layout v-for="i in [0, 1]" :key=i>
                    <div
                    class="character-select"
                    :style="!$vuetify.breakpoint.xsOnly ? `padding-right: 20px;` : `padding-right: 20px;` ">
                        <CharacterSelect
                        :selectedChar="playerInfo[i].character"
                        :index = "i"
                        :selectionEnabled="false"
                        @character-select="selectCharacter($event, i)"/>

                        <v-select
                        style="display: none;"
                        v-model="playerInfo[i].character"
                        :rules="rules.characters"
                        :items="$characters"
                        :item-text="'name'"
                        ref="characterSelect"
                        required
                        />

                    </div>
                    
                    <div style="width: 100%;">
                        <v-text-field
                        v-model="playerInfo[i].name"
                        :rules="rules.names"
                        :label="`Player ${i + 1}`"
                        required
                        />
                    </div>
                </v-layout>

                    <v-text-field
                    v-model="ytUrl"
                    label="YouTube Link (Optional)"
                    />

                    <v-text-field
                    v-model="version"
                    label="Version Number"
                    disabled
                    />

                    <!-- should we allow users to add comments to their uploads? -->

                    <center>
                        <v-btn :disabled="!valid" @click="create">Upload</v-btn>
                    </center>
        </v-form>
    </v-container>
</template>

<script>
import CharacterSelect from '../components/CharacterSelect.vue';
import firebase from 'firebase';

export default {
    components: { CharacterSelect },
    name: 'UploadForm',
    data: function(){
       return {
            valid: false,
            playerInfo: [
                {name: '', character: {name: 'Any Character', devName: '', id: 0}},
                {name: '', character: {name: 'Any Character', devName: '', id: 0}}
            ],
            ytUrl: null,
            version: null,
            rules: {
                names: [ v => !!v || 'Required' ],
                characters: [ v => v.name != 'Any Character' && v.name != null ]
            },
            fileName: null,
            fileData: null,
            fileUrl: null,
            isSelecting: false,
            loading: false,
            error: false,
            errorMsg: '',
            uploadValue: 0
       }
    },
    methods: {
        onButtonClick() {
            this.isSelecting = true
            window.addEventListener('focus', () => {
                this.isSelecting = false
            }, { once: true })

            this.$refs.uploadBtn.click()
            },
        selectCharacter: function (character, index) {
            this.$set(this.playerInfo[index], 'character', JSON.parse(JSON.stringify(character)));
        },
        /* first uploads file to storage and retrieves download url,
        then posts file info to Firestore Database */
        create() {
            this.loading = true;

            const storageRef = firebase.storage().ref(`${this.fileData.name}`).put(this.fileData);
            storageRef.on(`state_changed`,
                snapshot => {
                    this.uploadValue = (snapshot.bytesTransferred/snapshot.totalBytes) * 100;
                },
                error => {
                    console.log(error.message)
                },
                () => {
                    this.uploadValue = 100;
                    storageRef.snapshot.ref.getDownloadURL().then((url) => {
                    this.fileUrl = url;

                    var data = {
                        fileUrl: this.fileUrl,
                        fileName: this.fileName,
                        p1: this.playerInfo[0].name,
                        p1Chara: this.playerInfo[0].character,
                        p2: this.playerInfo[1].name,
                        p2Chara: this.playerInfo[1].character,
                        players: this.playerInfo,
                        version: this.version,
                        timestamp: new Date(),
                        ytUrl: this.ytUrl,
                    }

                    
                    this.$matches.save(data);

                    this.loading = false;
                    this.$refs.form.reset();
                    this.fileName = null;
                    /*var db = firebase.firestore();

                    db.collection("matches").add({
                        data
                    })
                    .then((docRef) => {
                        console.log("Doc written with ID: ", docRef.id);
                    })
                    .catch((error) => {
                        console.error("Error adding doc: ", error);
                        this.errorMsg = error;
                        return this.error = true;
                    })*/

                })
            })

        },
        readFileData(event) {
            this.fileData = event.target.files[0]
            this.fileName = this.fileData.name;
            var reader = new FileReader();

            reader.onload = (e) => {
                var result = e.target.result;
                /* p1 - offset 8-72
                p2 - offset 73-137
                characters - 199-213 (max)*/
                /* [A-Za-z0-9\\x00-\\x7F$&+,:;=?@#|'<>.^*()%!`~{}/\\[\]_ -] */
                this.version = (result).charCodeAt(146);
                var playerNames = (result).substring(8, 137)
                                        .replace(/\0{1,65}/g, '\n')
                                        .split('\n', 2);
                var characterNames = (result).substring(198,213)
                                            .match(/\b(Paca|Velvet|Tianhuo|Shanty|Pom|Uni|Cow)/g);
                this.retrievePlayerInfo(playerNames, characterNames);
            }
            
            reader.readAsText(event.target.files[0], "UTF-8");
        },
        retrievePlayerInfo(playerNames, characterNames) {
            for (const i in playerNames) {
                this.$set(this.playerInfo[i], 'name', playerNames[i]);
            }

            for (const i in characterNames) {
                var character = (this.$characters).find(c => c.devName == characterNames[i]);
                this.$set(this.playerInfo[i], 'character', character);
            }

            console.log(JSON.parse(JSON.stringify(this.playerInfo)));
        },
            /* default filename regex:
            [0-9]{4}\-[0-9]{2}\-[0-9]{2}\_[0-9]{2}\-[0-9]{2}\-[0-9]{2}\_[A-Za-z]{3,8}\_vs\_[A-Za-z]{3,8}\.tfhr
            [0-9]{4}\-[0-9]{2}\-[0-9]{2}\_[0-9]{2}\-[0-9]{2}\-[0-9]{2} = ####-##-##_##-##-##
            [A-Za-z]{3,8}\_vs\_[A-Za-z]{3,8} = [character]_vs_[character]*/
            
            /*if file contains substring [character]_vs_[character]...*/
            /*if (this.fileName.match('[A-Za-z]{3,8}\\_vs\\_[A-Za-z]{3,8}')) {*/
                /* check that characters listed exist */
                /*if ((this.$characters).find(x => x.name == this.fileName.match(/[A-Za-z]{3,8}/g)[0])
                && (this.$characters).find(x => x.name == this.fileName.match(/[A-Za-z]{3,8}/g)[1])) {
                    this.selectedCharacters = [
                        (this.$characters).find(x => x.name == this.fileName.match(/[A-Za-z]{3,8}/g)[0]),
                        (this.$characters).find(x => x.name == this.fileName.match(/[A-Za-z]{3,8}/g)[1])
                        ]
                    console.log(JSON.parse(JSON.stringify(this.selectedCharacters)));
                }*/
        }
    }
</script>

<style scoped>
    .file-name {
        margin-left: 15px;
        font-size: 20px;
    }

</style>