<template>
  <div v-scroll="onScroll">
    <!-- filters box -->
    <Filters
    :players="players"
    @update-filter="players = $event"
    @update-strictness="strict = $event" />
    
    
    <div class="loading" style="margin: 20% 0" v-if="loading">
      <v-progress-linear indeterminate v-show="loading"/>
    </div>
    
    <!-- matches table -->
    <v-layout
    id="matches"
    column
    v-if="!loading">
      <template v-if="matches.length > 0">
        <MatchRow
        v-for="(match, i) in matches"
        :key="i"
        v-bind="match"
        :user="user"
        :timezone="timezone"
        @update-character="updateCharacterFilter($event.character, $event.index)"
        @update-name="updateNameFilter($event.name, $event.index)" />
      </template>

      <template v-else>
        <v-layout align-center justify-center>No matches found!</v-layout>
      </template>
    </v-layout>

    <!-- pagination -->
    <v-layout v-if="!loading && !(resultsCount <= this.$config.itemsPerPage)" class="mt-3">
      <v-spacer/>
      <v-pagination
      color="accent"
      v-model="page"
      :length="resultsCount % this.$config.itemsPerPage === 0 ?
                Math.floor(resultsCount / this.$config.itemsPerPage) :
                Math.floor(resultsCount / this.$config.itemsPerPage) + 1"
      :total-visible="$vuetify.breakpoint.smAndUp ? 7 : 5"
      @input="getMatches(players, page, strict)"
      circle
      />
      <v-spacer/>
    </v-layout>
  </div>
</template>

<script>
import MatchRow from '../components/MatchRow.vue'
import Filters from '../components/Filters.vue'

export default {
  name: 'Matches',
  components: {
    MatchRow,
    Filters,
  },
  props: {
    user: [String, null]
  },
  data: () => {
    return {
      showToTop: false,
      hidden: false,
      players: [
        {name: null, character: null},
        {name: null, character: null}
      ],
      strict: false,
      matches: [],
      resultsCount: null,
      page: 1,
      lastVisible: null,
      loading: false,
      error: false,
      errorMessage: '',
      timezone: new Date().toLocaleTimeString('en-us',{timeZoneName:'short'}).split(' ')[2]
    }
  },
  watch: {
    'players': {
      handler: function() {
        this.getMatches(this.players, 1, this.strict)
        // move paginate back to page 1 after changing filters
        this.page = 1
      },
      deep: true
    },
    'strict': function() {
      this.getMatches(this.players, 1, this.strict)
    }
  },
  methods: {
    getMatches: function (players, page, strict) {
      this.loading = true

      this.$matches.get({players, page, strict})
      .then((response) => {
        if (response.ok) {
          this.error = false
          this.matches = response.body.matches
          this.resultsCount = response.body.count
        } else {
          this.error = true
          this.errorMsg = `${response.status}: ${response.statusText}`
          console.log("Error retrieving matches.\n", this.errorMsg)
        }

        this.loading = false
      })
    },
    updateCharacterFilter(character, i) {
      if (!this.players[i].character || this.players[i].character.name !== character.name) {
        this.$set(this.players[i], 'character', character)
      }
    },
    updateNameFilter(name, i) {
      if (!this.players[i].name || this.players[i].name !== name) {
        this.$set(this.players[i], 'name', name)
      }
    },
    onScroll: function (event) {
      this.showToTop = event.currentTarget.scrollY >= 250
    },
  }
}
</script>