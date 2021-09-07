<template>
    <v-container
    v-if="$route.query.uploadId && $route.query.uploadForm"
    id="forms"
    class="edit">
        <StatusOverlay
        v-bind="{
            error,
            uploading,
            finished,
            warning,
            errors,
            fileData,
            formData
            }"
        @add-file-anyways="addFile(tempData)"
        @close-warning="closeWarning()"
        @clear-errors="clearErrors()"
        @close="reload()" />

        <v-stepper v-model="step" flat>
            <v-stepper-items>
                <v-stepper-header>
                    <v-stepper-step color="accent" step="1"
                    :complete="step > 1">
                        Sign In
                    </v-stepper-step>

                    <v-divider />

                    <v-stepper-step color="accent" step="2"
                    :complete="step > 2">
                        Edit Details
                    </v-stepper-step>
                </v-stepper-header>
                
                <!-- sign in -->
                <v-stepper-content step="1">
                   <div
                    id="step__sign-in"
                    class="step">
                        <h1>Sign In</h1>
                        
                        <br />

                        <div
                        class="body"
                        v-show="allowLogin"
                        column
                        justify-center
                        align-center>
                            <v-btn
                            color="button2"
                            height="50"
                            rounded
                            :disabled="!allowLogin"
                            @click="signIn('google')">
                                <v-icon left>mdi-google</v-icon>
                                Google
                            </v-btn>
                            <!--
                            <v-btn height="50"
                            v-show="!$firebase.auth().currentUser"
                            @click="signIn('twitter')">
                                <v-icon left>mdi-twitter</v-icon> Twitter
                            </v-btn>
                            -->
                        </div>

                        <div
                        v-show="!loggingIn && !allowLogin || loggingIn">
                            <v-progress-linear
                            color="accent"
                            indeterminate/>

                            <br />

                            <template v-if="!allowLogin && !loggingIn">
                                Checking auth state...
                            </template>

                            <template v-if="loggingIn">
                                {{ isRegistered ? 'Verifying user...' : 'Registering user...'}}
                            </template>
                        </div>
                    </div>
                </v-stepper-content>

                <v-stepper-content step="2">
                    <div
                    id="step__edit"
                    class="step">
                        <h1>Edit Match Details</h1>
                        
                        <div class="subtitle">
                            <v-progress-circular
                            class="progress"
                            v-if="loadingMatches"
                            indeterminate />

                            <v-row
                            class="group-info"
                            v-if="group">
                                <v-col
                                class="group name pa-0"
                                :cols="$vuetify.breakpoint.smAndDown ? 12 : 4">
                                    <v-text-field
                                    ref="group" 
                                    label="Group Name"
                                    v-model="group.title"
                                    readonly />
                                </v-col>

                                <v-col
                                class="group part"
                                :cols="$vuetify.breakpoint.smAndDown ? 3 : undefined">
                                    <v-text-field
                                    label="Part"
                                    v-model="group.part"
                                    readonly />
                                </v-col>

                                <v-col
                                class="group date pa-0"
                                :cols="$vuetify.breakpoint.smAndDown ? undefined : 4">
                                    <v-text-field
                                    ref="date"
                                    label="Date"
                                    v-model="group.date"
                                    prepend-icon="mdi-calendar"
                                    readonly />
                                </v-col>

                                <v-row class="url-input">
                                    <v-text-field
                                    v-if="$route.query.uploadForm === 'YouTube' || updated[0].type === 'Group'"
                                    v-model="url"
                                    label="YouTube URL"
                                    prepend-icon="mdi-youtube"
                                    :readonly="$route.query.uploadForm === 'YouTube'" />
                                </v-row>
                            </v-row>
                        </div>

                        <v-form
                        v-model="valid"
                        ref="form"
                        :id="`${$route.query.uploadForm}`"
                        v-if="!loadingMatches && Object.keys(original).length > 0 && !failedMatchGet">
                            <div class="match-list">
                                <template v-for="(match, i, j) in updated">
                                    <Preview
                                    :key="i"
                                    :index="i"
                                    :firstMatch="i === 0"
                                    :lastMatch="i === updated.length - 1"
                                    :uploadForm="$route.query.uploadForm"
                                    :fileDate="match.fileInfo ? match.fileInfo.date : null"
                                    :fileName="match.fileInfo ? match.fileInfo.name : null"
                                    :p1="match.p1"
                                    :p2="match.p2"
                                    :youtubeUpload="$route.query.uploadForm === 'YouTube'"
                                    :fileUpload="$route.query.uploadForm === 'Files'"
                                    :timestampRequired="$route.query.uploadForm === 'YouTube' || original[0].type === 'Group'"
                                    :group="match.group ? match.group : null"
                                    :video="match.video ? match.video : null"
                                    :fileInfo="match.fileInfo ? match.fileInfo : null"
                                    :type="match.type"
                                    :resetData="resetData"
                                    @add-file="readFile($event, i)"
                                    @set-timestamp="setTimestamp($event, i)"
                                    @set-url="setUrl($event, i)"
                                    @delete-timestamp="deleteTimestamp(i)"
                                    @delete-video="deleteVideo(i)"
                                    @remove-file="removeFile(i)"
                                    @remove="removeMatch(i)"
                                    @move-up="swapMatches(i, i-1)"
                                    @move-down="swapMatches(i, i+1)" />

                                    <hr :key="j" v-if="i < updated.length - 1" />
                                </template>
                            </div>
                            
                            <br />

                            <v-row
                            class="buttons"
                            v-show="!loading && Object.keys(original).length > 0"
                            align="center"
                            justify="space-around">
                                <v-col class="reset pr-5">
                                    <v-btn
                                    rounded
                                    color="button2"
                                    @click="resetMatches()">
                                        Reset
                                    </v-btn>
                                </v-col>

                                <v-col class="submit pl-5">
                                    <v-btn
                                    rounded
                                    :disabled="!valid || !changesFound"
                                    color="accent"
                                    @click="updateMatches()">
                                        Submit
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </v-form>
                    </div>
                </v-stepper-content>
            </v-stepper-items>
        </v-stepper>
    </v-container>
</template>

<script>
import Preview from '.././components/Preview.vue'
import StatusOverlay from '../components/StatusOverlay.vue'
import 'firebase/storage'


export default {
    name: 'Edit',
    components: {
        Preview,
        StatusOverlay
    },
    props: {
    },
    data: () => {
        return {
            query: null,
            uid: null,
            hidden: true,
            loading: false,
            step: 1,
            original: [],
            updated: [],
            deleted: [],
            valid: false,
            uploading: false,
            finished: false,
            changesFound: false,
            resetData: false,
            isAdmin: false,
            isRegistered: true,
            loggingIn: false,
            loadingMatches: false,
            failedMatchGet: false,
            allowLogin: false,
            uploadId: null,
            url: null,
            group: null,
            errors: [],
            fileData: null,
            formData: null,
            warning: false,
            error: false,
        }
    },
    mounted: function () {
        if (this.$route.query.uploadId && this.$route.query.uploadForm) {
            // auth state watcher
            this.$firebase.auth().onAuthStateChanged((user) => {
            if (!user) {
                    this.uid = null
                    this.step = 1
                    
                    this.allowLogin = true
                    console.log('User not found')
                    return
                } else {
                    this.loggingIn = true
                    this.uid = user.uid

                    let loginRef = null

                    if (process.env.NODE_ENV == "production") {
                        console.log("Production Environment")

                        loginRef = this.setAuthToken()
                        .then(() => {
                            console.log('Checking user')
                            return this.$users.get({ uid: user.uid })
                        })

                    } else {
                        console.log("Dev Environment")

                        loginRef = this.$users.get({ uid: user.uid })
                    }

                    loginRef.then((response) => {
                        let userData = response.body[0]

                        if (userData) {
                            console.log("Retrieved user data")
                            this.isAdmin = userData.admin
                        } else {
                            console.log("Creating new user")

                            this.isRegistered = false

                            let newUser = {
                                uid: user.uid,
                                email: user.email,
                                admin: false
                            }

                            return this.$users.save(newUser)
                            .then(() => {
                                console.log('User created') 
                            })
                        }
                    })
                    .then(() => {
                        this.loading = false
                        this.loadingMatches = true
                        this.isRegistered = true
                        this.loggingIn = false
                        this.step = 2
                        
                        this.getMatches(this.$route.query.uploadId)
                    })
                    .catch((error) => {

                        this.loading = false
                        this.isRegistered = true
                        this.loggingIn = false
                        this.step = 1
                        this.allowLogin = true
                        console.log(error)
                    })
                }
            })
        }
    },
    watch: {
        'updated': {
            deep: true,
            handler() {
                /* only allow submission if user changed anything */
                if (JSON.stringify(this.updated) !== JSON.stringify(this.original)) {
                    this.changesFound = true
                } else {
                    this.changesFound = false
                }
            }
        },
        
    },
    methods: {
        signIn: function (providerName) {
            this.loading = true
            this.allowLogin = false

            this.$firebase.auth()
            .signInWithPopup(this.$providers[providerName])
            .then(() => {
                this.loading = false
            })
            .catch((error) => {
                console.log(error)
                this.allowLogin = true
                this.loading = false
            })
        },
        setAuthToken: function () {
            return this.$firebase.auth().currentUser.getIdToken()
                .then((token) => {
                return this.$httpInterceptors.push((request) => {
                    request.headers.set('Authorization', token)
                })
            })
            .catch((error) => console.log(error))
        },
        getMatches(uploadId) {
            this.loadingMatches = true

            this.$matches.get({uploadId: uploadId})
            .then((response) => {
                if (response.ok) {
                    this.group = response.body.groups[0]._id.group
                    this.original = response.body.groups[0].matches
                    this.updated = JSON.parse(JSON.stringify(response.body.groups[0].matches))
                    this.url = (this.original[0].video ? 'https://youtu.be/' + this.original[0].video.id : null)
                    this.loadingMatches = false
                }
            })
            .catch((error) => {
                 console.log(error)
                 this.loadingMatches = false
                 this.failedMatchGet = true
            })
        },
        resetMatches() {
            this.updated = JSON.parse(this.originalStringified)
            this.resetData = !this.resetData
        },
        updateCharacter(character, i) {
            this.$set(this.updated.players[i], 'character', character)
        },
        updateMatches() {
            this.uploading = true
            let files = []
            let order = 0

            this.updated.map((match) => {
                if (match.file) {
                    files.push(match.file)
                    delete match.file
                }

                match.order = order
                order += 1
            })

            if (process.env.NODE_ENV === 'development' || files.length <= 0) {
                let matches = this.updated.filter((match) => {
                    let i = this.original.findIndex(original => original._id === match._id)

                    if (JSON.stringify(match) !== JSON.stringify(this.original[i]))
                        return true
                    else
                        return false
                })
                .map((match) => match)

                this.$update.save({
                    matches: matches,
                    deleted: this.deleted,
                    getYoutubeData: false
                })
                .then((response) => {
                    if (response.ok) {
                        console.log('Updated matches')
                    }

                    this.uploading = false
                    this.finished = true
                })
                .catch((error) => {
                    console.log(error)
                    console.log('Failed to update')
                    this.setErrors('upload')
                    this.uploading = false
                    this.error = true
                })
            } else {
                Promise.all(files.map(file => this.uploadFilesAsPromise(file)))
                .then(() => {
                    let matches = this.updated.filter((match) => {
                        let i = this.original.findIndex(original => original._id === match._id)

                        if (JSON.stringify(match) !== JSON.stringify(this.original[i]))
                            return true
                        else
                            return false
                    })
                    .map((match) => match)

                    return this.$update.save({
                        matches: matches,
                        deleted: this.deleted,
                        getYoutubeData: false
                    })
                })
                .then((response) => {
                    if (response.ok) {
                        console.log('Updated matches')
                    }

                    this.uploading = false
                    this.finished = true
                })
                .catch((error) => {
                    console.log(error)
                    console.log('Failed to update matches')
                    this.setErrors('upload')
                    this.uploading = false
                    this.error = true
                })
            }

        },
        uploadFilesAsPromise(file) {
            let storageRef = this.$firebase.storage()
            .ref(`replays/${file.name}`)
            .put(file)

            return storageRef
            .then((snapshot) => snapshot.ref.getDownloadURL())
            .then((url) => {
                let i = this.updated.findIndex((match) => match.fileInfo.name === file.name)
                this.updated[i].fileInfo.url = url
            })
            .catch((error) => {
                console.log(error)
                let i = this.updated.findIndex((match) => match.fileInfo.name === file.name)
                console.log("Removing file info from match #" + (i+1))
                delete this.updated[i].fileInfo
            })
        },
        setUrl(url, i) {
            if (!this.updated[i].video) {
                this.$set(this.updated[i], 'video', {})
            }

            if (this.updated[i].video.url !== url || !this.updated[i].video.url) {
                this.$set(this.updated[i].video, 'id', url.match(this.$regex.ytId)[1])
            }
        },
        setTimestamp(timestamp, i) {
            if (this.updated[i].video && !this.updated[i].video.timestamp || this.updated[i].video.timestamp !== timestamp) {
                this.$set(this.updated[i].video, 'timestamp', timestamp)
            }
        },
        deleteVideo(i) {
            if (this.updated[i].video) {
                console.log('deleting video')
                this.$delete(this.updated[i], 'video')
            }
        },
        deleteTimestamp(i) {
            if (this.updated[i].video && this.updated[i].video.timestamp) {
                console.log('deleting timestamp')
                this.$delete(this.updated[i].video, 'timestamp')
            }
        },
        /** generates reader for each file */
        readFile(file, i) {
            (function (that, file, i) {
                new Promise(function(resolve, reject) {
                    // check file extension and duplicate issues first
                    if (file.name.substring(file.name.length - 5, file.name.length) !== '.tfhr') {
                        that.setErrors('extension', file.name)
                        reject("File" + file.name + " does not end in a valid TFHR file extension.")
                    } else if (that.updated.find(m => m.file?.name === file.name)) {
                        that.setErrors('duplicate', file.name)
                        reject("File " + file.name + " already exists.")
                    } else {
                        // read hex code of file to retrieve timestamp
                        var hexReader = new FileReader()
                        
                        hexReader.onload = function(e) {
                            
                            let hex = that.buf2hex(e.target.result)
                            let hexTime = hex?.match(/.{1,2}/g)?.reverse().join('')
                            let timestamp = new Date(parseInt(hexTime, 16) * 1000)?.toISOString()?.split('T')

                            if (!timestamp) {
                                that.setErrors('parse', file.name)
                                reject("Could not retrieve file timestamp from " + file.name)
                            } else {
                                resolve(timestamp[0])
                            }
                        }

                        hexReader.readAsArrayBuffer(file)
                    }
                }).then((timestamp) => {
                    // read file as text for rest of data
                    var textReader = new FileReader()

                    textReader.onload = function(e) {
                        that.parseFileData(e.target.result, file, timestamp, i)
                    }

                    textReader.readAsText(file)
                })
                .then(() => {
                    if (that.errors.length > 0) that.error = true
                })
                .catch((error) => {
                    console.log(error)

                    if (that.errors.length > 0) that.error = true
                })
            })(this, file, i)
        },
        /** converts array buffer to string */
        buf2hex(buffer) {
            let buf = [...new Uint8Array(buffer)]

            if (buf.length < 154) return null

            let timestamp = buf.slice(150, 154)
            return timestamp.map(x => x.toString(16).padStart(2, '0')).join('')
        },
        /**
         * parses file data
         * p1 hex @ offset 8-72
         * p2 hex @ offset 73-137
         * file date @ offset 150-153
         * character hexes @ 197-213 (max)
         * version @ 
         */
        parseFileData(fileText, file, timestamp, i) {
            // error if file uses non-.tfhr extension
            let playerNames = fileText.substring(8, 137)?.replace(/\0{1,65}/g, '\n').split('\n', 2)
            let characterNames = fileText.substring(197,213)?.match(/\b(Paca|Velvet|Tianhuo|Shanty|Pom|Uni|Cow)/g)

            // error if player or character names cannot be parsed
            if (playerNames.length !== 2 || characterNames.length !== 2) {
                this.setErrors('parse', file.name)
                this.error = true
            } else {

                let players = {
                    p1: {
                        name: playerNames[0],
                        character: (this.$characters.find(c => c.devName == characterNames[0])).name
                    },
                    p2: {
                        name: playerNames[1],
                        character: (this.$characters.find(c => c.devName == characterNames[1])).name
                    }
                }

                this.tempData = {
                    index: i,
                    file: file,
                    fileInfo: {
                        url: null,
                        name: file.name,
                        version: fileText.charCodeAt(146),
                        date: this.formatDate(timestamp),
                    }
                }

                let p1Regex = new RegExp(['^' + players.p1.name], 'i')
                let p2Regex = new RegExp(['^' + players.p2.name], 'i')
                let p1 = this.updated[i].p1
                let p2 = this.updated[i].p2

                if (!p1.name.match(p1Regex) || !p2.name.match(p2Regex) ||
                    p1.character !== players.p1.character || p2.character !== players.p2.character) {
                    this.fileData = players
                    this.formData = {p1: this.updated[i].p1, p2: this.updated[i].p2}
                    this.warning = true
                } else {
                    this.addFile(this.tempData)
                }
            }
        },
        addFile(data) {

            this.$set(this.updated[data.index], 'file', data.file)
            this.$set(this.updated[data.index], 'fileInfo', data.fileInfo)
            
            if (this.warning = true) {
                this.closeWarning()
            }

            console.log("File added to match #" + (data.index + 1))
        },
        removeFile(i) {
            console.log("Deleting file from match #" + (i + 1))
            
            // file name string in input field won't update otherwise ?????
            this.updated[i].fileInfo.name = null
            delete this.updated[i].file
            delete this.updated[i].fileInfo
        },
        reload() {
            this.$router.go(this.$router.currentRoute)
        },
        closeWarning() {
            this.formData = null
            this.fileData = null
            this.tempData = null
            this.warning = false
        },
         /**
         * clears errors array
         */
        clearErrors() {
           this.error = false
           this.errors = []
        },
        /** sets errors array for display once files finish being read */
        setErrors(type, file) {
            let index = this.errors.findIndex(e => e.type == type)

            if (index === -1) {
                if (!file) {
                    this.errors.push({type: type})
                } else {
                    this.errors.push({type: type, files: [file]})
                }
            } else if (file) {
                this.errors[index].files.push(file)
            }
        },
        removeMatch(i) {
            console.log("Deleting match #", (i+1))
            
            this.deleted.push(this.updated[i]._id)
            this.updated.splice(i, 1)
        },
        swapMatches(i, j) {
            let tempMatch = this.updated[i]
            this.$set(this.updated, i, this.updated[j])
            this.$set(this.updated, j, tempMatch)
        },
    }
}
</script>

<style scoped>
@import '../assets/css/uploads.css';

.v-stepper >>> .v-stepper__wrapper {
    overflow: visible !important;
}

.v-input--is-readonly >>> .v-input__slot::before {
    border-color: rgba(255, 255, 255, 0.7) !important;
}

.v-input--is-readonly >>> i {
    color: #5e5e5e !important
}

.v-input--is-readonly >>> .v-label,
.v-input--is-readonly >>> .v-messages,
.v-input--is-readonly >>> input {
    color: rgba(255, 255, 255, 0.7) !important;
}

</style>