<template>
    <v-overlay v-show="error || uploading || finished">
        <v-container fluid fill-height>
            <v-layout class="status" column justify-center align-center>
                <template v-if="uploading">
                    <h1>Uploading...</h1>

                    <v-progress-linear
                    v-model="progress"
                    height="20px"
                    :buffer-value="100" />

                    <p>
                        <span style="color:green;">{{ succeeded }}</span> | <span style="color:red;">{{ failed }}</span>
                    </p>
                </template>

                <template v-else-if="finished">
                    <!--<v-icon>
                        <template v-if="succeeded > 0">
                            mdi-check-circle
                        </template>

                        <template v-else>
                            mdi-close-circle
                        </template>
                    </v-icon>-->

                    <h1>
                        Upload Finished
                    </h1>

                    <template v-if="succeeded > 0">
                        Uploaded {{ succeeded }} out of {{ matchCount }} {{ matchCount == 1 ? 'match' : 'matches' }}.
                    </template>
                    
                    <template v-if="failed > 0">
                        {{ failed }} {{ failed == 1 ? 'match' : 'matches' }} failed to upload.
                    </template>

                    <v-btn
                    rounded
                    @click="$emit('close')"
                    color="primary">
                        OK
                    </v-btn>
                </template>

                <template v-else-if="error">
                    <h1>Error</h1>

                    <div
                    v-for="(error, i) in errors"
                    :key="i">
                        <template>
                            <br v-if="i < errors.length" />
                            {{ errors.length > 1 ? i + 1 + ') ' : '' }}
                            {{ errorMsg[error.type] }}

                            <ul v-if="error.files && error.files.length > 0">
                                <li
                                v-for="(file, j) in error.files"
                                :key="j">
                                    {{ file }}
                                </li>
                            </ul>
                        </template>
                    </div>

                    <v-btn
                    rounded
                    @click="$emit('clear-errors')"
                    color="primary">
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
        matchCount: Number,
        succeeded: Number,
        failed: Number,
        errors: Array,
        progress: Number,
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
    mounted: function() {

    },
    methods: {}

}
</script>
