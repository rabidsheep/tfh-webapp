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

    <!-- matches table -->
    <div id="matches">
      <v-layout column>
        <MatchRow
          v-for="(match, i) in matches"
          :key="i"
          v-bind="match"
          :consecutiveMatch="(i > 0) && (matches[i - 1].video === match.video)"
        />
      </v-layout>
    </div>
    <!-- /matches table -->
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
      players: ["player 1", "player 2", "player 3", "player 4"],
      search: [null, null],
      showToTop: false,
      hidden: false,
      showCompatible: true,
      resultsCount: -1,
      loading: false,
      error: false,
      errorMessage: '',
      playerInfo: [
            {name: null, characters: {name: 'Any Character', devName: '', id: 0}},
            {name: null, characters: {name: 'Any Character', devName: '', id: 0}}
      ],
      matches: [],
      resLimit: 3,
    }
  },
  mounted: function() {
    this.getMatches(this.playerInfo)
  },
  watch: {
    playerInfo:{
      handler: function(playerInfo) {
        this.getMatches(playerInfo);
    },
    deep: true
  },
  },
  methods: {
    getMatches: function (playerInfo) {
      playerInfo = JSON.parse(JSON.stringify(playerInfo));
      console.log(playerInfo);
      let db = firebase.firestore().collection('matches');
      this.loading = true;

      /* adds filters */
      for (const i in playerInfo) {
        if (playerInfo[i].name) {
          db = db.where('p' + (parseInt(i)+1), '==', playerInfo[i].name)
        }

        if (playerInfo[i].characters && playerInfo[i].characters.id != 0) {
          db = db.where('p' + (parseInt(i)+1) + 'Chara.name', '==', playerInfo[i].characters.name)
        }
      }

        /* sort by timestamp */
        db.orderBy('timestamp','desc')
          .get()
          .then((querySnapshot) => {
            this.loading = false;
            /* maps objects so they don't display as [Object object] */
            this.matches = querySnapshot.docs.map(doc => doc.data());
            
          })
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
            this.$set(this.playerInfo[index], 'characters', JSON.parse(JSON.stringify(character)));
            console.log("Updated filter characters.")
        },
    selectPlayers() {
      console.log("Updated filter players.")
    }
  }
}
</script>