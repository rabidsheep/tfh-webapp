<template>
    <v-container id="uploads">
        <v-overlay v-show="uploading || showError || finished">
            <v-container fluid fill-height>
                <v-layout column justify-center align-center>
                    <template v-if="showError && !uploading">
                        <h1>Error</h1>

                        <div
                        v-for="(error, i) in errors"
                        :key="i">
                            <template>
                                {{ error.message}}

                                <ul v-if="error.files.length > 0">
                                    <li
                                    v-for="(file, j) in error.files"
                                    :key="j">
                                        {{ file }}
                                    </li>
                                </ul>
                            </template>
                        </div>

                        <v-btn
                        @click="clearErrors()"
                        color="primary">
                            OK
                        </v-btn>
                    </template>

                    <template v-if="uploading">
                        <h1>Uploading...</h1>

                        <v-progress-linear
                        v-model="progress"
                        height="20px"
                        :buffer-value="100" />

                        <p>
                            <span style="color:green;">{{ succeeded }}</span>
                             | 
                             <span style="color:red;">{{ failed }}</span>
                        </p>
                    </template>

                    <template v-if="finished">
                        <!--<v-icon>
                            <template v-if="succeeded > 0">
                                mdi-check-circle
                            </template>

                            <template v-else>
                                mdi-close-circle
                            </template>
                        </v-icon>-->

                        <h1>
                            Upload Finished
                        </h1>

                        <template v-if="succeeded > 0">
                            Uploaded {{ succeeded }} out of {{ matches.length }} match(es).
                        </template>
                        
                        <template v-if="failed > 0">
                            {{ failed }} match(es) failed to upload.
                        </template>

                        <v-btn
                        @click="clearForm()"
                        color="primary">
                            OK
                        </v-btn>
                    </template>
                </v-layout>
            </v-container>
        </v-overlay>

        <v-stepper v-model="step" flat>
            <v-stepper-items>
                <v-stepper-header>
                    <v-stepper-step step="1"
                    :complete="step > 1">
                        Sign In
                    </v-stepper-step>

                    <v-divider />

                    <v-stepper-step step="2"
                    :complete="step > 2">
                        Select Upload Type
                    </v-stepper-step>

                    <v-divider />

                    <v-stepper-step step="3"
                    :complete="step > 3">
                        Upload Matches
                    </v-stepper-step>
                </v-stepper-header>
                
                <!-- sign in -->
                <v-stepper-content step="1">
                    <v-layout
                    id="step__sign-in"
                    class="step"
                    column
                    justify-center
                    align-center>
                        <h1>Sign In</h1>

                        <v-progress-linear
                        indeterminate
                        v-show="$firebase.auth().currentUser"/>

                        <v-layout
                        class="body"
                        column
                        justify-center
                        align-center>
                            <v-btn
                            height="50"
                            rounded
                            v-show="!$firebase.auth().currentUser"
                            @click="signIn('google')">
                                <v-icon left>mdi-google</v-icon>
                                Google
                            </v-btn>
                        </v-layout>
                        <!--<v-btn height="50" v-show="!$firebase.auth().currentUser" @click="signIn('twitter')">
                            <v-icon left>mdi-twitter</v-icon> Twitter
                        </v-btn>-->
                    </v-layout>
                </v-stepper-content>

                <v-stepper-content step="2">
                    <v-layout
                    id="step__select"
                    class="step"
                    column
                    justify-center
                    align-center>
                        <h1>Select Upload Type</h1>

                        <v-layout
                        column
                        class="body"
                        justify-center
                        align-center>
                            <v-btn
                            rounded
                            @click="setUploadType('files')">
                                <v-icon left>mdi-file</v-icon>
                                TFHR File
                            </v-btn>

                            <v-btn
                            rounded
                            @click="setUploadType('youtube')">
                                <v-icon left>mdi-youtube</v-icon>
                                YouTube Link
                            </v-btn>
                        </v-layout>
                    </v-layout>
                </v-stepper-content>

                <!-- upload form -->
                <v-stepper-content step="3">
                    <v-layout
                    id="step__upload"
                    class="step"
                    column
                    justify-center
                    align-center>
                        <v-layout
                        column
                        align-center
                        justify-center
                        class="heading">
                            <v-btn
                            class="back"
                            x-small
                            fab
                            :ripple="false"
                            @click="goBack()">
                                <v-icon size="25px">mdi-arrow-left-thick</v-icon>
                            </v-btn>

                            <h1>Upload Matches</h1>
                        </v-layout>
                        
                        <FileUploads
                        v-if="uploadType === 'files'"
                        :matches="matches"
                        :files="files"
                        :errors="errorList"
                        :uploadLimit="uploadLimit"
                        :uploadType="'files'"
                        @remove="removeFile($event)"
                        @set-youtube="addYoutubeLink($event.yt, $event.index)"
                        @update="updateFiles($event.match, $event.file)"
                        @update-character="updateCharacter($event)"
                        @show-errors="showErrors($event)"
                        @files-upload="filesUpload()" />

                        <YoutubeUploads
                        v-else-if="uploadType === 'youtube'"
                        :uploadType="'youtube'"
                        :matches="matches"
                        :errors="errorList"
                        @update="updateMatches($event)"
                        @update-character="updateCharacter($event)"
                        @yt-upload="youtubeUpload()" />
                    </v-layout>
                </v-stepper-content>
            </v-stepper-items>
        </v-stepper>
    </v-container>
</template>

<script>
import FileUploads from '../components/FileUploads.vue'
import YoutubeUploads from '../components/YoutubeUploads.vue'
import firebase from 'firebase'
import 'firebase/storage'

function initializeErrorList() {
    return [
        {
            code: 'limit',
            set: false,
            message: null,
        },
        {
            code: 'parse',
            set: false,
            message: 'The following files could not be parsed:',
            files: [],
        },
        {
            code: 'upload',
            set: false,
            message: 'The following files could not be uploaded:',
            files: [],
        },
        {
            code: 'type',
            set: false,
            message: 'The following files use an invalid extension:',
            files: [],
        },
        {
            code: 'duplicate',
            set: false,
            message: 'The following files have already been selected:',
            files: [],
        }
    ]
}

function initializeData() {
    return {    
        uploading: false,
        progress: 0,
        succeeded: 0,
        failed: 0,
        finished: false,
        loading: false,
        loginError: false,
        uploadValue: 0,
        uploadLimit: 8,
        files: [],
        matches: [],
        errors: [],
        showError: false
    }
}

export default {
    components: {
        FileUploads,
        YoutubeUploads,
    },
    name: 'Uploads',
    data: () => {
        return {
        uid: null,
        hidden: true,
        step: 1,
        uploadType: 'youtube',
        authEmulator: null,
        errorList: initializeErrorList(),
        ...initializeData()
        }
    },
    mounted: function () {
        this.$firebase.auth().onAuthStateChanged((user) => {

            if (!user) {
                this.step = 1
                return
            }

            /** can't authorize token right now for some reason
            this.setAuthToken()
            .then(() => this.$users.get({ uid: user.uid }))
            .then((response) => {
                let userData = response.body[0]
                if (userData) {
                    this.isAdmin = userData.admin
                } else {
                    let newUser = {
                    uid: user.uid,
                    email: user.email,
                    admin: false
                    }
                    this.$users.save(newUser)
                }

                this.step = 2

                this.loading = false
            })
            .catch((error) => {
                console.log(error)
            })*/

            if (user) {
                console.log('Signed in')
                //console.log(user)
                this.uid = user.uid
                this.step = 2
            } else {
                console.log('Signed out')
            }

            this.loading = false;
        })
    },
    methods: {
        signIn: function (providerName) {
            this.$firebase.auth()
            .signInWithPopup(this.$providers[providerName])
            .then(() => {
                this.loading = false
            })
            .catch((error) => {
                console.log(error)
                this.loading = false
            })
        },
        /*
        setAuthToken: function () {
            return this.$firebase.auth().currentUser.getIdToken()
                .then((token) => {
                return this.$httpInterceptors.push((request) => {
                    request.headers.set('Authorization', token)
                })
            })
        },*/
        /** determines what upload form to use */
        setUploadType(type) {
            this.uploadType = type
            this.step = 3
        },
        /** upload youtube-only object */
        youtubeUpload() {
            this.uploading = true

            for (let i = 0; i < this.matches.length; i++) {
                this.matches[i].uploaded = new Date()

                // upload match info to db
                this.$matches
                .save(this.matches[i])
                .then((response) => {
                    if (response.ok) {
                        console.log('Successfully uploaded document (ID: ' + response.body.docId + ')')
                        if (i === this.matches.length - 1) {
                            this.uploading = false
                            this.finished = true
                        }
                    } else {
                        this.showError = true
                    }
                })
            } 
        },
        /** remove data from file upload objects */
        removeFile(i) {
            this.matches.splice(i, 1)
            this.files.splice(i, 1)
        },
        /** add data to file uplod objects */
        updateFiles(match, file) {
            this.matches.push(match)
            this.files.push(file)
        },
        updateMatches(matches) {
            this.matches = matches
        },
        /* first uploads file to storage and retrieves download url,
        then posts file info to database */
        filesUpload() {
            this.uploading = true

            for (let i = 0; i < this.matches.length; i++) {
                this.matches[i].file.url = '/';
                this.matches[i].uploaded = new Date();

                // upload match info to db
                this.$matches
                .save(this.matches[i])
                .then((response) => {
                    if (response.ok) {
                        console.log('Successfully uploaded document (ID: ' + response.body.docId + ')')
                        if (i === this.matches.length - 1) {
                            this.uploading = false
                            this.finished = true
                        }
                    } else {
                        this.setErrors(3, this.files[i].name)
                        this.showErrors(this.errorList)
                    }
                })
                    
                /*disable until i can figure out how to use storage emulator
                const storageRef = firebase.storage()
                .ref(`${this.files[i].name}`)
                .put(this.files[i])

                // upload file to storage
                storageRef.on(`state_changed`,
                snapshot => {
                    // keep track of file upload progress
                    this.progress = (this.progress + (snapshot.bytesTransferred/snapshot.totalBytes)) * (100 * this.matches.length)
                },
                error => {
                    this.failed += 1
                    this.progress = (this.succeeded - this.failed) * (100 * this.matches.length)
                    this.setErrors(3, this.files[i].name)
                    console.log(error.message)
                },
                () => {
                    this.succeeded += 1
                    this.progress = (this.succeeded - this.failed) * (100 * this.matches.length)
                    storageRef.snapshot.ref
                    .getDownloadURL()
                    .then((url) => {
                        this.matches[i].fileUrl = url;
                        this.matches[i].timestamp = new Date();

                        // upload match info to db
                        this.$matches
                        .save(this.matches[i])
                        .then((response) => {
                            if (response.ok) {
                                console.log('Successfully uploaded document (ID: ' + response.body.docId + ')')
                                if (i === this.matches.length - 1) {
                                    this.uploading = false
                                    this.finished = true
                                }
                            } else {
                                this.setErrors(3, this.files[i].name)
                                this.showErrors(this.errorList)
                            }
                        })
                    })
                })*/
            }
        },
        /** add youtube link to file upload objects */
        addYoutubeLink(ytObj, i) {
            if (Object.keys(ytObj).length > 0) {
                this.matches[i].video.url = "https://youtu.be/watch?v=" + ytObj.id

                if (ytObj.ts) {
                    this.matches[i].video.timestamp = ytObj.ts
                }
            } else {
                 delete this.matches[i].video
            }
        },
        /** set errors to display  */
        setErrors(i, fileName) {
            this.errorList[i].set = true
            if (!this.errorList[i].files.includes(fileName)) {
                this.errorList[i].files.push(fileName)
            }
        },
        /** display errors */
        showErrors(err) {
            this.errors = [err.find(e => e.set === true)]
            this.showError = true
        },
        /** clears errors array */
        clearErrors() {
           this.errorList = initializeErrorList()
           this.errors = []
           this.showError = false
        },
        /** return to upload type selection step */
        goBack() {
            this.clearForm()
            this.step = 2
            this.uploadType = null
        },
        clearForm() {
            this.finished = false
            Object.assign(this.$data, initializeData())
        },
        updateCharacter(e) {
            let match = e.mIndex
            let player = e.event.pIndex
            let character = e.event.character

            this.matches[match].players[player].character = character
        }
    }
}
</script>

<style scoped>
  .v-stepper >>> .v-stepper__wrapper {
      overflow: visible !important;
  }
</style>