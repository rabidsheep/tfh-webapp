<template>
    <v-form
    id="files-form"
    class="form"
    ref="form"
    v-model="valid">
        <v-layout
        column
        class="files__wrapper">
            <v-layout
            v-if="matches.length > 0"
            class="files__body"
            column>
                <UploadPreview
                v-for="(match, i) in matches"
                :key="i"
                :index="i"
                v-bind="match"
                :uploading="uploading"
                @remove-file="$emit('remove', $event)" />
            </v-layout>
            <!-- should we allow users to add comments to their uploads? -->

        
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
            </v-layout>
        </v-layout>

        <v-layout
        class="buttons"
        justify-center
        align-center>
            <v-btn
            rounded
            :ripple="false"
            :disabled="matches.length >= uploadLimit"
            @click="selectFiles">
                Upload Files
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
            color = "primary"
            :disabled="!valid || matches.length <= 0"
            @click="submitFiles()">
                Submit
            </v-btn>
        </v-layout>
    </v-form>
</template>

<script>
import UploadPreview from '../components/UploadPreview.vue'

export default {
    components: { UploadPreview },
    name: 'FileUploads',
    props: {
        errors: Array,
        files: Array,
        matches: Array,
        uploadLimit: Number,
        uploading: Boolean,
    },
    data: function() {
        return {
            hidden: true,
            valid: false,
            isSelecting: false,
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
            this.$emit('files-upload')
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
                this.$emit('show-errors', this.errors)
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
                this.setErrors(3, fileName)
            } else if (this.matches.find(m => m.fileName === fileName)) {
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
                    let match = {
                        fileName: fileName,
                        version: result.charCodeAt(146),
                        players: [{
                            name: playerNames[0],
                            character: (this.$characters).find(c => c.devName == characterNames[0])
                        },
                        {
                            name: playerNames[1],
                            character: (this.$characters).find(c => c.devName == characterNames[1])
                        }]
                    }

                    this.$emit('update', {match: match, file: files[i]})
                }
            }

            if (i < files.length - 1) {
                this.readFiles(files, i + 1)
            } else {
                for (let i = 0; i < this.errors.length; i++) {
                    if (this.errors[i].set === true) {
                        this.$emit('show-errors', this.errors)
                        break
                    }
                }
            }
        },
        /** sets errors array for display once files finish being read */
        setErrors(i, file) {
            this.errors[i].set = true

            if (!this.errors[i].files.includes(file)) {
                this.errors[i].files.push(file)
            }
        },
        /**
         * clears errors array
         */
        
    }
}
</script>
