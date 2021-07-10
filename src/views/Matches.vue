<template>
  <div v-scroll="onScroll">
    <!--<Filters
    @filter-characters="updateCharacters($event)"
    @filter-players="updatePlayers($event)" />-->

    <v-layout id="filter" style="position:relative;">
        <v-btn id="filter-toggle" @click="hidden = !hidden">{{ hidden ? 'Show filters' : 'Hide filters'}}</v-btn>
        <v-expand-transition>
            <div id="search" v-show="!hidden">
                <v-layout filters :column="$vuetify.breakpoint.xsOnly">
                    <!-- player filters -->
                    <v-layout pfilter v-for="i in [1, 2]" :key=i :reverse="i === 1 && !$vuetify.breakpoint.xsOnly"> 
                        <div :style="!$vuetify.breakpoint.xsOnly ? `padding-left: 20px; padding-right: 20px;` : `padding-right: 10px;` ">
                            <CharacterSelect
                            :ripple = "false"
                            :selectedChar="query.playerInfo[`p${i}`].character !== null ? query.playerInfo[`p${i}`].character : $characters[0]"
                            :selectionEnabled="true"
                            @character-select="selectCharacter($event, i)"/>
                        </div>

                        <!-- player select -->
                      <div style="width:100%;">
                        <v-combobox
                                clearable
                                v-model="query.playerInfo[`p${i}`].name"
                                append-icon=""
                                :menu-props="{ contentClass: 'player-select-menu', bottom: true, offsetY: true, maxHeight: '200' }"
                                :label="`Player ${i}`"
                                :items="players"
                                :search-input.sync="search[`p${i}`]"
                                @change = "selectPlayers(i)"
                            >
                            <template v-slot:no-data>
                                <v-list-item>
                                  <v-list-item-content>
                                      <v-list-item-title>
                                          No results matching "<strong>{{ search[`p${i}`] }}</strong>".
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

    
    <!-- matches table -->
    <div class="loading" style="margin: 20% 0" v-if="loading">
      <v-progress-linear indeterminate v-show="loading"/>
    </div>
    <div id="matches" v-if="!loading">
      <v-layout column>
        <MatchRow
          v-for="(match, i) in matches"
          :key="i"
          v-bind="match"
        />
      </v-layout>
    </div>
    <!-- /matches table -->

<!-- pagination-->
    <v-layout v-if="!loading && !(resultsCount <= this.$config.itemsPerPage)" class="mt-3">
      <v-spacer/>
      <v-pagination
        v-model="query.page"
        :length="Math.floor(resultsCount / this.$config.itemsPerPage) + 1"
        :total-visible="$vuetify.breakpoint.smAndUp ? 7 : 5"
        circle
      />
      <v-spacer/>
    </v-layout>


  </div>
</template>

<script>
import MatchRow from '../components/MatchRow.vue'
import CharacterSelect from './../components/CharacterSelect.vue';
//import Filters from '../components/Filters.vue'

export default {
  name: 'Matches',
  components: {
    MatchRow,
    //Filters,
    CharacterSelect
  },
  data: () => {
    return {
      players: [],
      search: {'p1': null, 'p2': null},
      showToTop: false,
      hidden: false,
      showCompatible: true,
      resultsCount: null,
      loading: false,
      error: false,
      errorMessage: '',
      query: {
        playerInfo: {
              p1: {name: null, character: {name: 'Any Character', devName: '', id: 0}},
              p2: {name: null, character: {name: 'Any Character', devName: '', id: 0}},
        },
        page: 0,
      },
      matches: [],
      lastVisible: null,
    }
  },
  mounted: function() {
    this.getMatches(this.query)
    this.loadPlayers()
  },
  watch: {
    query: {
      handler: function() {
        this.getMatches(this.query);
      },
      deep: true
    },
  },
  methods: {
    loadPlayers: function() {
      
      this.$players.get()
      .then((response) => {
        if (response.ok) {
          this.error = false;
          this.players = response.body.players;
          this.loading = false;
        } else {
          this.error = true;
          this.errorMsg = `${response.status}: ${response.statusText}`
          console.log(this.errorMsg);
          this.loading = false;
        }
      })

    },
    getMatches: function (playerInfo) {
      this.loading = true;

      this.$matches.get(playerInfo)
      .then((response) => {
        if (response.ok) {
          this.error = false;
          this.matches = response.body.matches;
          this.resultsCount = response.body.count;
          this.loading = false;
        } else {
          this.error = true;
          this.errorMsg = `${response.status}: ${response.statusText}`
          console.log(this.errorMsg);
          this.loading = false;
        }
      })
    },
    onScroll: function (event) {
      this.showToTop = event.currentTarget.scrollY >= 250
    },
    selectCharacter: function (character, i) {
            if (character.id !== this.query.playerInfo[`p${i}`].character.id) {
              this.$set(
                this.query.playerInfo[`p${i}`],
                'character',
                JSON.parse(JSON.stringify(character))
              );
            }
        },
    selectPlayers(i) {
      console.log(
        "P" + i + " name updated.\n"
        + "P" + i + " Name:",
        JSON.parse(JSON.stringify(this.query.playerInfo[`p${i}`].name))
      );
    }
  }
}
</script>