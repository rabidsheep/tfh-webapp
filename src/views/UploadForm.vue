<template>
    <v-container id="uploads">
        <v-overlay v-show="uploading || showError || finished">
            <v-container fluid fill-height>
                <v-layout column justify-center align-center>
                    <template v-if="showError && !uploading">
                        <h1>Error</h1>

                        <div
                        v-for="(error, i) in activeErrors"
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
                        <v-icon>
                            <template v-if="succeeded > 0">
                                mdi-check-circle
                            </template>

                            <template v-else>
                                mdi-close-circle
                            </template>
                        </v-icon>

                        <h1>
                            {{ succeeded > 0 ? 'Success!' : 'Upload Failed' }}
                        </h1>

                        <template v-if="succeeded > 0">
                            Uploaded {{ succeeded }} out of {{ matches.length }} file(s).
                        </template>
                        
                        <template v-if="failed > 0">
                            {{ failed }} file(s) failed to upload.
                        </template>

                        <v-btn
                        @click="resetPage()"
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
                        Upload File
                    </v-stepper-step>
                </v-stepper-header>
                
                <!-- sign in -->
                <v-stepper-content step="1">
                    <v-progress-linear
                    indeterminate
                    v-show="$firebase.auth().currentUser"/>
                    <div class="sign-in">
                        <v-btn
                        height="50"
                        v-show="!$firebase.auth().currentUser"
                        @click="signIn('google')">
                            <v-icon left>mdi-google</v-icon> Google
                        </v-btn>
                        <!--<v-btn height="50" v-show="!$firebase.auth().currentUser" @click="signIn('twitter')">
                            <v-icon left>mdi-twitter</v-icon> Twitter
                        </v-btn>-->
                    </div>
                </v-stepper-content>

                <!-- upload form -->
                <v-stepper-content step="2">
                    <v-form
                    id="uploads__form"
                    ref="form"
                    v-model="valid">
                        

                        <!--
                            <label class="file-name">{{ fileName ? fileName : 'No file chosen' }}</label>
                        -->
                        <input
                        style="display: none;"
                        ref="uploadBtn"
                        type="file"
                        accept=".tfhr"
                        multiple
                        @change="openFiles"
                        required />

                        <v-layout
                        v-if="matches.length > 0"
                        class="files"
                        column>
                            <UploadPreview
                            v-for="(match, i) in matches"
                            :key="i"
                            :index="i + 1"
                            v-bind="match"
                            :uploading="uploading"
                            @remove-file="matches.splice(i, 1)"/>
                        </v-layout>
                        <!-- should we allow users to add comments to their uploads? -->



                        <v-layout
                        class="status"
                        column
                        justify-center>
                            <div
                            :style="matches.length >= uploadLimit ? 'color: red;' : ''">
                                {{ matches.length >= uploadLimit ?
                                'Maximum file limit reached' :
                                (uploadLimit - matches.length) + ' slots remaining' }}
                            </div>

                        </v-layout>

                        <v-layout
                        class="buttons"
                        justify-center
                        >
                            <v-btn
                            rounded
                            :ripple="false"
                            :disabled="matches.length >= uploadLimit"
                            @click="selectFiles">
                                Upload Files
                            </v-btn>

                            <v-btn
                            rounded
                            :ripple="false"
                            color = "primary"
                            :disabled="!valid || matches.length <= 0"
                            @click="submitFiles">
                                Submit
                            </v-btn>
                        </v-layout>
                    </v-form>
                </v-stepper-content>
            </v-stepper-items>
        </v-stepper>
    </v-container>
</template>

<script>
import UploadPreview from '../components/UploadPreview.vue'
import firebase from 'firebase'
import 'firebase/storage'

function initializeErrors() {
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

function initializeData(step) {
    return {
        hidden: true,
        valid: false,
        isSelecting: false,
        uploading: false,
        progress: 0,
        succeeded: 0,
        failed: 0,
        step: step,
        finished: false,
        loading: false,
        loginError: false,
        uploadValue: 0,
        files: [],
        matches: [],
        uploadLimit: 8,
        errors: initializeErrors(),
        showError: false,
    }
}

export default {
    components: { UploadPreview },
    name: 'UploadForm',
    data: function() {
        this.uid = null
        return initializeData(1)
    },
    mounted: function () {
        this.$firebase.auth().onAuthStateChanged((user) => {
            this.loading = true;

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
    computed: {
        activeErrors: function() {
            return [this.errors.find(e => e.set === true)]
        }
    },
    methods: {
        signIn: function (providerName) {
            this.loading = true
            this.$firebase.auth()
            .signInWithPopup(this.$providers[providerName])
            .then(() => {
                /*var token = credential.accessToken
                var user = result.user*/
                this.loading = false
            })
            .catch((error) => {
                /*var errorCode = error.code
                var errorMsg = error.message
                var email = error.email
                var credential = error.credential*/
                console.log(error)
                this.loading = false
            })
        },
        /* makes visible upload button act like html file upload button */
        selectFiles() {
            this.isSelecting = true

            window.addEventListener('focus', () => {
                this.isSelecting = false
            }, { once: true })

            this.$refs.uploadBtn.click()
        },
        /* first uploads file to storage and retrieves download url,
        then posts file info to database */
        submitFiles() {
            this.uploading = true

            for (let i = 0; i < this.matches.length; i++) {
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
                                this.errorList.upload.files.push(this.files[i].name)
                                this.errorList.upload.status = `${response.status}: ${response.statusText}`
                                this.showError = true
                            }
                        })
                    })
                })
            }
            
        },
        /**
         * begins parsing files one by one
         * it checks to make sure each file is a valid replay file,
         * and if it's not, it will move on to the next file until 
         * it reaches the end of the current file list
        */
        openFiles(event) {
            var currentFiles = Array.from(event.target.files)
            var slotsLeft = this.uploadLimit - this.matches.length

            // stop user from adding more matches if file count exceeds limit
            if (this.matches.length >= this.uploadLimit) {
                console.log("limit error")
                this.errors[0].set = true
                this.errors[0].message = `You may only upload ${this.uploadLimit} files at a time.`
                this.showError = true
            } else {
                // alert user of file limit
                if (currentFiles.length > slotsLeft) {
                    this.errors[0].set = true
                    this.errors[0].message = `The amount of files selected exceeds the upload limit.`
                    + ` Only the first ${this.uploadLimit} new files will be parsed.`
                }

                this.readFiles(currentFiles, 0)
            }
        },
        /**
         * generates reader for each file
         */
        readFiles(files, i) {
            (function (that, files, i) {
                var file = files[i];

                var reader = new FileReader()

                reader.onload = function(e) {
                    if (that.matches.length < that.uploadLimit) {
                        that.parseFileData(e.target.result, file.name, files, i)
                    }
                }

                reader.readAsText(file, "UTF-8")
            })(this, files, i)
        },
        /**
         * parses file data
         * regex stuff for future reference:
         * full filename (YYYY-MM-DD_HH-mm-ss_Character1_Character2.tfhr)
         * [0-9]{4}\-[0-9]{2}\-[0-9]{2}\_[0-9]{2}\-[0-9]{2}\-[0-9]{2}\_[A-Za-z]{3,8}\_vs\_[A-Za-z]{3,8}\.tfhr
         * date & time only:
         * [0-9]{4}\-[0-9]{2}\-[0-9]{2}\_[0-9]{2}\-[0-9]{2}\-[0-9]{2}
         * characters only:
         * [A-Za-z]{3,8}\_vs\_[A-Za-z]{3,8}
         * 
         * p1 hex @ offset 8-72
         * p2 hex @ offset 73-137
         * character hexes @ 197-213 (max)
         */
        parseFileData(result, fileName, files, i) {
            // error if file uses non-.tfhr extension
            if (fileName.substring(fileName.length - 5, fileName.length) !== '.tfhr') {
                console.log("type error")
                
                this.setErrors(3, fileName)
            } else if (this.matches.find(m => m.fileName === fileName)) {
                console.log("duplicate error")
                this.setErrors(4, fileName)
            }
            else {
                
                let playerNames = result.substring(8, 137).replace(/\0{1,65}/g, '\n').split('\n', 2)
                let characterNames = result.substring(197,213).match(/\b(Paca|Velvet|Tianhuo|Shanty|Pom|Uni|Cow)/g)

                // error if player or character names cannot be parsed
                if ( playerNames.length !== 2 || characterNames.length !== 2) {
                    console.log("parse error")
                    this.setErrors(1, fileName)
                } else {
                    let players = [{
                        name: playerNames[0],
                        character: (this.$characters).find(c => c.devName == characterNames[0])
                    },
                    {
                        name: playerNames[1],
                        character: (this.$characters).find(c => c.devName == characterNames[1])
                    }]

                    this.files.push(files[i])

                    this.matches.push({
                        fileName: fileName,
                        version: result.charCodeAt(146),
                        players: players
                    })
                }
            }

            if (i < files.length - 1) {
                this.readFiles(files, i + 1)
            } else {
                for (let i = 0; i < this.errors.length; i++) {
                    if (this.errors[i].set === true) {
                        console.log(this.errors[i].code)
                        this.showError = true
                        break
                    }
                }
            }
        },
        /**
         * re-initializes data
         */
        resetPage() {
            this.$refs.form.reset()
            Object.assign(this.$data, initializeData(2))
            this.finished = false
            console.log(this.uid)
        },
        /**
         * sets errors array for display once files finish being read
         */
        setErrors(i, file) {
            this.errors[i].set = true

            if (!this.errors[i].files.includes(file)) {
                this.errors[i].files.push(file)
            }
        },
        /**
         * clears errors array
         */
        clearErrors() {
           this.errors = initializeErrors()
           this.showError = false
        },
    }
}
</script>

<style scoped>
  .v-stepper >>> .v-stepper__wrapper {
      overflow: visible !important;
  }
</style>