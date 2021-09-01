<template>
    <v-overlay v-show="error || warning || uploading || finished">
        <v-container fluid fill-height>
            <v-layout class="status" column justify-center align-center>
                <template v-if="uploading">
                    <h1>Uploading...</h1>

                    <br />

                    <v-progress-linear
                    color="accent"
                    indeterminate />
                </template>

                <template v-else-if="finished">
                    <v-icon
                    class="green--text lighten-2"
                    large>
                        mdi-check-circle
                    </v-icon>

                    <h1>
                        Upload Finished
                    </h1>

                    <v-btn
                    rounded
                    @click="$emit('close')"
                    color="accent">
                        OK
                    </v-btn>
                </template>

                <template v-else-if="error">
                    <h1>Error</h1>
                    
                    <div><br /></div>

                    <div
                    v-for="(error, i) in errors"
                    :key="i">
                        
                        <template v-if="error.type === 'limit'">
                            <center>
                                {{ errors.length > 1 ? i + 1 + ') ' : '' }}
                                {{ errorMsg[error.type] }}
                            </center>
                        </template>

                        <template v-else>
                            <center>
                                {{ errors.length > 1 ? i + 1 + ') ' : '' }}
                                {{ errorMsg[error.type] }}
                                

                                <ul v-if="error.files && error.files.length > 0">
                                    <li
                                    v-for="(file, j) in error.files"
                                    :key="j">
                                        {{ file }}
                                    </li>
                                </ul>
                            </center>
                        </template>

                        <br />
                    </div>
                    
                    <v-btn
                    rounded
                    @click="$emit('clear-errors')"
                    color="accent">
                        OK
                    </v-btn>
                </template>

                <template v-else-if="warning">
                    <v-icon
                    class="amber--text lighten-3"
                    large>
                        mdi-alert
                    </v-icon>

                    <h1>Warning</h1>

                    <v-row class="data">
                        Player info pulled from the file does not seem to match what is currently set for this match.
                        <v-col
                        class="data__inner file-data"
                        :cols="$vuetify.breakpoint.xsOnly? 4: 5">
                            <h4>File Data:</h4>

                            <v-col
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
                            </v-col>
                        </v-col>

                        <v-divider vertical />
                        
                        
                        <v-col
                        class="data__inner your-data"
                        :cols="$vuetify.breakpoint.xsOnly? 4 : 5">
                            <h4>Your Data:</h4>
                            <v-col
                            v-for="(player, i) in [yourData.p1, yourData.p2]"
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
                            </v-col>
                        </v-col>
                    </v-row>
                    

                    <v-btn
                    rounded
                    @click="$emit('close-warning')"
                    color="button1">
                        Oops! Don't Add That
                    </v-btn>

                    <v-btn
                    rounded
                    @click="$emit('add-file-anyways')"
                    color="accent">
                        Add File Anyways
                    </v-btn>
                </template>
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
        yourData: Object,
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
