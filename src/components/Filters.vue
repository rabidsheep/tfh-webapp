<template>
    <v-layout id="filters">
        <div class="header">
            FILTERS
        </div>

        <div
        class="main">
            <div class="players"> 
                <v-layout
                :class="`player p${i + 1}`"
                v-for="(player, i) in playersFilter"
                :key="i"
                :cols="$vuetify.breakpoint.smAndDown ? 12 : undefined"> 
                    <CharacterSelect
                    :invalid="false"
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
                </v-layout>
                

                <div
                class="mid">
                    <v-btn
                    v-if="strictFilter"
                    fab
                    small
                    minWidth="40px"
                    minHeight="40px"
                    :disabled="!strict"
                    :ripple="false"
                    color="accent"
                    @click="$emit('swap')">
                        <v-icon>
                            {{ $vuetify.breakpoint.mdAndUp ?
                            'mdi-swap-horizontal' :
                            'mdi-swap-vertical' }}
                        </v-icon>
                    </v-btn>

                    <template v-else>
                        vs.
                    </template>
                </div>
            </div>
            <!-- /player filters -->
            <div
            class="advanced">
                <v-btn
                :class="hidden ? `toggle` : `toggle--active`"
                color="button2"
                width="auto"
                small
                elevation="0"
                :ripple="false"
                @click="hidden = !hidden">
                    Advanced
                    <v-icon>
                        {{ hidden ? `mdi-chevron-down` : `mdi-chevron-up` }}
                    </v-icon>
                </v-btn>

                    <div
                    class="advanced__outer"
                    v-show="!hidden">
                        <div
                        class="advanced__inner">
                            <!-- group filters -->
                            <div
                            class="group">
                                <div class="title">
                                    <v-combobox
                                    class="group__filter clearable"
                                    clearable
                                    v-model="groupFilter.title"
                                    append-icon=""
                                    :menu-props="{
                                        contentClass: 'group-select-menu',
                                        bottom: true,
                                        offsetY: true,
                                        maxHeight: '200'
                                        }"
                                    dense
                                    placeholder="(ex: Rodeo Regional, Grand Stampede)"
                                    label="Group Title"
                                    :hide-no-data="!groupSearch"
                                    :items="groupList"
                                    item-text="_id"
                                    item-value="_id"
                                    :return-object="false"
                                    :search-input.sync="groupSearch"
                                    @change="updateParts()">
                                        <template v-slot:no-data>
                                            <v-list-item>
                                                <v-list-item-content>
                                                    <v-list-item-title>
                                                        No results matching "<strong>{{ groupSearch }}</strong>".
                                                    </v-list-item-title>
                                                </v-list-item-content>
                                            </v-list-item>
                                        </template>
                                    </v-combobox>
                                </div>

                                <div
                                class="part">
                                    <v-combobox
                                    class="part__filter clearable"
                                    clearable
                                    v-model="groupFilter.part"
                                    append-icon=""
                                    :menu-props="{
                                        contentClass: 'group-part-select-menu',
                                        bottom: true,
                                        offsetY: true,
                                        maxHeight: '200'
                                        }"
                                    dense
                                    placeholder="(ex: #3, Finals, etc.)"
                                    label="Part"
                                    :hide-no-data="!partSearch"
                                    :items="partList"
                                    item-text="part"
                                    item-value="part"
                                    :return-object="false"
                                    :disabled="!groupFilter.title || partList.length === 1 && partList[0].part === null"
                                    :search-input.sync="partSearch"
                                    @change="updateDates()">
                                        <template v-slot:no-data>
                                            <v-list-item>
                                                <v-list-item-content>
                                                    <v-list-item-title>
                                                        No results matching "<strong>{{ partSearch }}</strong>".
                                                    </v-list-item-title>
                                                </v-list-item-content>
                                            </v-list-item>
                                        </template>
                                    </v-combobox>
                                </div>

                                <div
                                class="date">
                                    <v-combobox
                                    clearable
                                    class="date__filter clearable"
                                    v-model="groupFilter.date"
                                    prepend-icon="mdi-calendar"
                                    append-icon=""
                                    :menu-props="{
                                        contentClass: 'group-date-select-menu',
                                        bottom: true,
                                        offsetY: true,
                                        maxHeight: '200'
                                        }"
                                    dense
                                    placeholder="MM-DD-YYYY"
                                    label="Date"
                                    :hide-no-data="!dateSearch"
                                    :items="dateList"
                                    item-text="date"
                                    item-value="date"
                                    :return-object="false"
                                    @change="$emit('update-group', groupFilter)"
                                    :disabled="!groupFilter.title"
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
                                </div>
                            </div>
                            <!-- /group filters -->

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

                            <div
                            class="links">
                                <label>Show only matches with:</label>

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
                            </div>

                            <v-switch
                            class="sides"
                            color="accent"
                            v-model="strictFilter"
                            label="Strict Player Sides"
                            value
                            @change="$emit('update-strictness', $event)"
                            hide-details/>
                        </div>
                    </div>
            </div>
            <v-btn
            class="clear"
            width="max-content"
            rounded
            color="accent"
            @click="clear()">
                Clear All
            </v-btn>
        </div>
    </v-layout>
</template>

<script>
import CharacterSelect from './CharacterSelect.vue'

function initializeData() {
    return {
        hidden: true,
        playersFilter: [
            {name: null, character: null},
            {name: null, character: null}
        ],
        groupFilter: {
            title: null,
            part: null,
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
        hasFileFilter: false,
        hasVideoFilter: false,
        partList: [],
        dateList: [],
        videoList: [],
        playerSearch: [],
        groupSearch: null,
        partSearch: null,
        dateSearch: null,
        channelSearch: null,
        videoSearch: null,
        groupIndex: null,
    }
}

export default {
    name: 'Filters',
    components: {
        CharacterSelect,
    },
    props: {
        players: Array,
        group: Object,
        channel: Object,
        video: Object,
        strict: Boolean,
        hasFile: Boolean,
        hasVideo: Boolean,
        groupList: [Array, null],
        playerList: [Array, null],
        channelList: [Array, null]
    },
    data: () => {
        return {
            hidden: true,
            playersFilter: [
                {name: null, character: null},
                {name: null, character: null}
            ],
            groupFilter: {
                title: null,
                part: null,
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
            hasFileFilter: false,
            hasVideoFilter: false,
            groupIndex: null,
            partList: [],
            dateList: [],
            videoList: [],
            playerSearch: [],
            groupSearch: null,
            partSearch: null,
            dateSearch: null,
            channelSearch: null,
            videoSearch: null,
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

        'group': {
            handler: function(group) {
                this.groupFilters = group
            },
            deep: true,
        },

        'strict': function(strict) {
            this.strictFilter = strict
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
    methods: {
        
        // update player characters
        selectCharacter: function (character, i) {
            if (character !== this.players[i].character)
                this.$emit('update-character', {character: character, i: i})
        },
        // update player names
        selectPlayer: function (name, i) {
            this.$emit('update-name', {name: name, i: i})
        },
        // update part list
        updateParts() {
            if (this.groupFilter.title) {
                // if group is selected...
                this.groupIndex = this.groupList.findIndex((t) => 
                    t._id === this.groupFilter.title
                )

                this.partList = this.groupList[this.groupIndex].sub.filter((s) => {
                    if (s.part) return true
                    else return false
                    
                }).map((s) => s)
            } else {
                // else clear part and date
                this.partList = []
                this.dateList = []
                this.groupFilter.part = null
                this.groupFilter.date = null
            }

            this.updateDates()
        },
        // update date list
        updateDates() {
            if (!this.groupFilter.part && this.groupFilter.title) {
                // if no part is selected...
                this.dateList = this.groupList[this.groupIndex].sub.map((s) => s.date)
            } else if (this.groupFilter.part && this.groupFilter.title) {
                // else if part is selected...
                let index = this.partList.findIndex((s) => s.part === this.groupFilter.part)
                
                this.dateList = [this.partList[index].date]
                
            } else {
                // clear if group is not selected
                this.dateList = []
                this.groupFilter.date = null
            }

            this.$emit('update-group', this.groupFilter)

            //console.log(JSON.parse(JSON.stringify(this.dateList)))
        },
        updateChannel(channel) {
            //console.log(channel)
            if (channel.id !== this.channel.id)
                this.$emit('update-channel', channel)
        },
        // clear filters
        clear() {
            // check if objects for each player & group contain only null values or not
            let p1 = Object.values(this.playersFilter[0]).every( e => e === null )
            let p2 = Object.values(this.playersFilter[1]).every( e => e === null )
            let group = Object.values(this.groupFilter).every ( e => e === null )
            let filterValuesExist = !p1 || !p2 || !group || this.strict && !p1 || this.strict && !p2 || this.hasFileFilter || this.hasVideoFilter

            // if anything has been changed, clear the filter (this prevents unnecessary calls to the server)
            if (filterValuesExist) {
                console.log('Clearing filters')
                this.$emit('clear-filters')
            } else if (this.strict) {
                console.log('Resetting strictness')
                this.$emit('reset-strictness')
            } else {
                console.log('No filters to reset')
            }
        },
        clearGroupFilters() {
            this.groupFilter = {
                title: null,
                part: null,
                date: null,
            }
        }
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