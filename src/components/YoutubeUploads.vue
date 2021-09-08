<template>
    <div
    id="youtube">
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
        @close="resetForm()" />

        <v-row
        class="url-input">
            <v-text-field
            class="url"
            ref="url"
            label="YouTube Link"
            v-model="url"
            prepend-icon="mdi-youtube"
            hide-details
            clearable
            required
            :rules="rules.url" />

            <v-btn
            v-if="$refs.url"
            color="accent"
            height="50px"
            rounded
            :ripple="false"
            :disabled="!$refs.url.valid"
            @click="validateYoutubeID()">
                Go
            </v-btn>
        </v-row>

        <v-progress-circular
        v-if="loading"
        indeterminate />
        
        <template v-if="!loading">
            <template v-if="invalidId">
                No video found under ID '{{ vid }}'
            </template>

            <div
            v-if="Object.keys(video).length"
            class="data"
            column
            justify-center
            align-center>
                <template v-if="Object.keys(video).length > 0">
                    <v-row
                    class="date-title">
                        <v-text-field
                        class="title"
                        label="Video Title"
                        v-model="video.title"
                        readonly
                        disabled />

                        <v-text-field
                        class="date"
                        label="Date Uploaded"
                        v-model="video.date"
                        readonly
                        disabled />
                    </v-row>

                    <div
                    class="desc">
                        <v-textarea
                        class="descbox"
                        label="Description"
                        v-model="currentDescription"
                        hint="Format: HH:mm:ss Name (Character) vs Name (Character)"
                        persistent-hint
                        no-resize />
                        
                        <v-btn
                        class="reset"
                        height="50px"
                        color="button2"
                        rounded
                        :width="$vuetify.breakpoint.smAndDown? `150px` : undefined"
                        :ripple="false"
                        @click="currentDescription = video.description">
                            Reset Timestamps
                        </v-btn>

                        <v-btn
                        class="parse"
                        height="50px"
                        color="accent"
                        rounded
                        :width="$vuetify.breakpoint.smAndDown? `150px` : undefined"
                        :ripple="false"
                        @click="parseVideoDescription(currentDescription)">
                            Parse Timestamps
                        </v-btn>
                    </div>
                </template>
            </div>

            <v-form
            v-if="parsed"
            class="form"
            v-model="valid"
            ref="form">
                <v-row
                v-show="currentDescription"
                class="group-info pa-0"
                justify="center">
                    <v-col
                    :cols="$vuetify.breakpoint.xsOnly ? 12 : undefined"
                    :class="$vuetify.breakpoint.xsOnly? `title pa-0 mb-6` : `title pa-0 mr-2`">
                        <v-text-field
                        label="Group Title"
                        v-model="group.title"
                        hint="Required"
                        maxLength="32"
                        clearable
                        required
                        :rules="rules.group" />
                    </v-col>

                    <v-col
                    :class="$vuetify.breakpoint.xsOnly? `part pa-0 mr-2` : `part pa-0 mx-2`"
                    :cols="$vuetify.breakpoint.xsOnly ? undefined : 2">
                        <v-text-field
                        label="Part"
                        v-model="group.part"
                        maxLength="16"
                        hint="Optional"
                        clearable />
                    </v-col>

                    <v-col
                    class="date pa-0 ml-2">
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
                                clearable
                                :rules="rules.date" />
                            </template>

                            <v-date-picker
                            v-model="date"
                            no-title
                            scrollable
                            :max="currentDate"
                            @input="datepicker = false" />
                        </v-menu>
                    </v-col>
                </v-row>

                <div
                class="match-list">
                    <template v-if="!loading && matches.length > 0">
                        <template v-for="(match, i, j) in matches">
                            <Preview
                            :key="i"
                            :index="i"
                            :youtubeUpload="true"
                            :groupMode="true"
                            :p1="match.p1"
                            :p2="match.p2"
                            :video="match.video"
                            :fileName="match.fileInfo ? match.fileInfo.name : null"
                            :firstMatch="i === 0"
                            :lastMatch="i === matches.length - 1"
                            :timestampRequired="matches.length > 1 ? true : false"
                            @remove="removeMatch(i)"
                            @update-character="updateCharacter($event.character, $event.index, i)"
                            @move-up="swapMatches(i, i-1)"
                            @move-down="swapMatches(i, i+1)"
                            @add-file="readFile($event, i)"
                            @remove-file="removeFile(i)"
                            @set-timestamp="matches[i].video.timestamp = $event"
                            @delete-timestamp="delete matches[i].video.timestamp" />

                            <div class="match-divider" :key="j">
                                <hr />

                                <v-btn
                                class="add-match"
                                height="28px"
                                rounded
                                plain
                                outlined
                                @click="addBlankMatch(i+1)">
                                    <v-icon
                                    left
                                    color="accent">
                                        mdi-plus-thick
                                    </v-icon>
                                    Add Match Here
                                </v-btn>

                                <hr />
                            </div>
                        </template>
                    </template>
                </div>
                
                <div class="foot">
                    <center v-show="matches.length <= 0 && parsed">
                        No matches found!
                    </center>

                    <v-btn
                    class="upload"
                    v-if="matches.length > 0"
                    height="50px"
                    color="accent"
                    rounded
                    :ripple="false"
                    :disabled="!valid"
                    @click="youtubeUpload()">
                        Upload
                    </v-btn>
                </div>
            </v-form>
        </template>
    </div>
</template>

<script>
import Preview from './Preview.vue'
import StatusOverlay from './StatusOverlay.vue'
// youtube test video url: https://www.youtube.com/watch?v=uciAaVk3xaE

function initializeData() {
    return {
        valid: false,
        loading: false,
        url: null,
        video: {},
        vid: null,
        currentDescription: null,
        parsed: false,
        invalidId: false,
        group: {
            title: null,
            part: null,
            date: null
        },
        datepicker: false,
        date: null,
        matches: [],
        files: [],
        timestamp: null,
        error: false,
        uploading: false,
        finished: false,
        warning: false,
        errors: [],
        fileData: null,
        formData: null,
        tempData: null,
        currentDate: new Date().toISOString().split('T').toString(),
    }
}

export default {
    components: {
        Preview,
        StatusOverlay
    },
    name: 'YoutubeUploads',
    props: {
        uid: String,
    },
    data: () => {
        return {
            valid: false,
            loading: false,
            url: null,
            video: {},
            vid: null,
            currentDescription: null,
            parsed: false,
            invalidId: false,
            group: {
                title: null,
                part: null,
                date: null
            },
            datepicker: false,
            date: null,
            matches: [],
            files: [],
            timestamp: null,
            error: false,
            uploading: false,
            finished: false,
            warning: false,
            errors: [],
            fileData: null,
            formData: null,
            tempData: null,
            currentDate: new Date().toISOString().split('T').toString(),
            rules: {
                name: [
                    v => !!v || 'Required'
                ],
                url: [
                    v => !!v || 'Required',
                    v => !v || v && /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*)/.test(v) || 'Invalid URL',
                    v => !v || /(?:\?v=|youtu.be\/)([^#\&\?]*)/.test(v) && /(?:\?v=|youtu.be\/)([^#\&\?]{11}$)/.test(v) || 'Video ID must be 11 characters'
                ],
                timestamp: [
                    v => !v || v && (/^([0-9]{1,2}h)?([0-9]{1,3}m)?([0-9]{1,5}s)?$/).test(v) || 'Invalid format',
                ],
                group: [
                    v => !!v || 'Required',
                ],
                date: [
                    v => !!v || 'Required'
                ]
            },
        }
    },
    mounted() {
        if (process.env.NODE_ENV === 'development')
            this.url = 'https://www.youtube.com/watch?v=73vR-i3N4CY'
    },
    watch: {
        'date': function(date) {
            this.group.date = this.formatDate(date)
        },
    },
    methods: {
        setAuthToken: function () {
            return this.$firebase.auth().currentUser.getIdToken()
                .then((token) => {
                    console.log('Setting auth token')
                    return this.$httpInterceptors.push((request) => {
                        request.headers.set('Authorization', token)
                    })
                })
                .catch((error) => console.log(error))
        },
        validateYoutubeID() {
            this.loading = true
            this.vid = this.url.match(this.$regex.ytId)[1]
            this.video = {}
            let youtubeRef = null

            if (process.env.NODE_ENV === "production") {
                youtubeRef = this.setAuthToken().then(() => {
                    console.log('Retrieving Youtube data')
                    return this.$youtubeData.get({ v: this.vid })
                })
            } else {
                youtubeRef = this.$youtubeData.get({ v: this.vid })
            }

            youtubeRef.then((response) => {
                if (response.ok) {
                    this.video = response.body
                    this.currentDescription = this.video.description
                    this.group.date = this.video.date
                    this.parseVideoDescription(this.currentDescription)
                    this.invalidId = false
                }
                this.loading = false
                this.error = false
            })
            .catch((error) => {
                console.log(error)
                this.invalidId = true
                this.loading = false
            })
            
        },
        parseVideoDescription(desc) {
            this.matches = []
            let lines = desc.split('\n')
            let tsPattern = /(?:([0-9]{1,2})(?:h|:))?([0-9]{1,2})(?:m|:)([0-9]{1,2})(?:s)?\s+(.*)/i

            lines.forEach((line) => {
                if (line) {
                    let matched = line.match(tsPattern)
                    
                    if (matched) {
                        let hours = matched[1] ? matched[1] : '00'
                        let minutes = matched[2]
                        let seconds = matched[3]
                        let times = [hours, minutes, seconds]
                        for (let i = 0; i < 3; i++) {
                            while (times[i].length < 2) {
                                times[i] = `0${times[i]}`
                            }
                        }
                        let timestamp = `${times[0]}h${times[1]}m${times[2]}s`

                        let players = matched[4]
                        let playersPattern = /\s*(.*)\s+\(\s*(.*)\s*\)\s+vs.?\s+(.*)\s+\(\s*(.*)\s*\)\s*/i

                        if (players.match(playersPattern)) {
                            let matched = players.match(playersPattern)
                            
                            let match = {
                                p1: {
                                    name: matched[1].trim(),
                                    character: (this.$characters.find(c => c.names.includes(matched[2]))?.name)
                                },
                                p2: {
                                    name: matched[3].trim(),
                                    character: (this.$characters.find(c => c.names.includes(matched[4]))?.name)
                                },
                                video: {
                                    id: this.video.id,
                                    title: this.video.title,
                                    timestamp: timestamp,
                                }
                            }
                            
                            this.matches.push(match)
                        }
                    }
                }
            })

            this.parsed = true
        },
        /** upload youtube-only object */
        youtubeUpload() {
            this.uploading = true
            let time = new Date().toISOString().split('T')
            let files = []
            let order = 0
            
            // add files to file array
            this.matches.map((match) => {
                if (match.file) {
                    files.push(match.file)
                    delete match.file
                }
            })

            if (process.env.NODE_ENV === 'development' || files.length <= 0) {
                // dev environment OR no files added to matches

                let matches = this.matches.map((match) => {

                    //this.printObj(match)
                    match = {
                        userId: this.uid,
                        uploadForm: 'YouTube',
                        type: 'Group',
                        matchDate: this.group.date,
                        uploadDate: time[0],
                        uploadTime: time[1],
                        group: this.group,
                        channel: this.video.channel,
                        order: order,
                        ...match
                    }

                    order += 1

                    return match
                })

                this.$matches.save({matches: matches, getYoutubeData: false})
                .then((response) => {
                    if (response.ok) {
                        console.log('Uploaded matches:')
                        for (const i in response.body.matchIds)
                            console.log('ID:', response.body.matchIds[i])
                    }

                    this.uploading = false
                    this.finished = true
                })
                .catch((error) => {
                    console.log(error)
                    console.log('Failed to upload')
                    this.setErrors('upload')
                    this.uploading = false
                    this.error = true
                })
            } else {
                // production mode & files added to matches
                Promise.all(files.map(file => this.uploadFilesAsPromise(file)))
                .then(() => {
                        return this.matches.map((match) => {
                            match = {
                                userId: this.uid,
                                uploadForm: 'YouTube',
                                type: 'Group',
                                matchDate: this.group.date,
                                uploadDate: time[0],
                                uploadTime: time[1],
                                group: this.group,
                                channel: this.video.channel,
                                order: order,
                                ...match
                            }

                            order += 1
                            return match
                        })
                    }
                )
                .then((matches) => this.$matches.save({matches: matches, getYoutubeData: false}))
                .then((response) => {
                    if (response.ok) {
                        console.log('Uploaded matches:')
                        for (const i in response.body.matchIds)
                            console.log('ID:', response.body.matchIds[i])
                    }

                    this.uploading = false
                    this.finished = true
                })
                .catch((error) => {
                    console.log(error)
                    console.log('Failed to upload')
                    this.setErrors('upload')
                    this.uploading = false
                    this.error = true
                })
            }
        },
        /** ensure files are uploaded before match docs are pushed to database */
        uploadFilesAsPromise(file) {
            let i = this.matches.findIndex((match) => match.fileInfo.name === file.name)

            return this.$firebase.storage()
            .ref(`replays/${file.name}`)
            .put(file)
            .then((snapshot) => snapshot.ref.getDownloadURL())
            .then((url) => this.matches[i].fileInfo.url = url)
            .catch((error) => {
                console.log(error)
                console.log("Removing file info from match #" + (i+1))
                delete this.matches[i].fileInfo
            })
        },
        /** generates reader for each file */
        readFile(file, i) {
            (function (that, file, i) {
                new Promise(function(resolve, reject) {
                    // check file extension and duplicate issues first
                    if (file.name.substring(file.name.length - 5, file.name.length) !== '.tfhr') {
                        that.setErrors('extension', file.name)
                        reject("File" + file.name + " does not end in a valid TFHR file extension.")
                    } else if (that.matches.find(m => m.file?.name === file.name)) {
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
                    if (that.errors.length > 0)
                        that.error = true
                })
                .catch((error) => {
                    console.log(error)
                    
                    if (that.errors.length > 0)
                        that.error = true
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
                        name: playerNames[0].trim(),
                        character: (this.$characters.find(c => c.devName == characterNames[0])).name
                    },
                    p2: {
                        name: playerNames[1].trim(),
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
                let p1 = this.matches[i].p1
                let p2 = this.matches[i].p2

                if (!p1.name.match(p1Regex) || !p2.name.match(p2Regex) ||
                    p1.character !== players.p1.character || p2.character !== players.p2.character) {
                    this.fileData = players
                    this.formData = {p1: this.matches[i].p1, p2: this.matches[i].p2}
                    this.warning = true
                } else {
                    this.addFile(this.tempData)
                }
            }
        },
        addFile(data) {
            this.$set(this.matches[data.index], 'file', data.file)
            this.$set(this.matches[data.index], 'fileInfo', data.fileInfo)
            
            if (this.warning = true)
                this.closeWarning()

            console.log("File added to match #" + (data.index + 1))
        },
        removeFile(i) {
            console.log("Deleting file from match #" + (i + 1))
            
            // file name string in input field won't update otherwise ?????
            this.matches[i].fileInfo.name = null
            delete this.matches[i].file
            delete this.matches[i].fileInfo
        },
        removeMatch(i) {
            this.matches.splice(i, 1)
        },
        swapMatches(i, j) {
            let temp = this.matches[i]
            this.$set(this.matches, i, this.matches[j])
            this.$set(this.matches, j, temp)
        },
        addBlankMatch(index) {
            let match = {
                p1: {},
                p2: {},
                video: {
                    id: this.video.id,
                    title: this.video.title,
                    timestamp: null,
                }
            }

            if (index) 
                this.matches.splice(index, 0, match)
            else
                this.matches.push(match)
            
        },
        updateCharacter(character, j, i) {
            this.$set(this.matches[i][`p${j + 1}`], 'character', character)
        },
        /** sets errors array for display once files finish being read */
        setErrors(type, file) {
            let index = this.errors.findIndex(e => e.type == type)

            if (index === -1) {
                if (!file)
                    this.errors.push({type: type})
                else 
                    this.errors.push({type: type, files: [file]})
            } else if (file) {
                this.errors[index].files.push(file)
            }
        },
        /**
         * clears errors array
         */
        clearErrors() {
           this.error = false
           this.errors = []
        },
        closeWarning() {
            this.formData = null
            this.fileData = null
            this.tempData = null
            this.warning = false
        },
        resetForm() {
            /*this.$refs.url.resetValidation()
            Object.assign(this.$data, { 
                rules: this.rules,
                ...initializeData(),
            })*/
            this.$emit('reload-form')
        },
    }
}
</script>
