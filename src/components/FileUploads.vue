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
            succeeded,
            failed,
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
            v-model="uploadType"
            row
            hide-details>
                <v-radio
                label="Casuals Mode"
                value="Casual" />
                <v-radio
                label="Tournament Mode"
                value="Tournament" />
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

                    <v-col
                    class="message pa-0"
                    cols="10">
                        <template v-if="uploadType === 'Casual'">
                            Matches uploaded using <b>Casuals</b> <b>Mode</b> will display individually on the main page.
                        </template>

                        <template v-else>
                            Matches uploaded using <b>Tournament</b> <b>Mode</b> will be grouped together on the main page.
                        </template>
                    </v-col>
                </div>
            </v-row>

            <v-expand-transition>
                <v-row
                class="tournament-info"
                v-show="uploadType === `Tournament`">
                    <v-col
                    class="tournament name pa-0"
                    :cols="$vuetify.breakpoint.smAndDown ? 12 : 4">
                        <v-text-field
                        ref="tournament" 
                        label="Tournament Name"
                        v-model="tournament.name"
                        hint="Required"
                        persistent-hint
                        :rules="uploadType === `Tournament` ? rules.tournament : undefined"
                        :required="uploadType === `Tournament`" />
                    </v-col>

                    <v-col
                    class="tournament num"
                    :cols="$vuetify.breakpoint.smAndDown ? 3 : undefined">
                        <v-text-field
                        label="No. #"
                        v-model="tournament.num"
                        hint="Optional"
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
                                :rules="uploadType === `Tournament` ? rules.date : undefined"
                                :required="uploadType === `Tournament`" />
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
                            label="YouTube Link"
                            v-model="url"
                            prepend-icon="mdi-youtube"
                            hint="Optional"
                            persistent-hint
                            dense
                            clearable
                            :rules="rules.url"
                            :disabled="uploadType === 'Casual'" />
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
                    :uploadForm="'files'"
                    v-bind="match"
                    :isTournament="uploadType === 'Tournament' ? true : false"
                    :firstMatch="i === 0"
                    :lastMatch="i === matches.length - 1"
                    :fileDate="match.file.date"
                    :timestampRequired="false"
                    :fileName="match.file.name"
                    :type="uploadType"
                    :uploading="uploading"
                    :video="match.video ? match.video : null"
                    :videoUrl="uploadType === 'Tournament' ?
                                vod : (match.video ? match.video.url : null)"
                    :currentTimestamp="match.video && match.video.timestamp ?
                                        match.video.timestamp : null "
                    @update-character="updateCharacter($event.character, $event.index, i)"
                    @remove="removeMatch(i)"
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
            files: [],
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
            vod: null,
            uploadType: 'Casual',
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
          if (this.uploadType === 'Tournament') this.tournament.date = this.formatDate(date)
      },

      'url': function(url) {
          if (this.$refs.url.validate() && this.uploadType === 'Tournament') {
              this.vod = url
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
            var uploadRef = Math.floor(new Date() / 1000)
            let time = (new Date()).toISOString().split('T')

            this.uploading = true
            let matches = this.matches.map((match) => {
                if (this.uploadType === 'Tournament') {
                    match = {
                        userId: this.uid,
                        type: this.uploadType,
                        matchDate: this.tournament.date,
                        uploadForm: 'files',
                        uploadDate: time[0],
                        uploadTime: time[1],
                        tournament: this.tournament,
                        ...match
                    }

                    match.tournament = this.tournament
                    match.matchDate = this.tournament.date
                } else {
                    match = {
                        userId: this.uid,
                        type: this.uploadType,
                        matchDate: match.file.date,
                        uploadForm: 'files',
                        uploadDate: time[0],
                        uploadTime: time[1],
                        ...match
                    }
                }

                return match
            })

            this.printObj(this.matches)

            if (process.env.NODE_ENV === 'development') {
                this.$matches.save({matches: matches, form: this.form}).then((response) => {
                    if (response.ok) {
                        console.log('Uploaded matches:')
                        for (const i in response.body.matchIds) {
                            console.log('ID:', response.body.matchIds[i])
                        }
                    } else {
                        this.setErrors('upload', this.files[i].name)
                        console.log('Failed to upload matches')
                    }

                    this.uploading = false
                    this.finished = true
                })
                .catch((error) => console.log(error))
            } else {
                Promise.all(this.files.map(file => this.uploadAsPromise(file)))
                .then(() => this.$matches.save({matches: matches, form: this.form}))
                .then((response) => {
                    if (response.ok) {
                        console.log('Uploaded matches:')
                        for (const i in response.body.matchIds) {
                            console.log('ID:', response.body.matchIds[i])
                        }
                    } else {
                        this.setErrors('upload', this.files[i].name)
                        console.log('Failed to upload matches')
                    }

                    this.uploading = false
                    this.finished = true
                })
                .catch((error) => console.log(error))
            }
        },
        uploadAsPromise(file) {
            let storageRef = this.$firebase.storage()
            .ref(`${file.name}`)
            .put(file)

            return storageRef.then((snapshot) => {
                return snapshot.ref.getDownloadURL()
            })
            .then((url) => {
                let i = this.matches.findIndex((match) => match.file.name === file.name)
                this.matches[i].file.url = url
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

                var reader = new FileReader()

                reader.onload = function(e) {
                    if (that.matches.length < that.uploadLimit) {
                        let hex = that.buf2hex(e.target.result)
                        that.parseFileData(hex, file.name, files, i)
                    }
                }

                reader.readAsArrayBuffer(file)
            })(this, files, i)
        },
        /** converts array buffer to string */
        buf2hex(buffer) {
            return [...new Uint8Array(buffer)]
                .map(x => x.toString(16).padStart(2, '0'))
                .join('')
        },
        /* converts hex values to human language */
        hex2a(x) {
            var hex = x.toString(); //force conversion
            var str = '';
            for (var i = 0; i < hex.length; i += 2)
                str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
            return str;
        },
        /**
         * parses file data
         * p1 hex @ offset 8-72
         * p2 hex @ offset 73-137
         * file date @ offset 96-99
         * character hexes @ 197-213 (max)
         * version @ 
         */
        parseFileData(hex, fileName, files, i) {
            // error if file uses non-.tfhr extension
            if (fileName.substring(fileName.length - 5, fileName.length) !== '.tfhr') {
                this.setErrors('extension', fileName)
            } else if (this.matches.find(m => m.file.name === fileName)) {
                this.setErrors('duplicate', fileName)
            } else {  
                let fileText = this.hex2a(hex)
                let hexTime = hex.substring(300,308)?.match(/.{1,2}/g)?.reverse().join('')
                let timestamp = new Date(parseInt(hexTime, 16) * 1000).toISOString().split('T')
                let playerNames = fileText.substring(8, 137)?.replace(/\0{1,65}/g, '\n').split('\n', 2)
                let characterNames = fileText.substring(197,213)?.match(/\b(Paca|Velvet|Tianhuo|Shanty|Pom|Uni|Cow)/g)

                
                // error if player or character names cannot be parsed
                if ( playerNames.length !== 2 || characterNames.length !== 2) {
                    this.setErrors('parse', fileName)
                } else {
                    let match = {
                        userId: this.uid,
                        uploadForm: 'files',
                        pos: this.matches.length + 1,
                        file: {
                            url: null,
                            name: fileName,
                            version: fileText.charCodeAt(146),
                            date: this.formatDate(timestamp[0]),
                        },
                        p1: {
                            name: playerNames[0],
                            character: ((this.$characters).find(c => c.devName == characterNames[0])).name
                        },
                        p2: {
                            name: playerNames[1],
                            character: ((this.$characters).find(c => c.devName == characterNames[1])).name
                        }
                    }

                    this.matches.push(match)
                    this.files.push(files[i])
                }
            }

            if (i < files.length - 1 && this.matches.length < this.uploadLimit) {
                this.readFiles(files, i + 1)
            } else {
                if (this.errors.length > 0) {
                    this.error = true               
                }
            }
        },
        /** sets errors array for display once files finish being read */
        setErrors(type, file) {
            
            let index = this.errors.findIndex(e => e.type == type)

            if (index === -1) {
                if (type === 'limit') {
                    this.errors.push({type: type})
                } else {
                    this.errors.push({type: type, files: [file]})
                }
            } else if (type !== 'limit') {
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
            this.files = []
            this.tournament = {
                name: null,
                num: null,
                date: null
            }
            this.matchCount = 0
            this.finished = false
            this.$refs.form.resetValidation()
        },
        removeMatch(i) {
            this.matches.splice(i, 1)
            this.removeFile(this.matches[i].file.name)
        },
        removeFile(file) {
            let index = this.files.findIndex((f) => f.name === file)
            //console.log(this.files[index])
            if (index >= 0) this.files.splice(index, 1)
            //console.log(this.files[index])
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

            console.log(JSON.parse(JSON.stringify(this.matches[i].video)))
        },
        setTimestamp(timestamp, i) {
            if (!this.matches[i].video?.timestamp || this.matches[i].video.timestamp !== timestamp) {
                this.$set(this.matches[i].video, 'timestamp', timestamp)
            }

            console.log(JSON.parse(JSON.stringify(this.matches[i].video)))
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
            let tempMatch = this.matches[i]
            let tempFile = this.files[i]

            /*
            console.log('ORIGINAL\n--------' +
            '\nMatch @ pos ' + i + ': ' +
            this.matches[i].p1.name + ' vs ' + this.matches[i].p2.name +
            '\nMatch @ pos' + j + ': ' +
            this.matches[j].p1.name + ' vs ' + this.matches[j].p2.name +
            '\nFile @ pos ' + i + ': ' +
            this.files[i].name +
            '\nFile @ pos ' + j + ': ' +
            this.files[j].name)
            */

            this.$set(this.matches, i, this.matches[j])
            this.$set(this.files, i, this.files[j])
            
            this.$set(this.matches, j, tempMatch)
            this.$set(this.files, j, tempFile)

            /*
            console.log('NEW\n--------' +
            '\nMatch @ pos' + i + ': ' +
            this.matches[i].p1.name + ' vs ' + this.matches[i].p2.name +
            '\nMatch @ pos' + j + ': ' +
            this.matches[j].p1.name + ' vs ' + this.matches[j].p2.name +
            '\nFile @ pos ' + i + ': ' +
            this.files[i].name +
            '\nFile @ pos ' + j + ': ' +
            this.files[j].name)
            */
        },
        
    }
}
</script>
