<template>
    <v-layout id="filter">
        <v-btn id="filter-toggle" @click="hidden = !hidden">{{ hidden ? 'Show filters' : 'Hide filters'}}</v-btn>
        <v-expand-transition>
            <div id="search" v-show="!hidden">
                <v-layout filters :column="$vuetify.breakpoint.xsOnly">
                    <!-- player filters -->
                    <v-flex column pfilter v-for="i in [1, 2]" :key=i>
                        <!-- player name -->
                        <v-autocomplete
                            hide-no-data
                            clearable
                            append-icon=""
                            :menu-props="{bottom: true, offsetY: true}"
                            :label="`Player ${i}`"
                            :items="players"
                        />
                        <!-- player character -->
                        <v-autocomplete
                            hide-no-data
                            clearable
                            :menu-props="{bottom: true, offsetY: true}"
                            label="Character"
                            :items="characters"
                        />
                    </v-flex>
                    <!-- /player filters -->

                    <v-flex v-if="$vuetify.breakpoint.smAndUp">
                        <div class="ma-1 vstxt">vs.</div>
                    </v-flex>
                </v-layout>
            </div>
        </v-expand-transition>
    </v-layout>
</template>

<script>
export default {
    name: 'Filters',
    props: {
        showCompatible: Boolean,
        filters: [{
            p1: [{ name: [String, null], character: [String, null] }],
            p2: [{ name: [String, null], character: [String, null] }]
        }]
    },
    data: () => {
        return {
            hidden: false,
            showToTop: false,
            characters: [
                'Arizona',
                'Oleander',
                'Paprika',
                'Pom',
                'Shanty',
                'Tianhuo',
                'Velvet'
            ],
            players: [],
        }
    }
}
</script>


<style scoped>
#filter-toggle .v-btn >>> .v-btn__content {
      justify-content: left;
}


.v-input >>> .v-input__slot::before {
    border-color: #b21d45 !important;
  }

.v-input >>> .v-input__slot::after {
    border-color: #d29da0 !important;
}

.v-btn {
    border-radius: 0px;
    width: 100%;
    text-align: left;
    border: 1px solid black;
}
</style>
