<template>
    <v-overlay v-show="error || uploading || finished">
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
                    :class="succeeded > 0 ? ( failed > 0 ? 'amber--text lighten-3' : 'green--text lighten-2') : 'red--text lighten-2'"
                    large>
                        <template v-if="succeeded > 0 && failed === 0">
                            mdi-check-circle
                        </template>

                        <template v-else-if="succeeded > 0 && failed > 0">
                            mdi-alert
                        </template>

                        <template v-else-if="succeeded === 0 && failed > 0">
                            mdi-close-circle
                        </template>
                    </v-icon>

                    <h1>
                        Upload Finished
                    </h1>

                    <center v-show="succeeded > 0">
                    Successfully uploaded {{ succeeded }} {{ succeeded === 1 ? 'match' : 'matches' }}.
                    </center>

                    <center v-show="failed > 0">
                    Failed to upload {{ failed }} {{ failed === 1 ? 'match' : 'matches' }}.
                    </center>

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
        succeeded: Number,
        failed: Number,
        errors: Array,
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
