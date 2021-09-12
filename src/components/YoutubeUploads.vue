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
        @close="$emit('reload-form')" />

        <v-row
        class="url__input">
            <v-text-field
            class="url clearable"
            ref="url"
            label="YouTube Link"
            v-model="url"
            prepend-icon="mdi-youtube"
            hide-details
            clearable
            required
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
                @click="!changeButton ? validateYoutubeID() : undefined">
                    <template v-if="!changeButton">
                        Go
                    </template>

                    <v-icon v-else>
                    {{ hasVideo ? 'mdi-check-bold' : 'mdi-close-thick' }}
                    </v-icon>
                </v-btn>
            </div>
        </v-row>

        
        <template v-if="!loading">
            <template v-if="invalidId">
                No video found under ID '{{ vid }}'
            </template>

            <div
            v-if="Object.keys(video).length"
            class="video"
            column
            justify-center
            align-center>
                <template v-if="Object.keys(video).length > 0">
                    <v-row
                    class="data">
                        <v-col
                        :cols="$vuetify.breakpoint.smAndDown ? 12 : undefined"
                        :class="$vuetify.breakpoint.smAndDown ? `title pa-0` : `title pa-0 mr-2`">
                            <v-text-field
                            class="video__title"
                            label="Video Title"
                            v-model="video.title"
                            readonly
                            disabled />
                        </v-col>

                        <v-col
                        :class="$vuetify.breakpoint.smAndDown ? `channel pa-0 mr-2` : `channel pa-0 mx-2`"
                        :cols="$vuetify.breakpoint.smAndDown ? undefined : 2">
                            <v-text-field
                            class="video__channel"
                            label="Uploaded By"
                            v-model="channel.name"
                            readonly
                            disabled />
                        </v-col>

                        <v-col
                        class="date pa-0 ml-2"
                        :cols="$vuetify.breakpoint.smAndDown ? undefined : 3">
                            <v-text-field
                            class="video__date"
                            label="Date Uploaded"
                            v-model="video.date"
                            prepend-icon="mdi-calendar"
                            readonly
                            disabled />
                        </v-col>
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
                        @click="resetTimestamps()">
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
            v-show="parsed"
            ref="form"
            class="form"
            v-model="valid">
                <v-row
                v-show="currentDescription"
                class="group-info pa-0"
                justify="center">
                    <v-col
                    :cols="$vuetify.breakpoint.smAndDown ? 12 : undefined"
                    :class="$vuetify.breakpoint.smAndDown ? `title pa-0 mb-2` : `title pa-0 mr-2`">
                        <v-text-field
                        class="title__input clearable"
                        ref="groupTitle"
                        label="Group Title"
                        placeholder="(ex: Rodeo Regional, Grand Stampede)"
                        v-model="group.title"
                        hint="Required"
                        persistent-hint
                        maxLength="32"
                        clearable
                        required
                        :rules="rules.group" />
                    </v-col>

                    <v-col
                    :class="$vuetify.breakpoint.smAndDown ? `part pa-0 mr-2` : `part pa-0 mx-2`"
                    :cols="$vuetify.breakpoint.smAndDown ? undefined : 2">
                        <v-text-field
                        class="part__input clearable"
                        ref="groupPart"
                        label="Part"
                        v-model="group.part"
                        placeholder="(ex: #3, Finals, etc.)"
                        maxLength="16"
                        hint="Optional"
                        persistent-hint
                        clearable />
                    </v-col>

                    <v-col
                    class="date pa-0 ml-2"
                    :cols="$vuetify.breakpoint.smAndDown ? undefined : 3">
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
                                ref="groupDate"
                                label="Date"
                                placeholder="MM-DD-YYYY"
                                v-model="group.date"
                                v-bind="attrs"
                                v-on="on"
                                prepend-icon="mdi-calendar"
                                hint="Required"
                                persistent-hint
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
                    </v-col>
                </v-row>

                <div
                v-show="!loading && matches.length > 0"
                class="match-list">
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
                        :hasVideo="true"
                        :currentTimestamp="match.video ? match.video.timestamp : null"
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
                            color="button2"
                            rounded
                            @click="addBlankMatch(i+1)">
                                <v-icon
                                left
                                color="accent">
                                    mdi-plus-thick
                                </v-icon>
                                <template v-if="i < matches.length - 1">
                                    Insert Match Here
                                </template>
                                
                                <template v-else>
                                    Add Match
                                </template>
                            </v-btn>

                            <hr />
                        </div>
                    </template>
                </div>

                
                <div v-show="matches.length <= 0 && parsed">
                    No matches found!
                </div>
                
                <div class="buttons">

                    <v-btn
                    v-show="parsed && matches.length <= 0"
                    height="50px"
                    color="button2"
                    rounded
                    :ripple="false"
                    @click="addBlankMatch()">
                        <v-icon
                        left
                        color="accent">
                            mdi-plus-thick
                        </v-icon>
                        Add Match
                    </v-btn>

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
import uploadMixin from '../mixins/uploadMixin'
// youtube test video url: https://www.youtube.com/watch?v=uciAaVk3xaE

export default {
    components: {
        Preview,
        StatusOverlay
    },
    props: {
        userId: String,
    },
    mixins: [uploadMixin],
    name: 'YoutubeUploads',
    data: () => {
        return {
            currentDescription: null,
            parsed: false,
            invalidId: false,
            matches: [],
            files: [],
            timestamp: null,
            rules: {
                name: [
                    v => !!v
                ],
                url: [
                    v => !!v,
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
        if (this.$dev)
            this.url = 'https://www.youtube.com/watch?v=uciAaVk3xaE';
    },
    watch: {
        'date': function(date) {
            this.group.date = this.formatDate(date);
        },
    },
    methods: {
        validateYoutubeID() {
            this.loading = true;
            this.vid = this.url.match(this.$regex.ytId)[1];
            this.video = {};
            let youtubeRef;

            if (this.$dev) {
                youtubeRef = this.$youtubeData.get({ id: this.vid });
            } else {
                youtubeRef = this.setAuthToken(() => console.log('Retrieving Youtube data'))
                .then(() => this.$youtubeData.get({ id: this.vid }));
            }

            youtubeRef.then((response) => {
                this.hasVideo = true;
                this.changeVerifyBtn();

                this.invalidId = false;
                this.video = response.body.video;
                this.channel = response.body.channel;
                this.currentDescription = this.video.description;
                this.group.date = this.video.date;

                this.parseVideoDescription(this.currentDescription);

                // only way to get required input fields
                // to highlight themselves????
                this.validateForm();
                this.loading = false;
                this.error = false;
            })
            .catch((error) => {
                console.log(error);
                this.hasVideo = false;
                this.changeVerifyBtn();

                this.invalidId = true;
                this.loading = false;
            });
            
        },

        parseVideoDescription(desc) {
            this.matches = [];
            let lines = desc.split('\n');
            let tsPattern = /(?:([0-9]{1,2})(?:h|:))?([0-9]{1,2})(?:m|:)([0-9]{1,2})(?:s)?\s+(.*)/i;
            lines.forEach((line) => {
                if (line) {
                    let matched = line.match(tsPattern);
                    
                    if (matched) {
                        let hours = matched[1] ? matched[1] : '00';
                        let minutes = matched[2];
                        let seconds = matched[3];
                        let times = [hours, minutes, seconds];
                        for (let i = 0; i < 3; i++) {
                            while (times[i].length < 2) {
                                times[i] = `0${times[i]}`;
                            }
                        }
                        let timestamp = `${times[0]}h${times[1]}m${times[2]}s`;
                        let players = matched[4];
                        let playersPattern = /\s*(.*)\s+\(\s*(.*)\s*\)\s+vs.?\s+(.*)\s+\(\s*(.*)\s*\)\s*/i;
                        if (players.match(playersPattern)) {
                            let matched = players.match(playersPattern);
                            
                            let match = {
                                p1: {
                                    name: matched[1].trim(),
                                    character: (this.$characters.find(c => c.alias.includes(matched[2]))?.name)
                                },
                                p2: {
                                    name: matched[3].trim(),
                                    character: (this.$characters.find(c => c.alias.includes(matched[4]))?.name)
                                },
                                video: {
                                    id: this.video.id,
                                    title: this.video.title,
                                    timestamp: timestamp,
                                }
                            };
                            
                            this.matches.push(match);
                        };
                    };
                };
            });

            this.parsed = true;
        },

        resetTimestamps() {
            this.currentDescription = this.video.description;
            this.parseVideoDescription(this.currentDescription);
        },

        /** upload youtube-only object */
        youtubeUpload() {
            this.uploading = true;
            let files = [];
            let uploadRef;
            
            // add files to file array
            this.matches.forEach((match) => {
                if (match.file) {
                    files.push(match.file);
                    delete match.file;
                };
            });

            if (this.$dev || files.length <= 0) {
                // dev environment OR no files added to matches
                uploadRef = Promise.all(this.formatMatchesForUpload())
                .then((matches) => this.$matches.save({matches}));
            } else {
                // production mode & files added to matches
                uploadRef = Promise.all(this.uploadFilesAsPromise(files))
                .then(() => Promise.all(this.formatMatchesForUpload()))
                .then((matches) => this.$matches.save({matches}));
            };
            
            uploadRef.then((response) => {
                console.log('Uploaded matches:');
                response.body.matchIds.forEach((id) => console.log('ID:', id));
                this.uploading = false;
                this.finished = true;
            })
            .catch((error) => {
                console.log(error);
                console.log('Failed to upload');
                this.setErrors('upload');
                this.uploading = false;
                this.error = true;
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
                    console.log("Removing file info from match #" + (i+1));
                    delete this.matches[i].fileInfo;
                });
            });
        },

        formatMatchesForUpload() {
            let time = new Date().toISOString().split('T');
            let order = 0;
            let general = {
                userId: this.userId,
                uploadForm: 'YouTube',
                type: 'Group',
                matchDate: this.group.date,
                uploadDate: time[0],
                uploadTime: time[1],
                group: this.group,
                channel: this.channel,
            };

            return this.matches.map((match) => {
                match = {
                    ...general,
                    ...match,
                    order: order,
                    video: {
                        id: this.video.id,
                        title: this.video.title,
                        timestamp: match.video.timestamp
                    },
                };

                order += 1;
                return match;
            });
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
                this.setErrors('parse', file.name);
                this.error = true;
            } else {
                let players = {
                    p1: {
                        name: playerNames[0].trim(),
                        character: (this.$characters.find(c => c.alias[0] == characterNames[0])).name
                    },
                    p2: {
                        name: playerNames[1].trim(),
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
                let p1 = this.matches[i].p1;
                let p2 = this.matches[i].p2;

                if (!p1.name?.match(p1Regex) || !p2.name?.match(p2Regex) ||
                    p1.character !== players.p1.character || p2.character !== players.p2.character) {
                    this.fileData = players;
                    this.formData = {p1: this.matches[i].p1, p2: this.matches[i].p2};
                    this.warning = true;
                } else {
                    this.addFile(this.tempData);
                };
            };
        },

        addFile(data) {
            this.$set(this.matches[data.index], 'file', data.file);
            this.$set(this.matches[data.index], 'fileInfo', data.fileInfo);
            
            if (this.warning = true)
                this.closeWarning();

            console.log("File added to match #" + (data.index + 1));
        },

        removeFile(i) {
            console.log("Deleting file from match #" + (i + 1));
            
            // file name string in input field won't update otherwise ?????
            this.matches[i].fileInfo.name = null;
            delete this.matches[i].file;
            delete this.matches[i].fileInfo;
        },

        removeMatch(i) {
            this.matches.splice(i, 1);
        },

        swapMatches(i, j) {
            let temp = this.matches[i];
            this.$set(this.matches, i, this.matches[j]);
            this.$set(this.matches, j, temp);
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
            };

            if (index) 
                this.matches.splice(index, 0, match);
            else
                this.matches.push(match);

            this.validateForm();
            
        },

        closeWarning() {
            this.formData = null;
            this.fileData = null;
            this.tempData = null;
            this.warning = false;
        },
    }
}
</script>