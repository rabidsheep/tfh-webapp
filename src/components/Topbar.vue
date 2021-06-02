<template>
    <v-toolbar dense :light="$vuetify.theme.lightPrimary" :dark="!$vuetify.theme.lightPrimary" color="primary">
        <!-- replace <a> with <router-link> eventually -->
        <a href="/">
            <img class="logo" src="../assets/img/pixel/arizona.png" />
        </a>
        <v-toolbar-title>fortnite gaming</v-toolbar-title>
        <v-btn icon><v-icon>mdi-plus-box</v-icon></v-btn>
    </v-toolbar>
</template>