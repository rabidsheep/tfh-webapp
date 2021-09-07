<template>
    <v-overlay v-show="error || warning || uploading || finished">
        <v-container fluid fill-height>
            <v-layout class="status" justify-center align-center>
                <div 
                v-if="uploading"
                class="status__uploading">
                    <h1>Uploading...</h1>

                    <v-progress-linear
                    color="accent"
                    indeterminate />
                </div>

                <div
                v-else-if="finished"
                class="status__finished">
                    <div class="heading">
                        <v-icon
                        class="green--text lighten-2"
                        large>
                            mdi-check-circle
                        </v-icon>

                        <h1>
                            Upload Finished
                        </h1>
                    </div>

                    <v-btn
                    width="50px"
                    height="40px"
                    rounded
                    @click="$emit('close')"
                    color="accent">
                        OK
                    </v-btn>
                </div>

                <div
                v-else-if="error"
                class="status__error">
                    <h1>Error</h1>

                    <div
                    v-for="(error, i) in errors"
                    :key="i">
                        <center v-if="error.type === 'limit'">
                            {{ errors.length > 1 ? i + 1 + ') ' : '' }}
                            {{ errorMsg[error.type] }}
                        </center>

                        <center v-else>
                            {{ errors.length > 1 ? i + 1 + ') ' : '' }}
                            {{ errorMsg[error.type] }}
                            

                            <ul v-if="error.files && error.files.length > 0">
                                <li
                                class="pa-0"
                                v-for="(file, j) in error.files"
                                :key="j">
                                    {{ file }}
                                </li>
                            </ul>
                        </center>
                    </div>
                    
                    <v-btn
                    width="50px"
                    height="40px"
                    rounded
                    @click="$emit('clear-errors')"
                    color="accent">
                        OK
                    </v-btn>
                </div>


                <div
                v-else-if="warning"
                class="status__warning">
                    <div class="heading">
                        <v-icon
                        class="amber--text lighten-3"
                        large>
                            mdi-alert
                        </v-icon>
                        
                        <h1>Warning</h1>

                        There appears to be a mismatch between data pulled from the file and data pulled from the form for this set.
                    </div>

                    <div class="data">
                        <div
                        class="data__inner form-data"
                        :cols="$vuetify.breakpoint.xsOnly? 4 : 5">
                            <h4>Form Data:</h4>
                            <div
                            v-for="(player, i) in [formData.p1, formData.p2]"
                            :class="`player p${i+1}`"
                            :cols="12"
                            :key="i">
                                <picture
                                class="character-icon"
                                :title="player.character"
                                @click="$emit('update-character', {character: player.character, index: i})">
                                    <source
                                    type="image/webp"
                                    :srcset="require(`../assets/img/sel/${player.character}.webp`) + ' 136w'" />
                                    <source
                                    type="image/png"
                                    :srcset="require(`../assets/img/sel/${player.character}.png`) + ' 136w'" />
                                    <img
                                    :alt="player.character"
                                    :src="require(`../assets/img/sel/${player.character}.webp`)" />
                                </picture>

                                <p
                                class="name"
                                :title="player.name"
                                @click="$emit('update-name', {name: player.name, index: i})">
                                    {{ player.name }}
                                </p>
                            </div>
                        </div>

                        <v-divider vertical />
                        
                        <div
                        class="data__inner file-data"
                        :cols="$vuetify.breakpoint.xsOnly? 4: 5">
                            <h4>File Data:</h4>

                            <div
                            v-for="(player, i) in [fileData.p1, fileData.p2]"
                            :class="`player p${i+1}`"
                            :cols="12"
                            :key="i">
                                <picture
                                class="character-icon"
                                :title="player.character"
                                @click="$emit('update-character', {character: player.character, index: i})">
                                    <source
                                    type="image/webp"
                                    :srcset="require(`../assets/img/sel/${player.character}.webp`) + ' 136w'" />
                                    <source
                                    type="image/png"
                                    :srcset="require(`../assets/img/sel/${player.character}.png`) + ' 136w'" />
                                    <img
                                    :alt="player.character"
                                    :src="require(`../assets/img/sel/${player.character}.webp`)" />
                                </picture>

                                <p
                                class="name"
                                :title="player.name"
                                @click="$emit('update-name', {name: player.name, index: i})">
                                    {{ player.name }}
                                </p>
                            </div>
                        </div>
                    </div>
                    

                    <div class="buttons">
                        <v-btn
                        width="140px"
                        height="50px"
                        rounded
                        @click="$emit('close-warning')"
                        color="button2">
                            Oops! Don't Add That
                        </v-btn>

                        <v-btn
                        rounded
                        width="140px"
                        height="50px"
                        @click="$emit('add-file-anyways')"
                        color="accent">
                            Add File Anyways
                        </v-btn>
                    </div>
                </div>
            </v-layout>
        </v-container>
    </v-overlay>
</template>

<script>
export default {
    name: 'StatusOverlay',
    props: {
        error: Boolean,
        uploading: Boolean,
        finished: Boolean,
        warning: Boolean,
        errors: Array,
        fileData: Object,
        formData: Object,
    },
    data: () => {
        return {
            errorMsg: {
                limit: 'The amount of files selected exceeds the upload limit.',
                parse: 'The following files could not be parsed:',
                upload: 'The following files could not be uploaded:',
                extension: 'The following files use an invalid extension:',
                duplicate: 'The following files have already been selected:',
            }
        }
    },
}
</script>
