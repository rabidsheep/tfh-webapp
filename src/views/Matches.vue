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
                            :selectionEnabled="true"
                            @character-select="selectCharacter($event, i)"/>
                        </div>

                        <!-- player select -->
                      <div style="width:100%;">
                        <v-combobox
                                clearable
                                append-icon=""
                                v-model="playerInfo[i].name"
                                :menu-props="{bottom: true, offsetY: true, maxHeight: '200'}"
                                :label="`Player ${i + 1}`"
                                :items="players"
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
    <div class="loading" style="margin: 20% 0" v-if="loading">
      <v-progress-linear indeterminate v-show="loading"/>
    </div>
    <div id="matches" v-if="!loading">
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
      players: [],
      page: 1,
      search: [null, null],
      showToTop: false,
      hidden: false,
      showCompatible: true,
      resultsCount: 30,
      loading: false,
      error: false,
      errorMessage: '',
      playerInfo: [
            {name: null, characters: {name: 'Any Character', devName: '', id: 0}},
            {name: null, characters: {name: 'Any Character', devName: '', id: 0}}
      ],
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

      db = db.orderBy("timestamp", "desc")

      if (this.page > 1) {
        db = db.startAfter(this.lastVisible);
      }
        /* sort by timestamp */
        db.get()
          .then((querySnapshot) => {
            /* maps objects so they don't display as [Object object] */
            this.matches = querySnapshot.docs.map(doc => doc.data());
            this.loading = false;
            
          })
    },
    onScroll: function (event) {
      this.showToTop = event.currentTarget.scrollY >= 250
    },
    selectCharacter: function (character, index) {
            this.$set(this.playerInfo[index], 'characters', JSON.parse(JSON.stringify(character)));
            console.log("Updated filter characters.")
        },
    selectPlayers() {
      console.log("Updated filter players.")
    }
  }
}
</script>