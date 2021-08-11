<template>
    <v-toolbar style="width: 100%;" dense :light="$vuetify.theme.lightPrimary" :dark="!$vuetify.theme.lightPrimary" color="primary">
        <!-- replace <a> with <router-link> eventually -->
        <a href="/">
            <img class="logo" src="../assets/img/pixel/1.png" />
        </a>
        <v-toolbar-title>fortnite gaming</v-toolbar-title>
        <router-link to="/upload"><v-btn icon><v-icon>mdi-plus-box</v-icon></v-btn></router-link>
    </v-toolbar>
</template>
