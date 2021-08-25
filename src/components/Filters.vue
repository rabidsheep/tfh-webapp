<template>
    <v-layout id="filters" style="position:relative;">
        <v-btn
        id="filters__toggle"
        @click="hidden = !hidden">
            {{ hidden ? 'Show filters' : 'Hide filters'}}
        </v-btn>

        <v-expand-transition>
            <v-container
            id="filters__main"
            v-show="!hidden">
                <v-row
                justify="center"
                align="center"
                class="wrapper">
                    <!-- player filters -->
                    <v-row
                    class="players"
                    align="center"
                    justify="center"> 
                        <v-col
                        :class="`player p${i + 1}`"
                        v-for="(player, i) in playersFilter"
                        :key="i"
                        :cols="$vuetify.breakpoint.smAndDown ? 12 : 5"> 
                            <CharacterSelect
                            :currentCharacter="player.character? player.character : null"
                            :selectionEnabled="true"
                            :anyEnabled="true"
                            @character-select="selectCharacter($event, i)"/>

                            <v-combobox
                            clearable
                            v-model="player.name"
                            append-icon=""
                            :menu-props="{
                                contentClass: 'player-select-menu',
                                bottom: true,
                                offsetY: true,
                                maxHeight: '200'
                                }"
                            :hide-no-data="!playerSearch[i]"
                            :label="`Player ${i + 1}`"
                            :items="playerList"
                            :search-input.sync="playerSearch[i]"
                            :reverse="i === 0 && !$vuetify.breakpoint.smAndDown"
                            counter="64"
                            @change="selectPlayer(player.name, i)">
                                <template v-slot:no-data>
                                    <v-list-item>
                                        <v-list-item-content>
                                            <v-list-item-title>
                                                No results matching "<strong>{{ playerSearch[i] }}</strong>".
                                            </v-list-item-title>
                                        </v-list-item-content>
                                    </v-list-item>
                                </template>
                            </v-combobox>
                        </v-col>
                        

                        <v-col
                        class="btns"
                        :cols="$vuetify.breakpoint.smAndDown ? 12 : 1">
                            <v-col
                            class="swap"
                            cols="12">
                                <v-btn
                                :disabled="!strict"
                                color="accent"
                                @click="$emit('swap')">
                                    <v-icon>
                                        {{ $vuetify.breakpoint.mdAndUp ?
                                        'mdi-swap-horizontal' :
                                        'mdi-swap-vertical' }}
                                    </v-icon>
                                </v-btn>
                            </v-col>
                        </v-col>

                        <v-row
                        class="strictness mt-3 mb-5"
                        justify="center">
                            <v-switch
                            color="accent"
                            v-model="strictFilter"
                            class="checkbox"
                            label="Strict Player Sides"
                            value
                            @change="$emit('update-strictness', $event)"
                            hide-details/>
                        </v-row>
                    </v-row>
                    <!-- /player filters -->

                    <!-- tournament filters -->
                    <v-row
                    justify="center"
                    class="tournaments">
                        <v-col
                        class="type"
                        :cols="$vuetify.breakpoint.smAndUp ?
                        ($vuetify.breakpoint.smOnly ? 12 : 3) :
                        12">
                            <v-select
                            clearable
                            v-model="typeFilter"
                            :items="typeSelect"
                            label="Category"
                            @change="$emit('update-type', $event)"
                            dense />
                        </v-col>

                        <v-col
                        class="tournament__name"
                        :cols="$vuetify.breakpoint.smAndUp ?
                        ($vuetify.breakpoint.smOnly ? 5 : 4) :
                        9">
                            <v-combobox
                            clearable
                            :disabled="type !== 'Tournament'"
                            v-model="tournamentFilter.name"
                            append-icon=""
                            :menu-props="{
                                contentClass: 'tournament-select-menu',
                                bottom: true,
                                offsetY: true,
                                maxHeight: '200'
                                }"
                            dense
                            label="Tournament"
                            :hide-no-data="!tournamentSearch"
                            :items="tournamentList"
                            item-text="_id"
                            item-value="_id"
                            :return-object="false"
                            :search-input.sync="tournamentSearch"
                            @change="updateNum()">
                                <template v-slot:no-data>
                                    <v-list-item>
                                        <v-list-item-content>
                                            <v-list-item-title>
                                                No results matching "<strong>{{ tournamentSearch }}</strong>".
                                            </v-list-item-title>
                                        </v-list-item-content>
                                    </v-list-item>
                                </template>
                            </v-combobox>
                        </v-col>

                        <v-col
                        class="tournament__num"
                        :cols="$vuetify.breakpoint.smAndUp ?
                        ($vuetify.breakpoint.smOnly ? 2 : 1) :
                        3">
                            <v-combobox
                            clearable
                            v-model="tournamentFilter.num"
                            append-icon=""
                            :menu-props="{
                                contentClass: 'tournament-num-select-menu',
                                bottom: true,
                                offsetY: true,
                                maxHeight: '200'
                                }"
                            dense
                            label="No."
                            :hide-no-data="!numSearch"
                            :items="numList"
                            item-text="num"
                            item-value="num"
                            :return-object="false"
                            :disabled="type !== 'Tournament' || !tournamentFilter.name || numList.length === 1 && numList[0].num === null"
                            :search-input.sync="numSearch"
                            @change="updateDate()">
                                <template v-slot:no-data>
                                    <v-list-item>
                                        <v-list-item-content>
                                            <v-list-item-title>
                                                No results matching "<strong>{{ numSearch }}</strong>".
                                            </v-list-item-title>
                                        </v-list-item-content>
                                    </v-list-item>
                                </template>
                            </v-combobox>
                        </v-col>

                        <v-col
                        class="tournament__date"
                        :cols="$vuetify.breakpoint.smAndUp ?
                        ($vuetify.breakpoint.smOnly ? 5 : 3) :
                        12">
                            <v-combobox
                            clearable
                            v-model="tournamentFilter.date"
                            prepend-icon="mdi-calendar"
                            append-icon=""
                            :menu-props="{
                                contentClass: 'tournament-date-select-menu',
                                bottom: true,
                                offsetY: true,
                                maxHeight: '200'
                                }"
                            dense
                            minWidth="32px"
                            maxWidth="50px"
                            label="Date"
                            :hide-no-data="!dateSearch"
                            :items="dateList"
                            item-text="date"
                            item-value="date"
                            :return-object="false"
                            @change="$emit('update-tournament', tournamentFilter)"
                            :disabled="type !== 'Tournament' || !tournamentFilter.name"
                            :search-input.sync="dateSearch">
                                <template v-slot:no-data>
                                    <v-list-item>
                                        <v-list-item-content>
                                            <v-list-item-title>
                                                No results matching "<strong>{{ dateSearch }}</strong>".
                                            </v-list-item-title>
                                        </v-list-item-content>
                                    </v-list-item>
                                </template>
                            </v-combobox>
                        </v-col>
                    </v-row>
                    <!-- /tournament filters -->
                    
                    <!--<v-layout
                    class="loading"
                    v-show="loadingPlayers || loadingTournaments"
                    column
                    justify-center
                    align-center>
                        <v-progress-circular
                        v-show="loadingPlayers || loadingTournaments"
                        indeterminate />

                        <template v-if="loadingPlayers">
                            Retrieving player list...
                        </template>
                        <br />
                        <template v-if="loadingTournaments">
                            Retrieving tournament list...
                        </template>
                    </v-layout>

                    <v-col
                    v-show="!loadingPlayers || !loadingTournaments"
                    class="pa-0"
                    cols="12"
                    align="center">
                        <v-btn
                        color="accent"
                        @click="clear()">
                            Clear All
                        </v-btn>
                    </v-col>-->

                    <v-col
                    class="pa-0"
                    cols="12"
                    align="center">
                        <v-btn
                        color="accent"
                        @click="clear()">
                            Clear All
                        </v-btn>
                    </v-col>
                </v-row>
            </v-container>
        </v-expand-transition>
    </v-layout>
</template>

<script>
import CharacterSelect from './CharacterSelect.vue'

function initializeData() {
    return {
        
        hidden: false,
        playersFilter: [
            {name: null, character: null},
            {name: null, character: null}
        ],
        tournamentFilter: {
            name: null,
            num: null,
            date: null,
        },
        strictFilter: false,
        typeFilter: null,
        numList: [],
        dateList: [],
        playerSearch: [],
        tournamentSearch: null,
        numSearch: null,
        dateSearch: null,
        typeSelect: ['Casual', 'Tournament'],
        tournamentIndex: null,
        
    }
}

export default {
    name: 'Filters',
    components: {
        CharacterSelect,
    },
    props: {
        players: Array,
        tournament: Object,
        type: [String, null],
        strict: Boolean,
    },
    data: () => {
        return {
            ...initializeData(),
            loadingPlayers: true,
            loadingTournaments: true,
            playerList: [],
            tournamentList: [],
        }
    },
    watch: {
        'players': {
            handler: function(players) {
                this.playersFilter = players
                
                //console.log(JSON.parse(JSON.stringify(this.players)))
                //console.log(JSON.parse(JSON.stringify(this.playersFilter)))
            },
            deep: true,
        },

        'tournament': {
            handler: function(tournament) {
                this.tournamentFilters = tournament
            },
            deep: true,
        },

        'strict': function(strict) {
            this.strictFilter = strict
        },

        'type': function(type) {
            this.typeFilter = type
        },
    },
    mounted: function() {
        this.loadPlayers()
        this.loadTournaments()
    },
    methods: {
        // retrieve player list
        loadPlayers: function() {
            this.$players.get()
            .then((response) => {
                if (response.ok) {
                    this.error = false
                    this.playerList = response.body.players
                } else {
                    this.error = true
                    this.errorMsg = `${response.status}: ${response.statusText}`
                    console.log("Error retrieving player list.\n", this.errorMsg)
                }

                this.$emit('loaded-players')
            })
            .catch((error) => console.log(error))

        },
        // retrieve tournament list
        loadTournaments: function() {
            this.$tournaments.get()
            .then((response) => {
                if (response.ok) {
                    this.error = false
                    this.tournamentList = response.body.tournaments
                    //console.log(JSON.parse(JSON.stringify(this.tournamentList)))
                } else {
                    this.error = true
                    this.errorMsg = `${response.status}: ${response.statusText}`
                    console.log("Error retrieving tournament list.\n", this.errorMsg)
                }

                this.$emit('loaded-tournaments')
            })
            .catch((error) => console.log(error))
        },
        // update player characters
        selectCharacter: function (character, i) {
            if (character !== this.players[i].character) {
                this.$emit('update-character', {character: character, i: i})
            }
        },
        // update player names
        selectPlayer: function (name, i) {
            this.$emit('update-name', {name: name, i: i})
        },
        // update num list
        updateNum() {
            if (this.tournamentFilter.name) {
                // if tournament is selected...
                this.tournamentIndex = this.tournamentList.findIndex((t) => 
                    t._id === this.tournamentFilter.name
                )

                this.numList = this.tournamentList[this.tournamentIndex].nums.filter((n) => {
                    if (n.num) {
                        return true
                    } else {
                        return false
                    }
                }).map((n) => {
                    return n
                })
            } else {
                // else clear num and date
                this.numList = []
                this.dateList = []
                this.tournamentFilter.num = null
                this.tournamentFilter.date = null
            }

            this.updateDate()
        },
        // update date list
        updateDate() {
            
            
            if (!this.tournamentFilter.num && this.tournamentFilter.name) {
                // if no num is selected...
                this.dateList = this.tournamentList[this.tournamentIndex].nums.map((n) => n.date)
            } else if (this.tournamentFilter.num && this.tournamentFilter.name) {
                // else if num is selected...
                let index = this.numList.findIndex((n) => n.num === this.tournamentFilter.num)
                
                this.dateList = [this.numList[index].date]
                
            } else {
                // clear if tournament is not selected
                this.dateList = []
                this.tournamentFilter.date = null
            }

            this.$emit('update-tournament', this.tournamentFilter)

            //console.log(JSON.parse(JSON.stringify(this.dateList)))
        },
        // clear filters
        clear() {
            // check if objects for each player & tournament contain only null values or not
            let p1 = Object.values(this.playersFilter[0]).every( e => e === null )
            let p2 = Object.values(this.playersFilter[1]).every( e => e === null )
            let tournament = Object.values(this.tournamentFilter).every ( e => e === null )

            // if anything has been changed, clear the filter (this prevents unnecessary calls to the server)
            if (!p1 || !p2 || !tournament || this.type || this.strict && !p1 || this.strict && !p2) {
                Object.assign(this.$data, { 
                    ...initializeData(),
                    loadingPlayers: this.loadingPlayers,
                    loadingTournaments: this.loadingTournaments,
                    playerList: this.playerList,
                    tournamentList: this.tournamentList,
                })
            

                this.$emit('clear-filters')
            } else if (this.strict) {
                this.$emit('reset-strictness')
            }
        },
    },
}
</script>

<style scoped>
.wide .p1 >>> .v-input__append-inner {
    padding-left: 0px;
    padding-right: 4px;
}

#filters .players >>> .v-input__slot::before {
    width: calc(100% - 1px);
}

#filters >>> .v-autocomplete.v-select.v-input--is-focused input {
    min-width: auto !important;
}
</style>