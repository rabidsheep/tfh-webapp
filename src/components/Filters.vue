<template>
    <v-layout id="filter">
        <v-btn id="filter-toggle" @click="hidden = !hidden">{{ hidden ? 'Show filters' : 'Hide filters'}}</v-btn>
        <v-expand-transition>
            <div id="search" v-show="!hidden">
                <v-layout filters :column="$vuetify.breakpoint.xsOnly">
                    <!-- player filters -->
                    <v-layout pfilter v-for="i in [0, 1]" :key=i :reverse="i === 0 && !$vuetify.breakpoint.xsOnly"> 
                        <div :style="!$vuetify.breakpoint.xsOnly ? `padding-left: 20px; padding-right: 20px;` : `padding-right: 10px;` ">
                            <CharacterSelect
                            :ripple = "false"
                            :selectedChar="playerInfo[i].characters"
                            :index="i"
                            @character-select="selectCharacter($event, i)"/>
                        </div>

                        <!-- player select -->
                      <div style="width:100%;">
                        <v-combobox
                                clearable
                                append-icon=""
                                v-model="playerInfo[i].name"
                                :menu-props="{bottom: true, offsetY: true}"
                                :label="`Player ${i + 1}`"
                                :items="players"
                                :search-input.sync="search[i]"
                                @change = "selectPlayers"
                            >
                            <template v-slot:no-data>
                                <v-list-item>
                                <v-list-item-content>
                                    <v-list-item-title>
                                        No results matching "<strong>{{ search[i] }}</strong>".
                                    </v-list-item-title>
                                </v-list-item-content>
                                </v-list-item>
                            </template>
                        </v-combobox>
                        </div>

                        <!-- /player select-->
                    </v-layout>
                    <!-- /player filters -->

                    <v-flex v-if="$vuetify.breakpoint.smAndUp">
                        <div class="vstxt">vs.</div>
                    </v-flex>
                </v-layout>
            </div>
        </v-expand-transition>
    </v-layout>
</template>

<script>
import CharacterSelect from './CharacterSelect.vue';

function initialState () {
    return {
        hidden: false,
        showToTop: false,
        playerInfo: [
            {name: null, characters: {name: 'Any Character', devName: '', id: 0}},
            {name: null, characters: {name: 'Any Character', devName: '', id: 0}}
        ],
        players: ["player 1", "player 2", "player 3", "player 4"],
        search: [null, null],
    }
}

export default {
  components: { CharacterSelect },
    name: 'Filters',
    props: {
        query: Object
    },
    data: function(){
        return initialState();
    },
    methods: {
        selectCharacter: function (character, index) {
            this.$set(this.playerInfo[index], 'characters', JSON.parse(JSON.stringify(character)));
            console.log(JSON.parse(JSON.stringify(this.playerInfo))); 
        },
        selectPlayers() {
            console.log(JSON.parse(JSON.stringify(this.playerInfo)));
        }
    }
}
</script>


<style scoped>
.v-input >>> .v-input__slot::before {
    border-color: #b21d45 !important;
  }

.v-input >>> .v-input__slot::after {
    border-color: #d29da0 !important;
}

#search >>> .v-btn {
    border: none;
    border-radius: 0px;
    width: 100%;
}
</style>
