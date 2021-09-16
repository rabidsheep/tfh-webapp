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
                        contentClass: 'select-menu select-menu__player',
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
                                        maxWidth: '300',
                                        contentClass: 'select-menu select-menu__title',
                                        bottom: true,
                                        offsetY: true,
                                        maxHeight: '200'
                                        }"
                                    dense
                                    placeholder="(ex: Rodeo Regional, Grand Stampede)"
                                    label="Group Title"
                                    :hide-no-data="!groupSearch"
                                    :items="groupList"
                                    item-text="title"
                                    item-value="title"
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
                                        maxWidth: '300',
                                        contentClass: 'select-menu select-menu__part',
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
                                    @change="updateDates(groupList.filter((group) => formatRegex(groupFilter.title).test(group.title)))">
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
                                        maxWidth: '300',
                                        contentClass: 'select-menu select-menu__date',
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

                            <div
                            class="videos">
                                <v-combobox
                                class="channel clearable"
                                clearable
                                v-model="channelFilter"
                                append-icon=""
                                :menu-props="{
                                    maxWidth: '300',
                                    contentClass: 'select-menu select-menu__channel',
                                    bottom: true,
                                    offsetY: true,
                                    maxHeight: '200'
                                    }"
                                dense
                                label="Channel"
                                :hide-no-data="!channelSearch"
                                :items="channelList"
                                item-text="name"
                                item-value="name"
                                :return-object="false"
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

                                <v-combobox
                                class="video clearable"
                                clearable
                                v-model="videoFilter"
                                append-icon=""
                                :menu-props="{
                                    maxWidth: '300',
                                    contentClass: 'select-menu select-menu__video',
                                    bottom: true,
                                    offsetY: true,
                                    maxHeight: '300'
                                    }"
                                dense
                                label="Video"
                                :hide-no-data="!videoSearch"
                                :items="videoList"
                                :return-object="false"
                                @change="$emit('update-video', $event)"
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
                            </div>

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

export default {
    name: 'Filters',
    components: {
        CharacterSelect,
    },
    props: {
        players: Array,
        group: Object,
        channel: String,
        video: String,
        strict: Boolean,
        hasFile: Boolean,
        hasVideo: Boolean,
        groupList: [Array, null],
        playerList: [Array, null],
        channelList: [Array, null],
        allVideos: [Array, null]
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
            channelFilter: null,
            videoFilter: null,
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
        }
    },
    watch: {
        'players': {
            handler: function(players) {
                this.playersFilter = players;
                
                //console.log(JSON.parse(JSON.stringify(this.players)))
                //console.log(JSON.parse(JSON.stringify(this.playersFilter)))
            },
            deep: true,
        },

        'group': {
            handler: function(group) {
                this.groupFilter = group;
            },
            deep: true,
        },

        'strict': function(strict) {
            this.strictFilter = strict;
        },

        'hasFile': function(hasFile) {
            this.hasFileFilter = hasFile;
        },

        'hasVideo': function(hasVideo) {
            this.hasVideoFilter = hasVideo;
        },

        'channel': function(channel) {
            this.channelFilter = channel;
        },

        'video': {
            handler: function(video) {
                //console.log(video)
            }
        },

        'allVideos': function(all) {
            this.videoList = this.allVideos;
        }
    },
    methods: {
        // update player characters
        selectCharacter: function (character, i) {
            if (character !== this.players[i].character)
                this.$emit('update-character', {character: character, index: i});
        },

        // update player names
        selectPlayer: function (name, i) {
            this.$emit('update-name', {name: name, index: i});
        },

        // update part list
        updateParts() {
            let parts = [];
            let matched = null;

            if (this.groupFilter.title) {
                matched = [];
                let re = this.formatRegex(this.groupFilter.title);
                matched = this.groupList.filter((group) => re.test(group.title))
                
                // if group is selected...
                matched.forEach((group) =>
                    group.sub.forEach((sub) => {
                        if (sub.part) return parts.push(sub)
                    })
                )

                this.partList = parts;
            } else {
                // else clear part and date
                this.partList = [];
                this.dateList = [];
                this.groupFilter.part = null;
                this.groupFilter.date = null;
            }

            this.updateDates(matched);
        },

        // update date list
        updateDates(matched) {
            let dates = [];

            if (!this.groupFilter.part && this.groupFilter.title) {
                // if no part is selected...
                matched.forEach((group) => {
                    return group.sub.forEach((sub) => dates.push(sub.date));
                })

            } else if (this.groupFilter.part && this.groupFilter.title) {
                // else if part is selected...
                let re = this.formatRegex(this.groupFilter.part);
                dates = this.partList.filter((sub) => re.test(sub.part)).map((sub) => sub.date);
            } else {
                // clear if group is not selected
                this.groupFilter.date = null;
            }
            
            this.dateList = dates;

            this.$emit('update-group', this.groupFilter);
        },

        updateChannel(channel) {
            if (channel) console.log("Filtering results with videos from", channel)
            else console.log("Clearing channel filter")
            this.$emit('update-channel', channel);

            this.updateVideoList(channel);
        },

        updateVideoList(channel) {
            if (channel) {
                let videos = [];
                let re = this.formatRegex(channel);
                this.channelList.filter((ch) => re.test(ch.name)).forEach((ch) => videos.push(...ch.videos))
                this.videoList = videos;
            } else {
                this.videoList = this.allVideos;
            }
        },

        // clear filters
        clear() {
            // check if objects for each player & group contain only null values or not
            let p1 = Object.values(this.playersFilter[0]).every( e => e === null );
            let p2 = Object.values(this.playersFilter[1]).every( e => e === null );
            let group = Object.values(this.groupFilter).every ( e => e === null );
            let filterValuesExist = !p1 || !p2 || !group || this.strict && !p1 || this.strict && !p2 
            || this.hasFileFilter || this.hasVideoFilter || this.channelFilter || this.videoFilter;

            // if anything has been changed, clear the filter (this prevents unnecessary calls to the server)
            if (filterValuesExist) {
                console.log('Clearing filters');
                this.$emit('clear-filters');
            } else if (this.strict) {
                console.log('Resetting strictness');
                this.$emit('reset-strictness');
            } else {
                console.log('No filters to reset');
            }
        },

        clearGroupFilters() {
            this.groupFilter = {
                title: null,
                part: null,
                date: null,
            };
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