<template>
  <div id="index">
      <div
      class="loading"
      v-if="loadingPlayers || loadingTournaments"
      column
      justify-center
      align-center>
          <v-progress-linear
          class="progress"
          color="accent"
          indeterminate />

          <p>
            <br />
            Retrieving content...
          </p>
      </div>

    <div
    class="index__body"
    v-scroll="onScroll"
    v-show="!loadingPlayers && !loadingTournaments">
      <!-- filters box -->
      <Filters
      :players="players"
      :tournament="tournament"
      :strict="strict"
      :type="type"
      @update-name="updateName($event.name, $event.i)"
      @update-character="updateCharacter($event.character, $event.i)"
      @update-strictness="updateStrictness($event)"
      @update-type="updateType($event)"
      @update-tournament="updateTournament($event)"
      @clear-filters="clearFilters()"
      @swap="swap()"
      @reset-strictness="strict = false"
      @loaded-players="loadingPlayers = false"
      @loaded-tournaments="loadingTournaments = false" />
      
      <br />

      <v-progress-linear
      style="margin: 15% 0"
      color="accent"
      v-show="loadingMatches"
      indeterminate />
      
      <!-- matches table -->
      <v-layout
      id="matches"
      column
      v-show="!loadingMatches">
        <v-layout
        v-show="resultsCount <= 0"
        align-center
        justify-center>
          No matches found!
        </v-layout>

        <template v-if="resultsCount > 0">
          <template v-for="(group, i, j) in groups">
              <v-container
              class="match-group pl-0 pr-0"
              :key="j">
                <MatchHeader
                :group="group._id"
                :uploaded="group.uploaded"
                :timezone="timezone"/>

                <MatchRow
                v-for="(match, k) in group.matches"
                :key="k"
                :p1="match.p1"
                :p2="match.p2"
                :file="match.file ? match.file : null"
                :video="match.video ? match.video : null"
                @update-character="updateCharacter($event.character, $event.index)"
                @update-name="updateName($event.name, $event.index)" />
              </v-container>

              <hr :key="i" v-if="i < groups.length - 1" />
            </template>
          </template>
      </v-layout>

      <!-- pagination -->
      <v-layout
      v-if="!loadingMatches && !(resultsCount <= this.$config.itemsPerPage)"
      class="mt-3">
        <v-spacer/>
        <v-pagination
        color="accent"
        v-model="page"
        :length="resultsCount % this.$config.itemsPerPage === 0 ?
                  Math.floor(resultsCount / this.$config.itemsPerPage) :
                  Math.floor(resultsCount / this.$config.itemsPerPage) + 1"
        :total-visible="$vuetify.breakpoint.smAndUp ? 7 : 5"
        @input="getMatches({players: players, page: page, strict: strict, tournament: tournament, type: type})"
        circle />
        <v-spacer />
      </v-layout>
    </div>
  </div>
</template>

<script>
import MatchRow from '../components/MatchRow.vue'
import MatchHeader from '../components/MatchHeader.vue'
import Filters from '../components/Filters.vue'

export default {
  name: 'Matches',
  components: {
    MatchRow,
    MatchHeader,
    Filters,
  },
  props: {
  },
  data: () => {
    return {
      showToTop: false,
      hidden: false,
      players: [
        {name: null, character: null},
        {name: null, character: null}
      ],
      tournament: {
        name: null,
        num: null,
        date: null,
      },
      strict: false,
      type: null,
      groups: [],
      resultsCount: null,
      page: 1,
      lastVisible: null,
      error: false,
      errorMessage: '',
      timezone: new Date().toLocaleTimeString('en-us',{timeZoneName:'short'}).split(' ')[2],
      loadingMatches: false,
      loadingPlayers: true,
      loadingTournaments: true,
    }
  },
  mounted() {
    this.getMatches({
      players: this.players,
      page: 1,
      strict: this.strict,
      type: this.type,
      tournament: this.tournament,
    })
  },
  watch: {
  },
  methods: {
    getMatches: function (filters) {
      this.loadingMatches = true

      this.$matches.get({filters})
      .then((response) => {
        if (response.ok) {
          this.error = false
          //this.matches = response.body.matches
          this.groups = response.body.groups
          //console.log(JSON.parse(JSON.stringify(this.groups)))
          this.resultsCount = response.body.count

          //console.log(this.resultsCount)
        } else {
          this.error = true
          this.errorMsg = `${response.status}: ${response.statusText}`
          console.log("Error retrieving matches.\n", this.errorMsg)
        }

        this.loadingMatches = false
      })
      .catch((error) => console.log(error))
    },
    updateCharacter(character, i) {
      if (!this.players[i].character || this.players[i].character !== character) {
        // only update character if new character is not the same as current character
        this.$set(this.players[i], 'character', character)

          this.getMatches({
            players: this.players,
            strict: this.strict,
            page: 1,
            tournament: this.tournament,
            type: this.type
          })
      }

      
    },
    updateName(name, i) {
      this.$set(this.players[i], 'name', name)

      this.page = 1

      this.getMatches({
        players: this.players,
        strict: this.strict,
        page: 1,
        tournament: this.tournament,
        type: this.type
      })
      
    },
    updateTournament(tournament) {
      Object.assign(this.tournament, tournament)
      this.page = 1

      this.getMatches({
        players: this.players,
        strict: this.strict,
        page: 1,
        tournament: this.tournament,
        type: this.type
      })
    },
    updateType(type) {
      this.type = type

      this.page = 1

      this.getMatches({
        players: this.players,
        strict: this.strict,
        page: 1,
        tournament: this.tournament,
        type: this.type
      })
    },
    updateStrictness(strict) {
      this.strict = strict

      this.page = 1

      if (JSON.stringify(this.players[0]) !== JSON.stringify(this.players[1])) {
        this.getMatches({
            players: this.players,
            page: 1,
            strict: this.strict,
            type: this.type,
            tournament: this.tournament,
          })
      }
    },
    clearFilters() {
      this.type = null
      this.players = [
        {name: null, character: null},
        {name: null, character: null}
      ]
      this.tournament = {
        name: null,
        num: null,
        date: null
      }
      this.strict = false
      this.page = 1

      this.getMatches({
        players: this.players,
        strict: this.strict,
        page: 1,
        tournament: this.tournament,
        type: this.type
      })
    },
    swap() {
      if (JSON.stringify(this.players[0]) !== JSON.stringify(this.players[1])) {
        var temp = this.players[0]
        this.$set(this.players, 0, this.players[1])
        this.$set(this.players, 1, temp)

        this.getMatches({
          players: this.players,
          strict: this.strict,
          page: 1,
          tournament: this.tournament,
          type: this.type
        })
      }
    },
    onScroll: function (event) {
      this.showToTop = event.currentTarget.scrollY >= 250
    },
  }
}
</script>