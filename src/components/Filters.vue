<template>
    <v-layout id="filters" style="position:relative;">
        <v-btn
        id="filters__toggle"
        @click="hidden = !hidden">
        {{ hidden ? 'Show filters' : 'Hide filters'}}
        </v-btn>

        <v-expand-transition>
            <div id="filters__main" v-show="!hidden">
                <v-layout players :column="$vuetify.breakpoint.xsOnly">
                    <!-- player filters -->
                    <v-layout
                    :class="`player p${i + 1}`"
                    v-for="(player, i) in playerInfo"
                    :key="i"
                    :reverse="i === 0 && !$vuetify.breakpoint.xsOnly"> 

                        <CharacterSelect
                        :currentCharacter="playerInfo[i].character"
                        :selectionEnabled="true"
                        :anyEnabled="true"
                        @character-select="selectCharacter($event, i)"/>

                        <v-combobox
                        clearable
                        v-model="playerInfo[i].name"
                        append-icon=""
                        :menu-props="{
                            contentClass: 'player-select-menu',
                            bottom: true,
                            offsetY: true,
                            maxHeight: '200'
                            }"
                        :label="`Player ${i + 1}`"
                        :items="players"
                        :search-input.sync="search[i]"
                        :reverse="i === 0 && !$vuetify.breakpoint.xsOnly"
                        @change = "selectPlayer(playerInfo[i].name, i)">
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
                        <!-- /player select-->
                    </v-layout>
                    <!-- /player filters -->


                    <v-btn
                    class="swap"
                    color="primary"
                    @click="swap()">
                        <v-icon>
                            {{ $vuetify.breakpoint.smAndUp ? 'mdi-swap-horizontal' : 'mdi-swap-vertical' }}
                        </v-icon>
                    </v-btn>
                </v-layout>

                <center>
                    <v-btn
                    color="primary"
                    @click="clear()">
                        Clear All
                    </v-btn>
                </center>
            </div>
        </v-expand-transition>
    </v-layout>
</template>

<script>
import CharacterSelect from './CharacterSelect.vue'

export default {
    name: 'Filters',
    components: {
        CharacterSelect,
    },
    data: () => {
        return {
            playerInfo: [
                {name: null, character: null},
                {name: null, character: null}
            ],
            search: [],
            hidden: false,
            players: []
        }
    },
    watch: {
        'playerInfo': {
            handler: function(newVal) {
                this.$emit('update-filter', newVal)
            },
            deep: true
        },
    },
    mounted: function() {
        this.loadPlayers()
    },
    methods: {
        loadPlayers: function() {

            this.$players.get()
            .then((response) => {
                if (response.ok) {
                    this.error = false
                    this.players = response.body.players
                } else {
                    this.error = true
                    this.errorMsg = `${response.status}: ${response.statusText}`
                    console.log("Error retrieving player list.\n", this.errorMsg)
                }
            })

        },
        selectCharacter: function (character, i) {
            if (character !== this.playerInfo[i].character) {
                this.$set(this.playerInfo[i], 'character', character)
            }
        },
        selectPlayer: function (player, i) {
            if (player !== this.playerInfo[i].name) {
                this.$set(this.playerInfo[i], 'name', player)
            }
        },
        swap() {
            // do nothing if filters are the same on both sides
            if (JSON.stringify(this.playerInfo[0]) !== JSON.stringify(this.playerInfo[1])) {
                // swap filters if not
                var temp = this.playerInfo[0]
                this.$set(this.playerInfo, 0, this.playerInfo[1])
                this.$set(this.playerInfo, 1, temp)
            }
        },
        clear() {
            // check if objects for each player contain only null values or not
            let p1 = Object.values(this.playerInfo[0]).every( e => e === null)
            let p2 = Object.values(this.playerInfo[1]).every( e => e === null)

            // if either players have a filter set, clear the filter (this prevents unnecessary calls to the server)
            if (!p1 || !p2) {
                this.playerInfo = [
                    {name: null, character: null},
                    {name: null, character: null}
                ]
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
</style>