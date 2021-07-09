<template>
  <div v-scroll="onScroll">
    <!--<Filters
    @filter-characters="updateCharacters($event)"
    @filter-players="updatePlayers($event)" />-->

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
                            :selectedChar="i === 0 ? playerInfo.p1.character : playerInfo.p2.character"
                            :index="i"
                            :selectionEnabled="true"
                            @character-select="selectCharacter($event, i)"/>
                        </div>

                        <!-- player select -->
                      <div style="width:100%;">
                        <v-combobox
                                clearable
                                v-model="playerInfo[`p${i + 1}`].name"
                                append-icon=""
                                :menu-props="{bottom: true, offsetY: true, maxHeight: '200'}"
                                :label="`Player ${i + 1}`"
                                :items="players"
                                :search-input.sync="search[i]"
                                @change = "selectPlayers(i)"
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
        v-model="playerInfo.page"
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
import firebase from 'firebase'

export default {
  name: 'Matches',
  components: {
    MatchRow,
    //Filters,
    CharacterSelect
  },
  props: {
    query: Object,
  },
  data: () => {
    return {
      players: [],
      page: 1,
      search: [null, null],
      showToTop: false,
      hidden: false,
      showCompatible: true,
      resultsCount: null,
      loading: false,
      error: false,
      errorMessage: '',
      playerInfo: {
            p1: {name: null, character: {name: 'Any Character', devName: '', id: 0}},
            p2: {name: null, character: {name: 'Any Character', devName: '', id: 0}},
            page: 0,
      },
      matches: [],
      lastVisible: null,
    }
  },
  mounted: function() {
    this.getMatches(this.playerInfo)
    this.loadPlayers()
  },
  watch: {
    playerInfo:{
      handler: function(playerInfo) {
        this.getMatches(playerInfo);
    },
    deep: true
  },
    page: function(playerInfo) {
      this.getMatches(playerInfo)
    }
  },
  methods: {
    loadPlayers: function() {
      let db = firebase.firestore().collection('matches');
      db.get().then((querySnapshot) => {
        let p1Names = querySnapshot.docs.map(doc => doc.data().p1);
        let p2Names = querySnapshot.docs.map(doc => doc.data().p2);

        for (const i in p1Names) {
          if (!this.players.some(x => x === p1Names[i])) {
            this.players.push(p1Names[i]);
          }
        }
        for (const i in p1Names) {
         if (!this.players.some(x => x === p2Names[i])) {
            this.players.push(p2Names[i]);
          }
        }
        console.log(this.players);
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
          this.loading = false;
        }
      })
        /* sort by timestamp */
        /*db.limit(5).get()
          .then((querySnapshot) => {
            /* maps objects so they don't display as [Object object] */
           /* this.lastVisible = querySnapshot.docs[querySnapshot.docs.length-1];
            this.matches = querySnapshot.docs.map(doc => doc.data());
            
          })*/
    },
    onScroll: function (event) {
      this.showToTop = event.currentTarget.scrollY >= 250
    },
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

            const i = index + 1;
            if (character.id !== this.playerInfo[`p${i}`].character.id) {
              this.$set(
                this.playerInfo[`p${i}`],
                'character',
                JSON.parse(JSON.stringify(character))
              );
            }
        },
    selectPlayers(index) {
      const i = index + 1;
      console.log(
        "P" + i + " name updated.\n"
        + "P" + i + " Name:",
        JSON.parse(JSON.stringify(this.playerInfo[`p${i}`].name))
      );
    }
  }
}
</script>