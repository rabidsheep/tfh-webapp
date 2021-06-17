<template>
    <v-form v-model="valid">
        <v-container>
            <v-text-field
            v-model="p1Name"
            :rules="nameRules"
            label="Player 1"
            required
            />
            <v-text-field
            v-model="p2Name"
            :rules="nameRules"
            label="Player 2"
            required
            />
        </v-container>
    </v-form>
</template>

<script>
export default ({
    data: () => ({
        valid: false,
        p1Name: '',
        p2Name: '',
        nameRules: [
            v => !!v || 'Required'
        ],
        p1Char: '',
        p2Char: '',
        charRules: [
            v => !!v || 'Required'
        ]
    })
})
</script>
