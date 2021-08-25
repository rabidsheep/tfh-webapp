<template>
    <v-form
    id="files"
    class="form"
    ref="form"
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
                v-model="uploadType"
                class="mb-3"
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
                class="hint mb-3">
                    <v-icon
                    color="accent"
                    left>
                        mdi-alert-circle-outline
                    </v-icon>

                    <span><template v-if="uploadType === 'Casual'">
                        Matches uploaded using <b>Casuals Mode</b> will display individually on the main page.
                    </template>

                    <template v-else>
                        Matches uploaded using <b>Tournament Mode</b> will be grouped together on the main page.
                    </template>
                    </span>
                </v-row>

                <v-expand-transition>
                <v-row
                v-show="uploadType === `Tournament`">
                    <v-col
                    :cols="$vuetify.breakpoint.xsOnly ? 8 : undefined"
                    class="tournament">
                        <v-text-field
                        dense
                        v-model="tournament.name"
                        :rules="uploadType === `Tournament` ? rules.tournament : undefined"
                        label="Tournament Name"
                        :required="uploadType === `Tournament`" />
                    </v-col>

                    <v-col
                    class="tournament"
                    :cols="$vuetify.breakpoint.xsOnly ? undefined : 2">
                        <v-text-field
                        dense
                        v-model="tournament.num"
                        label="No." />
                    </v-col>

                    <v-col
                    :cols="$vuetify.breakpoint.xsOnly ? 12 : undefined"
                    class="tournament">
                        <v-menu
                        v-model="datepicker"
                        :close-on-content-click="false"
                        :nudge-right="40"
                        transition="scale-transition"
                        offset-y
                        min-width="auto">
                            <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                v-model="tournament.date"
                                label="Date"
                                :rules="uploadType === `Tournament` ? rules.date : undefined"
                                :required="uploadType === `Tournament`"
                                prepend-icon="mdi-calendar"
                                dense
                                v-bind="attrs"
                                v-on="on" />
                            </template>

                            <v-date-picker
                            v-model="date"
                            @input="datepicker = false" />
                        </v-menu>
                    </v-col>
                </v-row>
                </v-expand-transition>
            </v-layout>

            <br v-show="matches.length > 0" />

            <v-layout
            column
            justify-center
            align-center
            class="wrapper">
                <v-layout
                v-if="matches.length > 0"
                class="body"
                column
                justify-center
                align-center>
                    <FilePreview
                    v-for="(match, i) in matches"
                    :key="i"
                    :index="i"
                    v-bind="match"
                    :uploading="uploading"
                    :video="match.video ? match.video : null"
                    :staticUrl="staticUrl"
                    :individual="individualUrls"
                    :currentTimestamp="match.video && match.video.timestamp ? match.video.timestamp : null "
                    @update-character="updateCharacter($event.character, $event.index, i)"
                    @remove="removeMatch(i)"
                    @set-url="setUrl($event, i)"
                    @set-timestamp="setTimestamp($event, i)"
                    @delete-video="deleteVideoObj(i)"
                    @delete-timestamp="deleteTimestamp(i)"
                    @update-static-url="staticUrl = $event" />
                </v-layout>
            
                <v-layout
                class="message"
                column
                justify-center>
                    <div
                    :style="matches.length >= uploadLimit ? 'color: red;' : ''">
                        {{ matches.length >= uploadLimit ?
                        'Maximum file limit reached' :
                        (uploadLimit - matches.length) + ' slots remaining' }}
                    </div>

                    <div><br /></div>
                </v-layout>
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
                style="display: none;"
                ref="uploadFilesBtn"
                type="file"
                accept=".tfhr"
                multiple
                @change="openFiles"
                required />

                <v-btn
                rounded
                :ripple="false"
                color = "accent"
                :disabled="!valid || matches.length <= 0 || uploading"
                @click="submitFiles()">
                    Upload Files
                </v-btn>
            </v-layout>
    </v-form>
</template>

<script>
import FilePreview from './FilePreview.vue'
import StatusOverlay from './StatusOverlay.vue'

export default {
    components: {
        FilePreview,
        StatusOverlay
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
            matchesLinked: false,
            individualUrls: true,
            individualMatches: true,
            staticUrl: null,
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
                ]
            }
        }
    },
    watch: {
        'uploadType': function(val) {
           if (val === 'Tournament') {
               this.individualUrls = false
               this.matchesLinked = true
           } else {
               this.individualUrls = true
               this.matchesLinked = false
           }
        },

      'date': function(v) {
          this.tournament.date = this.formatDate(v)
      }
    },
    mounted() {
    },
    methods: {
        formatDate(date) {
            if (!date) return null

            const [year, month, day] = date.split('-')
            return `${month}-${day}-${year}`
        },
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
            var counter = 0;

            this.uploading = true
            let matches = this.matches.map((match) => {
                let timestamp = ((new Date()).toISOString()).split('T')

                match.linked = this.matchesLinked

                if (this.matchesLinked) {
                    match.uploadId = this.uid + '_' + uploadRef
                } else {
                    match.uploadId = this.uid + '_' + (uploadRef + counter)
                }

                match.type = this.uploadType
                match.uploadDate = timestamp[0]
                match.uploadTime = timestamp[1]

                if (this.uploadType === 'Tournament') {
                    match.tournament = this.tournament
                }

                counter += 1

                return match
            })

            console.log(JSON.parse(JSON.stringify(matches)))

            this.$matches.save({matches: matches, form: this.form}).then((response) => {
                if (response.ok) {
                    console.log('Uploaded matches:')
                    for (const i in response.body.matchIds) {
                        console.log('ID:', response.body.matchIds[i])
                    }
                } else {
                    this.setErrors('upload', this.files[i].name)
                    console.log('Failed to upload a match')
                }

                this.uploading = false
                this.finished = true
            })
            .catch((error) => console.log(error))
                    
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
                    .catch((error) => console.log(error))
                })
                .catch((error) => console.log(error))
            })*/
        //}
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
                this.setErrors('extension', fileName)
            } else if (this.matches.find(m => m.file.name === fileName)) {
                this.setErrors('duplicate', fileName)
            } else {  
                let playerNames = result.substring(8, 137).replace(/\0{1,65}/g, '\n').split('\n', 2)
                let characterNames = result.substring(197,213).match(/\b(Paca|Velvet|Tianhuo|Shanty|Pom|Uni|Cow)/g)

                // error if player or character names cannot be parsed
                if ( playerNames.length !== 2 || characterNames.length !== 2) {
                    this.setErrors('parse', fileName)
                } else {
                    let match = {
                        userId: this.uid,
                        file: {
                            url: null,
                            name: fileName,
                            version: result.charCodeAt(146),
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
            this.files.splice(i, 1)
        },
        updateCharacter(character, j, i) {
            this.$set(this.matches[i].players[j], 'character', character)
        },
        setUrl(url, i) {
            if (!this.matches[i].video) {
                this.$set(this.matches[i], 'video', {})
            }

            if (this.matches[i].video.url !== url || !this.matches[i].video.url) {
                this.$set(this.matches[i].video, 'url', 'https://youtu.be/watch?v=' + url.match(this.$regex.ytId)[1])
                this.$set(this.matches[i].video, 'id', url.match(this.$regex.ytId)[1])
            }

            if (i === 0 && !this.individualUrls) {
                this.staticUrl = url
                console.log(url)
            }
        },
        setTimestamp(timestamp, i) {
            if (this.matches[i].video && !this.matches[i].video.timestamp || this.matches[i].video.timestamp !== timestamp) {
                this.$set(this.matches[i].video, 'timestamp', timestamp)
            }
        },
        deleteVideoObj(i) {
            if (this.matches[i].video) {
                console.log('deleting video')
                this.$delete(this.matches[i], 'video')
            }
        },
        deleteTimestamp(i) {
            if (this.matches[i].video && this.matches[i].video.timestamp) {
                console.log('deleting timestamp')
                this.$delete(this.matches[i].video, 'timestamp')
            }
        },
        setYoutubeLink(v, i) {
            if (Object.keys(v).length > 0) {
                this.matches[i].video = {}
                this.matches[i].video.url = "https://youtu.be/watch?v=" + v.id

                if (v.ts) {
                    this.matches[i].video.timestamp = v.ts
                }
            } else {
                 delete this.matches[i].video
            }
        }
        
    }
}
</script>
