<template>
    <v-form v-model="valid">
        <v-container id="upload-form">
            
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
            @change="retrieveFileData" />
            </v-layout> 

            <v-layout v-for="i in [0, 1]" :key=i>
                <div
                class="character-select"
                :style="!$vuetify.breakpoint.xsOnly ? `padding-right: 20px;` : `padding-right: 20px;` ">
                    <CharacterSelect
                    :index = "i"
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

                <!-- should we allow users to add comments to their uploads? -->

                <center>
                    <v-btn @click="create">Upload</v-btn>
                </center>
        </v-container>
    </v-form>
</template>

<script>

function initialState () {
    return {
        valid: false,
        players: [null, null],
        nameRules: [
            v => !!v || 'Required'
        ],
        charRules: [
            v => !!v || 'Required'
        ],
        selectedCharacters: [null, null],
        fileName: null,
        fileData: null,
        fileUrl: null,
        isSelecting: false,
        uploadValue: 0,
    }
}
import CharacterSelect from '../components/CharacterSelect.vue';
import firebase from 'firebase';

export default {
    components: { CharacterSelect },
    name: 'UploadForm',
    data: function(){
       return initialState();
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
            this.selectedCharacters[index] = JSON.parse(JSON.stringify(character));
            console.log(this.selectedCharacters); 
        },
        /* first uploads file to storage and retrieves download url,
        then posts file info to Realtime Database */
        create() {
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
                    console.log(this.fileUrl);

                    const post = {
                        url: this.fileUrl,
                        name: this.fileName
                    }

                    firebase.database().ref('Matches').push(post)
                    .then((response) => {
                        console.log(response)
                    })
                    .catch(err => {
                        console.log(err)
                    })

                    // clear data
                    Object.assign(this.$data, initialState());
                })
            })

        },
        retrieveFileData(event) {
            this.fileData = event.target.files[0];
            this.fileName = event.target.files[0].name;
            /* default filename regex:
            [0-9]{4}\-[0-9]{2}\-[0-9]{2}\_[0-9]{2}\-[0-9]{2}\-[0-9]{2}\_[A-Za-z]{3,8}\_vs\_[A-Za-z]{3,8}\.tfhr
            [0-9]{4}\-[0-9]{2}\-[0-9]{2}\_[0-9]{2}\-[0-9]{2}\-[0-9]{2} = ####-##-##_##-##-##
            [A-Za-z]{3,8}\_vs\_[A-Za-z]{3,8} = [character]_vs_[character]*/
            
            /*if file contains substring [character]_vs_[character]...*/
            if (this.fileName.match('[A-Za-z]{3,8}\\_vs\\_[A-Za-z]{3,8}')) {
                /* check that characters listed exist */
                if ((this.$characters).find(x => x.name == this.fileName.match(/[A-Za-z]{3,8}/g)[0])
                && (this.$characters).find(x => x.name == this.fileName.match(/[A-Za-z]{3,8}/g)[1])) {
                    this.selectedCharacters = [
                        (this.$characters).find(x => x.name == this.fileName.match(/[A-Za-z]{3,8}/g)[0]),
                        (this.$characters).find(x => x.name == this.fileName.match(/[A-Za-z]{3,8}/g)[1])
                        ]
                    console.log(JSON.parse(JSON.stringify(this.selectedCharacters)));
                }
            }
        }
    }
}
</script>

<style scoped>
    .file-name {
        margin-left: 15px;
        font-size: 20px;
    }

</style>