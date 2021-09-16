<template>
    <div
    id="files">
        <StatusOverlay
        v-bind="{
            showOverlay,
            errors,
            fileData,
            formData,
            }"
        :status="alert.status"
        :type="alert.type"
        @clear-errors="clearErrors()"
        @close="$emit('reload-form')" />

        <v-btn
        class="delete"
        color="accent"
        rounded
        width="max-content"
        height="50px"
        @click="matches = []">
            <v-icon left>mdi-trash-can-outline</v-icon> Clear Matches
        </v-btn>

        <v-form
        v-model="valid"
        class="form"
        ref="form">
            <div
            class="group">
                <v-text-field
                class="title__input clearable"
                ref="group" 
                label="Group Title"
                v-model="group.title"
                @change="group.title = group.title.trim()"
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
                v-model="group.part"
                @change="group.part = group.part.trim()"
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
                        v-model="group.date"
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
                class="url clearable"
                ref="url"
                label="YouTube Link"
                v-model="url"
                @change="url = url.trim()"
                prepend-icon="mdi-youtube"
                hint="Optional"
                persistent-hint
                clearable
                :rules="rules.url" />

                <div
                class="url__button">
                    <v-progress-circular
                    v-if="loading"
                    indeterminate />

                    <v-btn
                    v-if="$refs.url && !loading"
                    class="verify"
                    :color="!changeButton ? 'accent' : (hasVideo ? 'success' : 'error' )"
                    height="50px"
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

            

            <div
            v-if="matches.length > 0"
            class="match-list"
            column
            justify-center
            align-center>
                <template v-for="(match, i, j) in matches">
                    <Preview
                    :key="i"
                    :index="i"
                    :fileUpload="true"
                    :p1="match.p1"
                    :p2="match.p2"
                    :fileName="match.fileInfo.name"
                    :fileDate="match.fileInfo.date"
                    :firstMatch="i === 0"
                    :lastMatch="i === matches.length - 1"
                    :hasVideo="hasVideo"
                    :currentTimestamp="match.video ? match.video.timestamp : null"
                    @update-character="updateCharacter($event.character, $event.index, i)"
                    @remove="matches.splice(i, 1)"
                    @set-timestamp="setTimestamp($event, i)"
                    @delete-timestamp="deleteTimestamp(i)"
                    @move-up="swapMatches(i, i-1)"
                    @move-down="swapMatches(i, i+1)" />

                    
                    <div class="match-divider" :key="j">
                        <hr />
                        
                        <v-btn
                        class="add-match"
                        height="28px"
                        rounded
                        color="button2"
                        @click="selectFiles(i+1)">
                            <v-icon
                            left
                            color="accent">
                                mdi-plus-thick
                            </v-icon>

                            <template v-if="i < matches.length - 1">
                                Insert Files Here
                            </template>
                            
                            <template v-else>
                                Add Files
                            </template>
                        </v-btn>

                        <hr />
                    </div>
                </template>
            </div>
                
            <div
            class="buttons">
                <!-- add matches to end -->
                <v-btn
                height="50px"
                color="button2"
                rounded
                :ripple="false"
                v-show="matches.length === 0"
                @click="selectFiles()">
                    <v-icon
                    left
                    color="accent">
                        mdi-plus-thick
                    </v-icon>
                    Add Files
                </v-btn>

                <!-- just here to make upload files
                button open file viewer -->
                <input
                v-show="false"
                ref="uploadFilesBtn"
                type="file"
                accept=".tfhr"
                multiple
                @change="readFiles($event.target.files, 0)"
                required />
                <!---->

                <v-btn
                v-show="matches.length > 0"
                height="50px"
                color="accent"
                rounded
                :ripple="false"
                :disabled="!valid || matches.length <= 0 || showOverlay"
                @click="submitFiles()">
                Upload
                </v-btn>
            </div>
        </v-form>
    </div>
</template>

<script>
import StatusOverlay from './StatusOverlay.vue'
import Preview from './Preview.vue'
import uploadMixin from '../mixins/uploadMixin'
import authMixin from '../mixins/authMixin'
import 'firebase/storage'

export default {
    components: {
        StatusOverlay,
        Preview,
    },
    name: 'FileUploads',
    mixins: [uploadMixin, authMixin],
    props: {
        userId: String,
    },
    data: () => {
        return {
            isSelecting: false,
            insertAtIndex: null,
            matches: [],
            //uploadLimit: 8,
            uploadType: 'Group',
            invalidVideo: true,
            rules: {
                group: [
                    v => !!v || 'Required',
                ],
                date: [
                    v => !!v || 'Required'
                ],
                url: [
                    v => !v || v && /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?\s]*)/.test(v) || 'Invalid URL',
                    v => !v || /(?:\?v=|youtu.be\/)([^#\&\?\s]*)/.test(v) && /(?:\?v=|youtu.be\/)([^#\&\?\s]{11}$)/.test(v) || 'Video ID must be 11 characters'
                ]
            },
            currentDate: new Date().toISOString().split('T').toString()
        }
    },
    mounted() {
        this.validateForm();
    },
    watch: {
      'date': function(date) {
          this.group.date = this.formatDate(date);
      },

      'url': function(url) {
            if (!url) {
                this.hasVideo = false;
                this.invalidVideo = true;
                this.video = {};
                this.channel = {};
            };
      }
    },
    methods: {
        validateYoutubeID() {
            this.loading = true;
            this.vid = this.url.match(this.$regex.ytId)[1];
            this.video = {};
            let youtubeRef = null;

            if (this.$dev) {
                youtubeRef = this.$youtubeData.get({ id: this.vid });
            } else {
                youtubeRef = this.setAuthToken().then(() => {
                    console.log('Retrieving Youtube data');
                    return this.$youtubeData.get({ id: this.vid });
                });
            };

            youtubeRef.then((response) => {
                this.hasVideo = true;
                this.changeVerifyBtn();
                this.video = response.body.video;
                this.channel = response.body.channel;
                this.group.date = this.video.date;
                this.invalidVideo = false;
                this.loading = false;
            })
            .catch((error) => {
                console.log(error);
                this.hasVideo = false;
                this.changeVerifyBtn();
                this.invalidVideo = true;
                this.loading = false;
            });
        },

        /** tell parent component to begin uploading files */
        submitFiles() {
            this.displayAlert({ upload: true }, { loading: true })
            let time = new Date().toISOString().split('T');
            let files = [];
            let order = 0;
            let uploadRef;

            let general = {
                userId: this.userId,
                uploadForm: 'Files',
                type: 'Group',
                group: this.group,
                matchDate: this.group.date,
                uploadDate: time[0],
                uploadTime: time[1],
            }

            let matches = this.matches.map((match) => {
                files.push(match.file);
                delete match.file;

                match = {
                    ...general,
                    ...match,
                    order: order
                };

                if (this.hasVideo) {
                    match.video = {
                        id: this.video.id,
                        title: this.video.title,
                        timestamp: match.video.timestamp
                    };
                    
                    match.channel = this.channel;
                }

                order += 1;

                return match;
            })

            //this.printObj(this.matches)

            if (this.$dev) {
                uploadRef = this.$matches.save({matches});
            } else {
                uploadRef = Promise.all(this.uploadFilesAsPromise(files))
                .then(() => this.$matches.save({matches: matches}));
            };

            uploadRef.then((response) => {
                console.log('Uploaded matches:');
                response.body.matchIds.forEach((id) => console.log('ID:', id));

                this.displayAlert({ upload: true }, { finished: true })
            })
            .catch((error) => {
                console.log(error);
                
                this.setErrors('upload');
                this.displayAlert({}, { error: true })
            });
        },

        /** ensure files are uploaded before match docs are pushed to database */
        uploadFilesAsPromise(files) {
            return files.map((file) => {
                let i = this.matches.findIndex((match) => match.fileInfo.name === file.name);

                return this.$firebase.storage()
                .ref(`replays/${file.name}`)
                .put(file)
                .then((snapshot) => snapshot.ref.getDownloadURL())
                .then((url) => this.matches[i].fileInfo.url = url)
                .catch((error) => {
                    console.log(error);
                    console.log("Removing match #" + (i+1) + " from upload list.");
                    this.matches.splice(i, 1);
                });
            });
        },

        /* makes visible upload button act like html file upload button */
        selectFiles(index) {
            this.isSelecting = true;

            if (index) this.insertAtIndex = index;

            window.addEventListener('focus', () => {
                this.isSelecting = false;
            }, { once: true })

            this.$refs.uploadFilesBtn.click();
        },

        
        /** generates reader for each file */
        readFiles(files, i) {
            (function (that, files, i) {
                var file = files[i];

                new Promise(function(resolve, reject) {
                    // check file extension and duplicate issues first
                    if (file.name.substring(file.name.length - 5, file.name.length) !== '.tfhr') {
                        that.setErrors('extension', file.name);
                        reject("File" + file.name + " does not end in a valid TFHR file extension.");
                    } else if (that.matches.find(m => m.file.name === file.name)) {
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
                    };
                }).then((timestamp) => {
                    // read file as text for rest of data
                    var textReader = new FileReader();

                    textReader.onload = function(e) {
                        that.parseFileData(e.target.result, file, timestamp, i, files.length - 1);
                    }

                    textReader.readAsText(file);
                })
                .then(() => {
                    if (i < files.length - 1)
                        that.readFiles(files, i + 1);
                })
                .catch((error) => {
                    console.log(error);
                    if (i < files.length - 1)
                        that.readFiles(files, i + 1);
                    else
                        if (that.errors.length > 0)
                            that.displayAlert({}, { error: true })
                })
            })(this, files, i);
        },


        /**
         * parses file data
         * p1 hex @ offset 8-72
         * p2 hex @ offset 73-137
         * file date @ offset 150-153
         * character hexes @ 197-213 (max)
         * version @ 
         */
        parseFileData(fileText, file, timestamp, i, endOfFiles) {
            // error if file uses non-.tfhr extension
            let playerNames = fileText.substring(8, 137)?.replace(/\0{1,65}/g, '\n').split('\n', 2);
            let characterNames = fileText.substring(197,213)?.match(/\b(Paca|Velvet|Tianhuo|Shanty|Pom|Uni|Cow)/g);

            // error if player or character names cannot be parsed
            if (playerNames.length !== 2 || characterNames.length !== 2) {
                console.log("Parsing error with file", file.name);
                return this.setErrors('parse', file.name);
            } else {
                let match = {
                    p1: {
                        name: playerNames[0],
                        character: (this.$characters.find(c => c.alias[0] == characterNames[0])).name
                    },
                    p2: {
                        name: playerNames[1],
                        character: (this.$characters.find(c => c.alias[0] == characterNames[1])).name
                    },
                    file: file,
                    fileInfo: {
                        url: null,
                        name: file.name,
                        version: fileText.charCodeAt(146),
                        date: this.formatDate(timestamp),
                    },
                };

                if (this.matches.length === 0)
                    this.date = timestamp;

                if (this.insertAtIndex) {
                    this.matches.splice(this.insertAtIndex, 0, match);
                    this.insertAtIndex += 1;
                } else {
                    this.matches.push(match);
                };
            };

            if (i >= endOfFiles) {
                this.insertAtIndex = null;
                this.validateForm();
                if (this.errors.length > 0)
                    this.displayAlert({}, { error: true })
            };
        },

        setTimestamp(timestamp, i) {
            console.log('setting timestamp');
            this.$set(this.matches[i], 'video', {timestamp});
        },

        deleteTimestamp(i) {
            if (this.matches[i].video?.timestamp) {
                console.log('deleting timestamp');
                this.$delete(this.matches[i], 'video');
            };
        },

        swapMatches(i, j) {
            let tempMatch = this.matches[i];
            this.$set(this.matches, i, this.matches[j]);
            this.$set(this.matches, j, tempMatch);
        },
    }
}
</script>
