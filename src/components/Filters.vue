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
                    <v-col
                    cols="12"
                    class="players"
                    align="center"
                    justify="center"> 
                        <v-col
                        :class="`player p${i + 1}`"
                        v-for="(player, i) in playersFilter"
                        :key="i"
                        :cols="$vuetify.breakpoint.smAndDown ? 12 : undefined"> 
                            <CharacterSelect
                            :currentCharacter="player.character? player.character : `Any`"
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
                            :label="strictFilter ? `P${i + 1} Name` : `Player Name`"
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
                    </v-col>

                    <div
                    class="strictness mt-3 mb-3 pa-0"
                    justify="center">
                        <v-switch
                        color="accent"
                        v-model="strictFilter"
                        class="checkbox"
                        label="Strict Player Sides"
                        value
                        @change="$emit('update-strictness', $event)"
                        hide-details/>
                    </div>
                    <!-- /player filters -->

                    <!-- tournament filters -->
                    <v-row
                    justify="center"
                    class="tournaments">
                        <v-col
                        class="type"
                        :cols="$vuetify.breakpoint.mdAndUp ? 3 : 12">
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
                        :cols="$vuetify.breakpoint.mdAndUp ? 4 : undefined">
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
                        :cols="$vuetify.breakpoint.mdAndUp ? 2 : 3">
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
                            label="No. #"
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
                        :cols="$vuetify.breakpoint.mdAndUp ? 3 : 12">
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

                    <!--<v-col
                    class="videos"
                    cols="12">
                        <v-col
                        class="channel"
                        cols="5">
                            <v-combobox
                            clearable
                            v-model="channelFilter.name"
                            append-icon=""
                            :menu-props="{
                                contentClass: 'channel-select-menu',
                                bottom: true,
                                offsetY: true,
                                maxHeight: '200'
                                }"
                            dense
                            label="Channel"
                            :hide-no-data="!channelSearch"
                            :items="channelList"
                            item-text="name"
                            @change="updateChannel($event)"
                            :search-input.sync="channelSearch">
                                <template v-slot:no-data>
                                    <v-list-item>
                                        <v-list-item-content>
                                            <v-list-item-title>
                                                No results matching "<strong>{{ channelSearch }}</strong>".
                                            </v-list-item-title>
                                        </v-list-item-content>
                                    </v-list-item>
                                </template>
                            </v-combobox>
                        </v-col>

                        <v-col
                        class="video"
                        cols="5">
                            <v-combobox
                            clearable
                            v-model="videoFilter.title"
                            append-icon=""
                            :menu-props="{
                                contentClass: 'video-select-menu',
                                bottom: true,
                                offsetY: true,
                                maxHeight: '200'
                                }"
                            dense
                            label="Video"
                            :hide-no-data="!videoSearch"
                            :items="videoList"
                            item-text="title"
                            @change="updateVideo($event)"
                            :search-input.sync="videoSearch">
                                <template v-slot:no-data>
                                    <v-list-item>
                                        <v-list-item-content>
                                            <v-list-item-title>
                                                No results matching "<strong>{{ videoSearch }}</strong>".
                                            </v-list-item-title>
                                        </v-list-item-content>
                                    </v-list-item>
                                </template>
                            </v-combobox>
                        </v-col>
                    </v-col>-->

                    <v-row
                    class="links mb-6" align="center" justify="center">
                        <label>Show Only Matches With:</label>

                        <v-checkbox
                        class="file checkbox"
                        hide-details
                        color="accent"
                        label="TFHR File"
                        v-model="hasFileFilter"
                        @change="$emit('update-hasfile', $event)" />

                        <v-checkbox
                        class="video checkbox"
                        hide-details
                        color="accent"
                        label="Video"
                        v-model="hasVideoFilter"
                        @change="$emit('update-hasvideo', $event)" />
                    </v-row>

                    <v-col
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
        channelFilter: {
            id: null,
            name: null,
        },
        videoFilter: {
            id: null,
            title: null,
        },
        strictFilter: false,
        typeFilter: null,
        hasFileFilter: false,
        hasVideoFilter: false,
        numList: [],
        dateList: [],
        videoList: [],
        playerSearch: [],
        tournamentSearch: null,
        numSearch: null,
        dateSearch: null,
        channelSearch: null,
        videoSearch: null,
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
        channel: Object,
        video: Object,
        type: [String, null],
        strict: Boolean,
        hasFile: Boolean,
        hasVideo: Boolean,
    },
    data: () => {
        return {
            ...initializeData(),
            playerList: [],
            tournamentList: [],
            channelList: []
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

        'hasFile': function(hasFile) {
            this.hasFileFilter = hasFile
        },

        'hasVideo': function(hasVideo) {
            this.hasVideoFilter = hasVideo
        },

        'channel': {
            handler: function(channel) {
                this.channelFilter = channel
            },
            deep: true,
        },
        'channelFilter.name': function() {
            //console.log(JSON.parse(JSON.stringify(this.channelFilter)))
        }
    },
    mounted: function() {
        this.loadContent()
    },
    methods: {
        // retrieve content for dropdown lists
        loadContent: function() {
            this.$filterContent.get()
            .then((response) => {
                if (response.ok) {
                    this.error = false

                    this.tournamentList = response.body.tournaments
                    this.playerList = response.body.players
                    this.channelList = response.body.channels

                    //console.log(JSON.parse(JSON.stringify(this.channelList)))
                    //console.log(this.playerList)
                    //console.log(JSON.parse(JSON.stringify(this.tournamentList)))
                } else {
                    this.error = true
                    this.errorMsg = `${response.status}: ${response.statusText}`
                    console.log("Error retrieving tournament list.\n", this.errorMsg)
                }

                this.$emit('loaded-filter-content')
            })
            .catch((error) => {
                console.log(error)
                this.$emit('loaded-filter-content')
            })
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
        updateChannel(channel) {
            //console.log(channel)
            if (channel.id !== this.channel.id) {
                this.$emit('update-channel', channel)
            }
        },
        // clear filters
        clear() {
            // check if objects for each player & tournament contain only null values or not
            let p1 = Object.values(this.playersFilter[0]).every( e => e === null )
            let p2 = Object.values(this.playersFilter[1]).every( e => e === null )
            let tournament = Object.values(this.tournamentFilter).every ( e => e === null )

            // if anything has been changed, clear the filter (this prevents unnecessary calls to the server)
            if (!p1 || !p2 || !tournament || this.type || this.strict && !p1 || this.strict && !p2 || this.hasFileFilter || this.hasVideoFilter) {
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