<template>
    <v-overlay v-show="showOverlay">
        <v-container fluid fill-height>
            <div class="status">
                <div v-if="status.error"
                class="status__error">
                    <h1>Error</h1>

                    <div
                    v-for="(error, i) in errors"
                    :key="i">
                        {{ errors.length > 1 ? `${i+1}) ${errorMsg[error.type]}` : errorMsg[error.type] }}

                        <ul v-if="error.files && error.files.length > 0">
                            <li
                            class="pa-0"
                            v-for="(file, j) in error.files"
                            :key="j">
                                {{ file }}
                            </li>
                        </ul>
                    </div>
                    
                    <v-btn
                    width="50px"
                    rounded
                    @click="$emit('clear-errors')"
                    color="accent">
                        OK
                    </v-btn>
                </div>

                <div v-else-if="status.warning"
                class="status__warning">
                    <div class="heading">
                        <v-icon
                        class="amber--text lighten-3"
                        large>
                            mdi-alert
                        </v-icon>
                        
                        <h1>Warning</h1>

                        <template v-if="type.delete">
                            This will remove every match on this page from the database permanently.

                            Are you sure you want to delete this entire set?
                        </template>

                        <template v-else>
                            There appears to be a mismatch between data pulled from the file and data pulled from the form for this set.
                        </template>
                    </div>

                    <template v-if="type.delete">
                        <v-btn
                        rounded
                        color="button2"
                        @click="$emit('close-warning')">
                            No
                        </v-btn>

                        <v-btn
                        rounded
                        color="accent"
                        @click="$emit('delete-set')">
                            Yes
                        </v-btn>
                    </template>

                    <template 
                    v-else>
                        <div
                        class="data">
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
                                    :title="player.character ? player.character : 'Uknown Character'">
                                        <source
                                        type="image/webp"
                                        :srcset="require(`../assets/img/sel/${player.character ? player.character : 'Any'}.webp`) + ' 136w'" />
                                        <source
                                        type="image/png"
                                        :srcset="require(`../assets/img/sel/${player.character ? player.character : 'Any'}.png`) + ' 136w'" />
                                        <img
                                        :alt="player.character ? player.character : 'Unknown'"
                                        :src="require(`../assets/img/sel/${player.character ? player.character : 'Any'}.webp`)" />
                                    </picture>

                                    <p
                                    class="name"
                                    :title="player.name ? player.name : 'Unknown Player'">
                                        {{ player.name ? player.name : '???' }}
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
                                    :title="player.character ? player.character : 'Unknown'">
                                        <source
                                        type="image/webp"
                                        :srcset="require(`../assets/img/sel/${player.character ? player.character : 'Any'}.webp`) + ' 136w'" />
                                        <source
                                        type="image/png"
                                        :srcset="require(`../assets/img/sel/${player.character ? player.character : 'Any'}.png`) + ' 136w'" />
                                        <img
                                        :alt="player.character ? player.character : 'Unknown'"
                                        :src="require(`../assets/img/sel/${player.character ? player.character : 'Any'}.webp`)" />
                                    </picture>

                                    <p
                                    class="name"
                                    :title="player.name ? player.name : 'Unknown Player'">
                                        {{ player.name ? player.name : '???' }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    

                        <v-btn
                        @click="$emit('close-warning')"
                        rounded
                        color="button2">
                            Oops! Don't Add That!
                        </v-btn>

                        <v-btn
                        @click="$emit('add-file-anyways')"
                        rounded
                        color="accent">
                            Add File Anyways
                        </v-btn>
                    </template>

                </div>

                <div v-else-if="status.loading"
                class="status__uploading">
                    <h1>{{ loadingMessage }}</h1>

                    <v-progress-linear
                    color="accent"
                    indeterminate />
                </div>

                <div v-else-if="status.finished"
                class="status__finished">
                    <div class="heading">
                        <v-icon
                        class="green--text lighten-2"
                        large>
                            mdi-check-circle
                        </v-icon>

                        <h1>
                            {{ finishedMessage }}
                        </h1>
                    </div>

                    <v-btn
                    v-if="type.delete"
                    rounded
                    @click="$emit('return-home')"
                    color="accent">
                        Return to Main Page
                    </v-btn>

                    <v-btn
                    v-else
                    width="50px"
                    rounded
                    @click="$emit('close')"
                    color="accent">
                        OK
                    </v-btn>
                </div>
            </div>
        </v-container>
    </v-overlay>
</template>

<script>
export default {
    name: 'StatusOverlay',
    props: {
        errors: Array,
        fileData: Object,
        formData: Object,
        status: Object,
        type: Object,
        showOverlay: Boolean,
    },
    data: () => {
        return {
            errorMsg: {
                limit: 'The amount of matches added exceeds the upload limit.',
                parse: 'The following files could not be parsed:',
                upload: 'Failed to upload matches.',
                setDelete: 'Failed to delete set.',
                extension: 'The following files use an invalid extension:',
                duplicate: 'The following files have already been selected:',
            },
        }
    },
    computed: {
        loadingMessage: function() {
            switch (true) {
                case this.type.upload:
                    return "Uploading matches..."
                case this.type.update:
                    return "Updating matches..."
                case this.status.delete:
                    return "Deleting matches..."
            }
        },
        finishedMessage: function() {
            switch (true) {
                case this.type.upload:
                    return "Matches Uploaded"
                case this.type.update:
                    return "Matches Updated"
                case this.type.delete:
                    return "Set Deleted"
            }
        }
    }
}
</script>
