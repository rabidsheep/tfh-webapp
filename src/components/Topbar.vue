<template>
    <v-toolbar dense :light="$vuetify.theme.lightPrimary" :dark="!$vuetify.theme.lightPrimary" color="primary">
        <!-- replace <a> with <router-link> eventually -->
        <router-link to="/">
            <img class="logo" src="../assets/img/pixel/ari.png" />
        </router-link>
        <v-toolbar-title>fortnite gaming</v-toolbar-title>
        <router-link to="/upload"><v-btn icon><v-icon>mdi-plus-box</v-icon></v-btn></router-link>
    </v-toolbar>
</template>