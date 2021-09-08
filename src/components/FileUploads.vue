<template>
    <div
    id="files">
        <StatusOverlay
        v-bind="{
            error,
            uploading,
            finished,
            }"
        :errors="errors"
        @clear-errors="clearErrors()"
        @close="resetForm()" />

        <v-form
        v-model="valid"
        class="form"
        ref="form">
            <v-row
            class="group-info"
            v-show="groupMode">
                <v-col
                class="group title pa-0"
                :cols="$vuetify.breakpoint.smAndDown ? 12 : 4">
                    <v-text-field
                    ref="group" 
                    label="Group Title"
                    v-model="group.title"
                    hint="Required"
                    maxLength="32"
                    clearable
                    persistent-hint
                    :rules="groupMode ? rules.group : undefined"
                    :required="groupMode" />
                </v-col>

                <v-col
                class="group part"
                :cols="$vuetify.breakpoint.smAndDown ? 3 : undefined">
                    <v-text-field
                    label="Part"
                    v-model="group.part"
                    hint="Optional"
                    maxLength="16"
                    persistent-hint
                    clearable />
                </v-col>

                <v-col
                class="group date pa-0"
                :cols="$vuetify.breakpoint.smAndDown ? undefined : 4">
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
                            class="date__input"
                            ref="date"
                            label="Date"
                            v-model="group.date"
                            v-bind="attrs"
                            v-on="on"
                            prepend-icon="mdi-calendar"
                            hint="Required"
                            persistent-hint
                            clearable
                            :rules="groupMode ? rules.date : undefined"
                            :required="groupMode" />
                        </template>

                        <v-date-picker
                        v-model="date"
                        no-title
                        scrollable
                        :max="currentDate"
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
                        :disabled="!groupMode" />
                    </v-col>
                </v-col>
            </v-row>


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
                    :groupMode="groupMode"
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

                    
                    <div class="match-divider" :key="j">
                        <hr />

                        <v-btn
                        class="add-match"
                        height="28px"
                        rounded
                        plain
                        outlined
                        @click="selectFiles(i+1)">
                            <v-icon
                            left
                            color="accent">
                                mdi-plus-thick
                            </v-icon>
                            Add File(s) Here
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
                @click="selectFiles()">
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
                height="50px"
                color="accent"
                rounded
                :ripple="false"
                :disabled="!valid || matches.length <= 0 || uploading"
                @click="submitFiles()">
                Upload Files
                </v-btn>
            </div>
        </v-form>
    </div>
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
            insertAtIndex: null,
            matches: [],
            //uploadLimit: 8,
            error: false,
            uploading: false,
            finished: false,
            errors: [],
            url: null,
            masterUrl: null,
            uploadType: 'Group',
            groupMode: true,
            group: {
                title: null,
                part: null,
                date: null,
            },
            rules: {
                group: [
                    v => !!v || 'Required',
                ],
                date: [
                    v => !!v || 'Required'
                ],
                url: [
                    v => !v || v && /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*)/.test(v) || 'Invalid URL',
                    v => !v || /(?:\?v=|youtu.be\/)([^#\&\?]*)/.test(v) && /(?:\?v=|youtu.be\/)([^#\&\?]{11}$)/.test(v) || 'Video ID must be 11 characters'
                ]
            },
            currentDate: new Date().toISOString().split('T').toString()
        }
    },
    watch: {
      'date': function(date) {
          this.group.date = this.formatDate(date)
      },

      'url': function(url) {
          if (this.$refs.url.validate())
              this.masterUrl = url
      }
    },
    methods: {
        /** tell parent component to begin uploading files */
        submitFiles() {
            let time = new Date().toISOString().split('T')
            let files = []
            let order = 0

            this.uploading = true
            let matches = this.matches.map((match) => {
                let newMatch = {
                    userId: this.uid,
                    uploadForm: 'Files',
                    type: 'Group',
                    group: this.group,
                    matchDate: this.group.date,
                    uploadDate: time[0],
                    uploadTime: time[1],
                    order: order,
                    ...match
                }

                order += 1

                files.push(match.file)
                delete match.file

                return newMatch
            })

            //this.printObj(this.matches)

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
        /* makes visible upload button act like html file upload button */
        selectFiles(index) {
            this.isSelecting = true

            if (index) this.insertAtIndex = index

            window.addEventListener('focus', () => {
                this.isSelecting = false
            }, { once: true })

            this.$refs.uploadFilesBtn.click()
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
                        that.parseFileData(e.target.result, file, timestamp, i, files.length - 1)
                    }

                    textReader.readAsText(file)
                })
                .then(() => {
                    if (i < files.length - 1)
                        that.readFiles(files, i + 1)
                })
                .catch((error) => {
                    console.log(error)
                    if (i < files.length - 1)
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
        parseFileData(fileText, file, timestamp, i, endOfFiles) {
            // error if file uses non-.tfhr extension
            let playerNames = fileText.substring(8, 137)?.replace(/\0{1,65}/g, '\n').split('\n', 2)
            let characterNames = fileText.substring(197,213)?.match(/\b(Paca|Velvet|Tianhuo|Shanty|Pom|Uni|Cow)/g)

            // error if player or character names cannot be parsed
            if (playerNames.length !== 2 || characterNames.length !== 2) {
                console.log("Parsing error with file", file.name)
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

                if (this.matches.length === 0) this.date = timestamp

                if (this.insertAtIndex) {
                    this.matches.splice(this.insertAtIndex, 0, match)
                    this.insertAtIndex += 1
                } else
                    this.matches.push(match)
            }

            if (i >= endOfFiles) {
                this.insertAtIndex = null
                if (this.errors.length > 0)
                    this.error = true
            }
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
            let tempMatch = this.matches[i]
            this.$set(this.matches, i, this.matches[j])
            this.$set(this.matches, j, tempMatch)
        },
        /** sets errors array for display once files finish being read */
        setErrors(type, file) {
            let index = this.errors.findIndex(e => e.type == type)
            if (index === -1) {
                if (!file) {
                    console.log("Adding error type to array")
                    this.errors.push({type: type})
                } else {
                    console.log("Adding error type + file name to array")
                    this.errors.push({type: type, files: [file]})
                }
            } else if (file) {
                console.log("Adding file name to " + type + " file array")
                this.errors[index].files.push(file)
            }
        },
        /** clears errors array */
        clearErrors() {
           this.errors = []
           this.error = false
        },
        resetForm() {
            this.$emit('reload-form')
        },
        
    }
}
</script>
