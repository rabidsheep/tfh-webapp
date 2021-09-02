<template>
    <v-form
    ref="form"
    id="files"
    class="form"
    v-model="valid">
        <StatusOverlay
        v-bind="{
            error,
            uploading,
            finished,
            progress,
            }"
        :errors="errors"
        @clear-errors="clearErrors()"
        @close="resetForm()" />
        
        <v-layout
        class="options"
        column
        align-center
        justify-center>
            <v-radio-group
            class="mb-5"
            v-model="tournamentMode"
            row
            hide-details>
                <v-radio
                label="Casuals Mode"
                :value="false" />
                <v-radio
                label="Tournament Mode"
                :value="true" />
            </v-radio-group>

            <v-row
            class="hint mb-3 pa-5">
                <div>
                    <v-col
                    class="symbol pa-0">
                        <v-icon
                        size="36px"
                        color="accent">
                            mdi-alert-circle-outline
                        </v-icon>
                    </v-col>

                    <v-divider class="mx-2" vertical />

                    <div class="message">
                        <template v-if="uploadType === 'Casual'">
                            Matches uploaded using <b>Casuals</b> <b>Mode</b> will display individually on the main page.
                        </template>

                        <template v-else>
                            Matches uploaded using <b>Tournament</b> <b>Mode</b> will be grouped together on the main page.
                        </template>
                    </div>
                </div>
            </v-row>

            <v-expand-transition>
                <v-row
                class="tournament-info"
                v-show="tournamentMode">
                    <v-col
                    class="tournament name pa-0"
                    :cols="$vuetify.breakpoint.smAndDown ? 12 : 4">
                        <v-text-field
                        ref="tournament" 
                        label="Tournament Name"
                        v-model="tournament.name"
                        hint="Required"
                        persistent-hint
                        clearable
                        :rules="tournamentMode ? rules.tournament : undefined"
                        :required="tournamentMode" />
                    </v-col>

                    <v-col
                    class="tournament num"
                    :cols="$vuetify.breakpoint.smAndDown ? 3 : undefined">
                        <v-text-field
                        label="No. #"
                        v-model="tournament.num"
                        hint="Optional"
                        clearable
                        persistent-hint />
                    </v-col>

                    <v-col
                    class="tournament date pa-0"
                    :cols="$vuetify.breakpoint.smAndDown ? undefined : 4">
                        <v-menu
                        transition="scale-transition"
                        min-width="auto"
                        v-model="datepicker"
                        offset-y
                        :close-on-content-click="false"
                        :nudge-right="40">
                            <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                ref="date"
                                label="Date"
                                v-model="tournament.date"
                                v-bind="attrs"
                                v-on="on"
                                prepend-icon="mdi-calendar"
                                hint="Required"
                                persistent-hint
                                clearable
                                :rules="tournamentMode ? rules.date : undefined"
                                :required="tournamentMode" />
                            </template>

                            <v-date-picker
                            v-model="date"
                            @input="datepicker = false" />
                        </v-menu>
                    </v-col>

                    <v-col
                    cols="12"
                    class="pa-0"
                    justify="center"
                    align="center">
                        <v-col
                        :cols="$vuetify.breakpoint.smAndDown ? 12 : 6"
                        class="pa-0 pt-5">
                            <v-text-field
                            ref="url"
                            class="link"
                            label="YouTube Link"
                            v-model="url"
                            prepend-icon="mdi-youtube"
                            hint="Optional"
                            persistent-hint
                            dense
                            clearable
                            :rules="rules.url"
                            :disabled="!tournamentMode" />
                        </v-col>
                    </v-col>
                </v-row>
            </v-expand-transition>
        </v-layout>

        <v-layout
        column
        justify-center
        align-center
        class="wrapper">
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
                    :tournamentMode="tournamentMode"
                    :p1="match.p1"
                    :p2="match.p2"
                    :uploading="uploading"
                    :video="match.video ? match.video : null"
                    :fileName="match.fileInfo.name"
                    :fileDate="match.fileInfo.date"
                    :firstMatch="i === 0"
                    :lastMatch="i === matches.length - 1"
                    :timestampRequired="false"
                    :masterUrl="masterUrl"
                    @update-character="updateCharacter($event.character, $event.index, i)"
                    @remove="matches.splice(i, 1)"
                    @set-video-id="setVideoId($event, i)"
                    @set-timestamp="setTimestamp($event, i)"
                    @delete-video="deleteVideo(i)"
                    @delete-timestamp="deleteTimestamp(i)"
                    @move-up="swapMatches(i, i-1)"
                    @move-down="swapMatches(i, i+1)"
                    @update-file-date="match.file.date = $event" />

                    
                    <hr :key="j" v-if="i < matches.length - 1" />
                </template>
            </div>
            
            <div
            class="message"
            column
            justify-center>
                <br v-show="matches.length === 0" />
                <div
                :style="matches.length >= uploadLimit ? 'color: red;' : ''">
                    {{ matches.length >= uploadLimit ?
                    'Maximum file limit reached' :
                    (uploadLimit - matches.length) + ' slots remaining' }}
                </div>

                <br />
            </div>
        </v-layout>

        <v-layout
        class="buttons"
        justify-center
        align-center>
            <v-btn
            color="button2"
            rounded
            :ripple="false"
            :disabled="matches.length >= uploadLimit"
            @click="selectFiles">
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
            @change="openFiles"
            required />

            <v-btn
            color = "accent"
            rounded
            :ripple="false"
            :disabled="!valid || matches.length <= 0 || uploading"
            @click="submitFiles()">
                Upload Files
            </v-btn>
        </v-layout>
    </v-form>
</template>

<script>
import StatusOverlay from './StatusOverlay.vue'
import Preview from './Preview.vue'
import 'firebase/storage'

export default {
    components: {
        StatusOverlay,
        Preview,
    },
    name: 'FileUploads',
    props: {
        uid: String,
    },
    data: () => {
        return {
            form: 0,
            hidden: true,
            datepicker: false,
            date: null,
            valid: false,
            isSelecting: false,
            matches: [],
            uploadLimit: 8,
            error: false,
            uploading: false,
            finished: false,
            succeeded: 0,
            failed: 0,
            progress: 0,
            errors: [],
            url: null,
            masterUrl: null,
            uploadType: 'Casual',
            tournamentMode: false,
            tournament: {
                name: null,
                num: null,
                date: null,
            },
            rules: {
                tournament: [
                    v => !!v || 'Required',
                ],
                date: [
                    v => !!v || 'Required'
                ],
                url: [
                    v => !v || v && /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*)/.test(v) || 'Invalid URL',
                    v => !v || /(?:\?v=|youtu.be\/)([^#\&\?]*)/.test(v) && /(?:\?v=|youtu.be\/)([^#\&\?]{11}$)/.test(v) || 'Video ID must be 11 characters'
                ]
            }
        }
    },
    watch: {
        'uploadType': function(type) {

               this.date = null
               this.tournament = {
                   name: null,
                   num: null,
                   date: null,
               }
               this.url = null
               this.vod = null
        },

      'date': function(date) {
          if (this.tournamentMode) this.tournament.date = this.formatDate(date)
      },

      'url': function(url) {
          if (this.$refs.url.validate() && this.tournamentMode) {
              this.masterUrl = url
          }

      }
    },
    methods: {
        /* makes visible upload button act like html file upload button */
        selectFiles() {
            this.isSelecting = true

            window.addEventListener('focus', () => {
                this.isSelecting = false
            }, { once: true })

            this.$refs.uploadFilesBtn.click()
        },
        /** tell parent component to begin uploading files */
        submitFiles() {
            let time = (new Date()).toISOString().split('T')
            let files = []

            this.uploading = true
            let matches = this.matches.map((match) => {
                

                let newMatch = {
                    userId: this.uid,
                    uploadForm: 'Files',
                    type: this.tournamentMode ? 'Tournament' : 'Casual',
                    uploadDate: time[0],
                    uploadTime: time[1],
                    ...match
                }
                if (this.tournamentMode) {
                    newMatch.tournament = this.tournament
                    newMatch.matchDate = this.tournament.date
                } else {
                    newMatch.matchDate = match.file.date
                }

                
                files.push(match.file)
                delete match.file


                return newMatch
            })

            this.printObj(this.matches)

            if (process.env.NODE_ENV === 'development') {
                this.$matches.save({matches: matches, getYoutubeData: true})
                .then((response) => {
                    if (response.ok) {
                        console.log('Uploaded matches:')
                        for (const i in response.body.matchIds) {
                            console.log('ID:', response.body.matchIds[i])
                        }
                    } else {
                        this.setErrors('upload')
                        console.log('Failed to upload matches')
                    }

                    this.uploading = false
                    this.finished = true
                })
                .catch((error) => {
                    console.log(error)
                    this.uploading = false
                    this.finished = true
                })
            } else {
                Promise.all(files.map(file => this.uploadFilesAsPromise(file)))
                .then(() => this.$matches.save({matches: matches, getYoutubeData: true}))
                .then((response) => {
                    if (response.ok) {
                        console.log('Uploaded matches:')
                        for (const i in response.body.matchIds) {
                            console.log('ID:', response.body.matchIds[i])
                        }
                    } else {
                        this.setErrors('upload')
                        console.log('Failed to upload matches')
                    }

                    this.uploading = false
                    this.finished = true
                })
                .catch((error) => {
                    console.log(error)
                    this.uploading = false
                    this.finished = true
                })
            }
        },
        uploadFilesAsPromise(file) {
            let storageRef = this.$firebase.storage()
            .ref(`replays/${file.name}`)
            .put(file)

            return storageRef
            .then((snapshot) => {
                return snapshot.ref.getDownloadURL()
            })
            .then((url) => {
                console.log(url)
                let i = this.matches.findIndex((match) => match.fileInfo.name === file.name)
                return this.matches[i].fileInfo.url = url
            })
            .catch((error) => {
                console.log(error)
                let i = this.matches.findIndex((match) => match.fileInfo.name === file.name)
                console.log("Removing match #" + (i+1) + " from upload list.")
                this.matches.splice(i, 1)
            })
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
                this.setErrors('limit', '')
            } else {
                // alert user of file limit
                if (currentFiles.length > slotsLeft) {
                   this.setErrors('limit', '')
                }

                this.readFiles(currentFiles, 0)
            }
        },
        /** generates reader for each file */
        readFiles(files, i) {
            (function (that, files, i) {
                var file = files[i];
                

                new Promise(function(resolve, reject) {
                    // check file extension and duplicate issues first
                    if (file.name.substring(file.name.length - 5, file.name.length) !== '.tfhr') {
                        that.setErrors('extension', file.name)
                        reject("File" + file.name + " does not end in a valid TFHR file extension.")
                    } else if (that.matches.find(m => m.file.name === file.name)) {
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
                        that.parseFileData(e.target.result, file, timestamp)
                    }

                    textReader.readAsText(file)
                })
                .then(() => {
                    if (i < files.length - 1 && that.matches.length < that.uploadLimit)
                        that.readFiles(files, i + 1)
                    else
                        if (that.errors.length > 0) that.error = true
                })
                .catch((error) => {
                    console.log(error)

                    if (i < files.length - 1 && that.matches.length < that.uploadLimit)
                        that.readFiles(files, i + 1)
                    else
                        if (that.errors.length > 0) that.error = true
                })
            })(this, files, i)
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
        parseFileData(fileText, file, timestamp) {
            // error if file uses non-.tfhr extension
            let playerNames = fileText.substring(8, 137)?.replace(/\0{1,65}/g, '\n').split('\n', 2)
            let characterNames = fileText.substring(197,213)?.match(/\b(Paca|Velvet|Tianhuo|Shanty|Pom|Uni|Cow)/g)

            // error if player or character names cannot be parsed
            if (playerNames.length !== 2 || characterNames.length !== 2) {
                this.setErrors('parse', file.name)
            } else {
                let match = {
                    p1: {
                        name: playerNames[0],
                        character: (this.$characters.find(c => c.devName == characterNames[0])).name
                    },
                    p2: {
                        name: playerNames[1],
                        character: (this.$characters.find(c => c.devName == characterNames[1])).name
                    },
                    file: file,
                    fileInfo: {
                        url: null,
                        name: file.name,
                        version: fileText.charCodeAt(146),
                        date: this.formatDate(timestamp),
                    },
                }

                this.matches.push(match)
            }
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
        /**
         * clears errors array
         */
        clearErrors() {
           this.errors = []
           this.error = false
        },
        resetForm() {
            this.matches = []
            this.tournament = {
                name: null,
                num: null,
                date: null
            }
            this.finished = false
            this.$refs.form.resetValidation()
        },
        updateCharacter(character, j, i) {
            this.$set(this.matches[i][`p${j+1}`], 'character', character)
        },
        setVideoId(id, i) {
            
            if (!this.matches[i].video) {
                this.$set(this.matches[i], 'video', {})
            }

            if (this.matches[i].video.id !== id || !this.matches[i].video.id) {
                this.$set(this.matches[i].video, 'id', id)
            }

           //this.printObj(this.matches[i].video)
        },
        setTimestamp(timestamp, i) {
            if (!this.matches[i].video?.timestamp || this.matches[i].video.timestamp !== timestamp) {
                this.$set(this.matches[i].video, 'timestamp', timestamp)
            }
        },
        deleteVideo(i) {
            if (this.matches[i].video) {
                console.log('deleting video')
                this.$delete(this.matches[i], 'video')
            }
        },
        deleteTimestamp(i) {
            if (this.matches[i].video?.timestamp) {
                console.log('deleting timestamp')
                this.$delete(this.matches[i].video, 'timestamp')
            }
        },
        swapMatches(i, j) {
            
            
            /*console.log('ORIGINAL\n--------' +
            '\nMatch @ pos ' + i + ': ' +
            this.matches[i].p1.name + ' vs ' + this.matches[i].p2.name +
            '\nMatch @ pos' + j + ': ' +
            this.matches[j].p1.name + ' vs ' + this.matches[j].p2.name)*/
            
            let tempMatch = this.matches[i]
            this.$set(this.matches, i, this.matches[j])
            this.$set(this.matches, j, tempMatch)

            
            /*console.log('NEW\n--------' +
            '\nMatch @ pos' + i + ': ' +
            this.matches[i].p1.name + ' vs ' + this.matches[i].p2.name +
            '\nMatch @ pos' + j + ': ' +
            this.matches[j].p1.name + ' vs ' + this.matches[j].p2.name)*/
            
        },
        
    }
}
</script>
