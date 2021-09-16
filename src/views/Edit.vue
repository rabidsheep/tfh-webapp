<template>
    <v-container
    v-if="$route.query.uploadId && $route.query.uploadForm"
    id="forms"
    class="edit">
        <StatusOverlay
        v-bind="{
            showOverlay,
            errors,
            fileData,
            formData,
            }"
        :status="alert.status"
        :type="alert.type"
        @add-file-anyways="addFile(tempData)"
        @close-warning="closeWarning()"
        @clear-errors="clearErrors()"
        @close="reload()"
        @delete-set="deleteSet()"
        @return-home="$router.push('/')" />

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
                <div v-show="step === 1">
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
                </div>

                <div v-show="step === 2">
                    <div
                    id="step__edit"
                    class="step">
                        <h1>Edit Match Details</h1>
                        
                        <div
                        v-if="loadingMatches"
                        class="progress">
                            <v-progress-circular
                            indeterminate />
                            <br />
                            Retrieving matches...
                        </div>

                        <template
                        v-if="!loadingMatches && Object.keys(original).length > 0 && !failedMatchGet">
                            <v-btn
                            class="delete"
                            color="accent"
                            rounded
                            width="max-content"
                            height="50px"
                            @click="displayAlert({ delete: true }, { warning: true })">
                                <v-icon left>mdi-trash-can-outline</v-icon> Delete Set
                            </v-btn>

                            <v-form
                            v-model="valid"
                            ref="form"
                            id="edit">
                                <div
                                v-if="updated.info.group"
                                class="group">
                                    <v-text-field
                                    class="title__input clearable"
                                    ref="group" 
                                    label="Group Title"
                                    v-model="updated.info.group.title"
                                    @change="updated.info.group.title = updated.info.group.title.trim()"
                                    hint="Required"
                                    placeholder="(ex: Rodeo Regional, Grand Stampede)"
                                    maxLength="32"
                                    clearable
                                    persistent-hint
                                    :rules="rules.group"
                                    required />

                                    <v-text-field
                                    class="part__input clearable"
                                    label="Part"
                                    v-model="updated.info.group.part"
                                    @change="updated.info.group.part = updated.info.group.part.trim()"
                                    hint="Optional"
                                    placeholder="(ex: #3, Finals, etc.)"
                                    maxLength="16"
                                    persistent-hint
                                    clearable />

                                    <v-menu
                                    label="Date"
                                    content-class="datepicker__menu"
                                    attach=".date__input .v-input__control"
                                    transition="scale-transition"
                                    min-width="auto"
                                    v-model="datepicker"
                                    :close-on-content-click="false">
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-text-field
                                            class="date__input clearable"
                                            ref="date"
                                            label="Date"
                                            v-model="updated.info.group.date"
                                            v-bind="attrs"
                                            v-on="on"
                                            prepend-icon="mdi-calendar"
                                            hint="Required"
                                            persistent-hint
                                            placeholder="MM-DD-YYYY"
                                            clearable
                                            :rules="rules.date"
                                            required />
                                        </template>

                                        <v-date-picker
                                        v-model="date"
                                        no-title
                                        scrollable
                                        :max="currentDate"
                                        @input="datepicker = false" />
                                    </v-menu>

                                    <div
                                    class="url__input">
                                        <v-text-field
                                        :class="fileUpload ? 'url clearable' : 'url'"
                                        ref="url"
                                        label="YouTube Link"
                                        v-model="url"
                                        @change="url = url.trim()"
                                        prepend-icon="mdi-youtube"
                                        :hint="youtubeUpload ? 'Required' : 'Optional'"
                                        persistent-hint
                                        :clearable="fileUpload"
                                        :required="youtubeUpload"
                                        :rules="youtubeUpload ? rules.url.req : rules.url.noReq"
                                        @blur="youtubeUpload ? urlOnBlur(url) : undefined"
                                        @click:clear="fileUpload ? clearVideoInfo() : undefined" />


                                        
                                        <div
                                        class="url__button">
                                            <v-progress-circular
                                            v-if="loadingVideo"
                                            indeterminate />

                                            <v-btn
                                            v-if="$refs.url && !loadingVideo"
                                            class="verify"
                                            :color="!changeButton ? 'accent' : (hasVideo ? 'success' : 'error' )"
                                            :width="!changeButton ? '84px' : '50px'"
                                            :fab="changeButton"
                                            rounded
                                            :ripple="false"
                                            :disabled="!$refs.url.valid || !url"
                                            @click="validateYoutubeID()">
                                                <template v-if="!changeButton">
                                                    Verify
                                                </template>

                                                <v-icon v-else>
                                                {{ hasVideo ? 'mdi-check-bold' : 'mdi-close-thick' }}
                                                </v-icon>
                                            </v-btn>
                                        </div>
                                    </div>
                                </div>

                                <div class="match-list">
                                    <template v-for="(match, i, j) in updated.matches">
                                        <Preview
                                        :key="i"
                                        :index="i"
                                        :firstMatch="i === 0"
                                        :lastMatch="i === updated.matches.length - 1"
                                        :youtubeUpload="youtubeUpload"
                                        :fileUpload="fileUpload"
                                        :fileDate="match.fileInfo ? match.fileInfo.date : null"
                                        :fileName="match.fileInfo ? match.fileInfo.name : null"
                                        :p1="match.p1"
                                        :p2="match.p2"
                                        :hasVideo="hasVideo"
                                        :resetTimestamp="resetTimestamp"
                                        :currentTimestamp="match.video ? match.video.timestamp : null"
                                        @add-file="readFile($event, i)"
                                        @set-video-id="setVideoId($event, i)"
                                        @set-timestamp="setTimestamp($event, i)"
                                        @delete-timestamp="deleteTimestamp(i)"
                                        @delete-video="deleteVideo(i)"
                                        @remove-file="removeFile(i)"
                                        @remove="removeMatch(i)"
                                        @move-up="swapMatches(i, i-1)"
                                        @move-down="swapMatches(i, i+1)"
                                        @update-character="updateCharacter(i, $event.character, $event.index)" />

                                        <hr :key="j" v-if="i < updated.matches.length - 1" />
                                    </template>
                                </div>
                                
                                <br />

                                <v-row
                                class="buttons"
                                v-show="!loading && Object.keys(original.matches).length > 0"
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
                        </template>
                    </div>
                </div>
            </v-stepper-items>
        </v-stepper>
    </v-container>
</template>

<script>
import Preview from '.././components/Preview.vue'
import StatusOverlay from '../components/StatusOverlay.vue'
import uploadMixin from '../mixins/uploadMixin'
import authMixin from '../mixins/authMixin'
import 'firebase/storage'


export default {
    name: 'Edit',
    components: {
        Preview,
        StatusOverlay
    },
    mixins: [uploadMixin, authMixin],
    data: () => {
        return {
            step: 1,
            fileUpload: false,
            youtubeUpload: false,
            loadingMatches: false,
            failedMatchGet: false,

            deleted: [],
            original: {},
            originalStringified: {},
            originalVideo: null,
            updated: {},
            changesFound: false,

            uploadId: null,
            loadingVideo: false,
            resetData: false,
            resetTimestamp: false,
            
            rules: {
                group: [
                    v => !!v || 'Required',
                ],
                date: [
                    v => !!v || 'Required'
                ],
                url: {
                    noReq: [
                        v => !v || v && /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*)/.test(v) || 'Invalid URL',
                        v => !v || /(?:\?v=|youtu.be\/)([^#\&\?]*)/.test(v) && /(?:\?v=|youtu.be\/)([^#\&\?]{11}$)/.test(v) || 'Video ID must be 11 characters'
                    ],
                    req: [
                        v => !!v || 'Required',
                        v => !v || v && /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*)/.test(v) || 'Invalid URL',
                        v => !v || /(?:\?v=|youtu.be\/)([^#\&\?]*)/.test(v) && /(?:\?v=|youtu.be\/)([^#\&\?]{11}$)/.test(v) || 'Video ID must be 11 characters'
                    ]
                }
            }
        }
    },
    mounted: function () {
        if (this.$route.query.uploadId && this.$route.query.uploadForm) {
            this.fileUpload = this.$route.query.uploadForm === 'Files';
            this.youtubeUpload = this.$route.query.uploadForm === 'YouTube';
            this.watchAuthState();
        }
    },
    watch: {
        'updated': {
            deep: true,
            handler() {
                /* only allow submission if user changed anything */
                if (JSON.stringify(this.updated) !== this.originalStringified)
                    this.changesFound = true;
                else
                    this.changesFound = false;
            }
        },
        
        'date': function(date) {
            this.updated.info.group.date = this.formatDate(date);
        },

        'url': function(url) {
            if (!url && this.$route.query.uploadForm !== 'YouTube')
                this.clearVideoInfo();
        }
    },
    methods: {
        getMatches(uploadId) {
            this.loadingMatches = true;

            this.$edit.get({uploadId})
            .then((response) => {
                this.original = response.body;
                this.originalStringified = JSON.stringify(this.original);
                this.updated = JSON.parse(this.originalStringified);
                this.originalVideo = this.original.info.video.id;
                this.hasVideo = this.originalVideo ? true : false;
                this.url = this.originalVideo ? 'https://youtu.be/' + this.originalVideo : null;
                this.loadingMatches = false;
            })
            .catch((error) => {
                 console.log(error);
                 this.loadingMatches = false;
                 this.failedMatchGet = true;
            })
        },

        validateYoutubeID() {
            this.loadingVideo = true;
            this.vid = this.url.match(this.$regex.ytId)[1];
            this.video = {};
            let youtubeRef;

            if (this.$dev) {
                youtubeRef = this.$youtubeData.get({ id: this.vid });
            } else {
                youtubeRef = this.setAuthToken().then(() => {
                    console.log('Retrieving Youtube data')
                    return this.$youtubeData.get({ id: this.vid })
                });
            }

            youtubeRef.then((response) => {
                this.hasVideo = true;
                this.changeButton = true;
                this.changeVerifyBtn();

                this.loadingVideo = false;
                this.invalidVideo = false;
                this.updated.info.video = {
                    id: response.body.video.id,
                    title: response.body.video.title
                };
                this.updated.info.channel = response.body.channel;
                this.validateForm();
            })
            .catch((error) => {
                console.log(error);
                this.hasVideo = false;
                this.changeVerifyBtn();

                this.loadingVideo = false;
                this.invalidVideo = true;
                
                this.validateForm();
            })
        },

        resetMatches() {
            this.updated = JSON.parse(this.originalStringified);
            this.resetTimestamp = !this.resetTimestamp;

            if (this.originalVideo) {
                this.url = 'https://youtu.be/' + this.originalVideo;
                this.hasVideo = true;
            } else {
                this.url = null;
                this.hasVideo = false;
            }

        },

        updateMatches() {
            if (this.updated.matches.length > 0) {
                this.displayAlert({ update: true }, { loading: true });

                let deleted = this.deleted;
                let files = [];
                let uploadRef;
                
                this.updated.matches.map((match) => {
                    if (match.file) {
                        files.push(match.file);
                        delete match.file;
                    }
                })

                if (this.$dev || files.length <= 0) {
                    uploadRef = Promise.all(this.formatMatchesForUpload());
                } else {
                    uploadRef = Promise.all(this.uploadFilesAsPromise(files))
                    .then(() => Promise.all(this.formatMatchesForUpload()));
                }

                uploadRef.then((matches) => this.$edit.save({ matches, deleted }))
                .then((response) => {
                    console.log('Updated matches');

                    this.displayAlert({ update: true }, { finished: true });
                })
                .catch((error) => {
                    console.log(error);
                    console.log('Failed to update');

                    this.setErrors('upload');
                    this.displayAlert({}, { error: true });
                })
            } else {
                this.displayAlert({ delete: true }, { warning: true })
            }
        },

        uploadFilesAsPromise(files) {
            return files.map((file) => {
                let i = this.updated.matchesfindIndex((match) => match.fileInfo.name === file.name);
                let j = this.original.matches.findIndex((match) => match._id === this.updated.matches[i]._id);

                return this.$firebase.storage()
                .ref(`replays/${file.name}`)
                .put(file)
                .then((snapshot) => snapshot.ref.getDownloadURL())
                .then((url) => this.updated.matches[i].fileInfo.url = url)
                .catch((error) => {
                    console.log(error);
                    if (this.original.matches[j].fileInfo) {
                        console.log("Reverting file info from match #" + (i+1));
                        this.updated.matches[i].fileInfo = this.original.matches[j].fileInfo;
                    } else {
                        console.log("Removing file info from match #" + (i+1));
                        delete this.updated.matches[i].fileInfo;
                    }
                })
            })
        },

        formatMatchesForUpload() {
            let order = 0;

            return this.updated.matches.filter((match) => {
                let i = this.original.matches.findIndex(original => original._id === match._id);
                match.group = this.updated.info.group;

                if (this.updated.info.video?.id) {
                    match.video = {
                        ...this.updated.info.video,
                        timestamp: match.video?.timestamp,
                    };

                    match.channel = this.updated.info.channel;
                } else if (this.fileUpload && match.video) {
                    delete match.video;
                    delete match.channel;
                }

                match.order = order;

                order += 1;

                if (JSON.stringify(match) !== JSON.stringify(this.original.matches[i]))
                    return true;
                else
                    return false;
            })
            .map((match) => match)
        },

        setTimestamp(timestamp, i) {
            console.log('setting timestamp')
            this.$set(this.updated.matches[i], 'video', {timestamp});
        },

        deleteTimestamp(i) {
            console.log('deleting timestamp');
            this.$delete(this.updated.matches[i], 'video');
        },
        
        /** generates reader for file */
        readFile(file, i) {
            (function (that, file, i) {
                new Promise(function(resolve, reject) {
                    // check file extension and duplicate issues first
                    if (file.name.substring(file.name.length - 5, file.name.length) !== '.tfhr') {
                        that.setErrors('extension', file.name);
                        reject("File" + file.name + " does not end in a valid TFHR file extension.");
                    } else if (that.updated.matches.find(m => m.fileInfo?.name === file.name)) {
                        that.setErrors('duplicate', file.name);
                        reject("File " + file.name + " already exists.");
                    } else {
                        // read hex code of file to retrieve timestamp
                        var hexReader = new FileReader();
                        
                        hexReader.onload = function(e) {
                            let hex = that.buf2hex(e.target.result);
                            let hexTime = hex?.match(/.{1,2}/g)?.reverse().join('');
                            let timestamp = new Date(parseInt(hexTime, 16) * 1000)?.toISOString()?.split('T');

                            if (!timestamp) {
                                that.setErrors('parse', file.name);
                                reject("Could not retrieve file timestamp from " + file.name);
                            } else {
                                resolve(timestamp[0]);
                            };
                        };

                        hexReader.readAsArrayBuffer(file);
                    }
                }).then((timestamp) => {
                    // read file as text for rest of data
                    var textReader = new FileReader();

                    textReader.onload = function(e) {
                        that.parseFileData(e.target.result, file, timestamp, i);
                    };

                    textReader.readAsText(file);
                })
                .then(() => {
                    if (that.errors.length > 0)
                        that.displayAlert({}, {error: true})
                })
                .catch((error) => {
                    console.log(error);

                    if (that.errors.length > 0)
                        that.displayAlert({}, {error: true})
                })
            })(this, file, i)
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
            let playerNames = fileText.substring(8, 137)?.replace(/\0{1,65}/g, '\n').split('\n', 2);
            let characterNames = fileText.substring(197,213)?.match(/\b(Paca|Velvet|Tianhuo|Shanty|Pom|Uni|Cow)/g);

            // error if player or character names cannot be parsed
            if (playerNames.length !== 2 || characterNames.length !== 2) {
                return this.setErrors('parse', file.name);
            } else {
                let players = {
                    p1: {
                        name: playerNames[0],
                        character: (this.$characters.find(c => c.alias[0] == characterNames[0])).name
                    },
                    p2: {
                        name: playerNames[1],
                        character: (this.$characters.find(c => c.alias[0] == characterNames[1])).name
                    }
                };

                this.tempData = {
                    index: i,
                    file: file,
                    fileInfo: {
                        url: null,
                        name: file.name,
                        version: fileText.charCodeAt(146),
                        date: this.formatDate(timestamp),
                    }
                };

                let p1Regex = new RegExp(['^' + players.p1.name], 'i');
                let p2Regex = new RegExp(['^' + players.p2.name], 'i');
                let p1 = this.updated.matches[i].p1;
                let p2 = this.updated.matches[i].p2;

                if (!p1.name.match(p1Regex) || !p2.name.match(p2Regex) ||
                    p1.character !== players.p1.character || p2.character !== players.p2.character) {
                    this.fileData = players;
                    this.formData = {
                        p1: this.updated.matches[i].p1,
                        p2: this.updated.matches[i].p2
                    };

                    this.displayAlert({}, { warning: true });
                } else {
                    this.addFile(this.tempData);
                }
            }
        },

        removeFile(i) {
            console.log("Deleting file from match #" + (i + 1));
            
            // file name string in input field won't update otherwise ?????
            this.updated.matches[i].fileInfo.name = null;
            delete this.updated.matches[i].file;
            delete this.updated.matches[i].fileInfo;
        },

        addFile(data) {
            this.$set(this.updated.matches[data.index], 'file', data.file);
            this.$set(this.updated.matches[data.index], 'fileInfo', data.fileInfo);
            
            if (this.alert.status.warning)
                this.closeWarning();

            console.log("File added to match #" + (data.index + 1));
        },
        
        reload() {
            this.$router.go(this.$router.currentRoute);
        },

        removeMatch(i) {
            console.log("Deleting match #", (i+1));
            
            this.deleted.push(this.updated.matches[i]._id);
            this.updated.matches.splice(i, 1);
        },

        swapMatches(i, j) {
            console.log("Swapping match #" + i+1 + "and #" + j+1)
            let tempMatch = this.updated.matches[i];
            this.$set(this.updated.matches, i, this.updated.matches[j]);
            this.$set(this.updated.matches, j, tempMatch);
        },

        clearVideoInfo() {
            if (this.original.info.video?.id) {
                console.log("Clearing video info")
                delete this.updated.info.video;
                delete this.updated.info.channel;
                this.hasVideo = false;
                this.invalidVideo = true;
            }
        },

        urlOnBlur(url) {
            if (!url && this.youtubeUpload)
                this.url = 'https://youtu.be/' + this.originalVideo;
        },

        deleteSet() {
            this.displayAlert({delete: true}, {loading: true})

            Promise.all(this.updated.matches.map((match) => match._id))
            .then((deleted) => this.$edit.save({ deleted })).then((response) => {
                console.log('Set deleted');

                this.displayAlert({delete: true}, {finished: true})
            })
            .catch((error) => {
                console.log(error);
                console.log('Failed to delete set');

                this.setErrors('setDelete');
                this.displayAlert({}, {error: true})
            })
        }
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