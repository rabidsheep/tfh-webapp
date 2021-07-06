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
            {name: '', characters: {name: 'Any Character', devName: '', id: 0}},
            {name: '', characters: {name: 'Any Character', devName: '', id: 0}}
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
    /*mounted: function() {
        this.getMatches(this.query)
        this.loadCharacters()
        this.loadPlayers()
        this.loadVersions()
        this.loadChannels()
    },*/
    /*watch: {
        selectedPlayers: function (player) {
            let query = Object.assign({}, this.query)
            for (let i = 0; i < 2; i++) {
                if (player[i]) {
                query[`p${i + 1}`] = player[i]
                } else {
                delete query[`p${i + 1}`]
                }
            }
            delete query.page
            this.$router.push({ path: '/', query: query })
        },
        '$route.query': function (query) {
            this.query = query
        },
        title: function (title) {
            let query = Object.assign({}, this.query)
            query.title = title
            delete query.page
            this.$router.push({ path: '/', query: query })
        },
        page: function (page) {
            let query = Object.assign({}, this.query)
            query.page = page
            this.$router.push({ path: '/', query: query })
        },
        query: function (query) {
            this.updateSelectedPlayers()
            this.updateSelectedCharacters()
            this.getMatches(query)
            this.page = query.page || 1
        }
    },*/
    methods: {
        /*updateSelectedCharacters: function () {
            for (let i = 0; i < 2; i++) {
                if (this.query[`p${i + 1}chars`]) {
                    let queryCharacters = this.query[`p${i + 1}chars`].split(',')
                    this.selectedCharacters[i] = this.characters[queryCharacters[0]]
                } else {
                    this.selectedCharacters[i] = []
                }
            }
        },*/
        selectCharacter: function (character, index) {
            /*let characterQuery = ''
            if (this.query[`p${playerNumber}chars`]) {
                let characters = this.query[`p${playerNumber}chars`].split(',')
                characters[characterPosition - 1] = characterId
                characterQuery = characters.filter((character) => character).join(',')
            } else {
                characterQuery = characterId
            }
            let query = Object.assign({}, this.query)
            query[`p${playerNumber}chars`] = characterQuery
            delete query.page
            this.$router.push({ path: '/', query: query })*/
            this.$set(this.playerInfo[index], 'characters', JSON.parse(JSON.stringify(character)));
            console.log(JSON.parse(JSON.stringify(this.playerInfo))); 
        },
        selectPlayers() {
            console.log(JSON.parse(JSON.stringify(this.playerInfo)));
        }
        /*loadPlayers: function () {
            this.$players.get()
                .then((response) => {
                response.body.forEach((player) => {
                    player.aliases.forEach((alias) => {
                    this.players.push(alias)
                    })
                })
                this.players.sort()
                this.updateSelectedPlayers()
                })
        },
        updateSelectedPlayers: function () {
            for (let i = 0; i < 2; i++) {
                if (this.query[`p${i + 1}`]) {
                this.selectedPlayers[i] = this.query[`p${i + 1}`]
                } else {
                this.selectedPlayers[i] = undefined
                }
            }
        },
        getMatches: function (query) {
            this.loading = true
            return this.$matches.get(query)
                .then((response) => {
                this.loading = false
                if (response.ok) {
                    this.error = false
                    this.matches = response.body.matches
                    this.resultsCount = response.body.count
                } else {
                    this.error = true
                    this.errorMessage = `${response.status}: ${response.statusText}`
                }
                })
        },
        onScroll: function (event) {
            this.showToTop = event.currentTarget.scrollY >= 250
        }*/
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
