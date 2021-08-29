<template>
  <div id="index">
      <div
      class="loading"
      v-if="loadingFilterContent"
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
    v-show="!loadingFilterContent">
      <!-- filters box -->
      <Filters
      :players="filters.deep.players"
      :tournament="filters.deep.tournament"
      :channel="filters.deep.channel"
      :video="filters.deep.video"
      :type="filters.deep.type"
      :hasFile="filters.deep.hasFile"
      :hasVideo="filters.deep.hasVideo"
      :strict="filters.strict"
      @update-name="filters.deep.players[$event.i].name = $event.name"
      @update-character="filters.deep.players[$event.i].character = $event.character"
      @update-strictness="filters.strict = $event"
      @update-type="filters.deep.type = $event"
      @update-tournament="filters.deep.tournament = $event"
      @update-hasfile="filters.deep.hasFile = $event"
      @update-hasvideo="filters.deep.hasVideo = $event"
      @update-channel="filters.deep.channel = $event"
      @update-video="filters.deep.video = $event"
      @clear-filters="clearFilters()"
      @swap="swap()"
      @reset-strictness="strict = false"
      @loaded-filter-content="loadingFilterContent = false" />
      
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
        @input="getMatches(filters, page)"
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
      filters: {
        deep: {
          players: [
            {name: null, character: null},
            {name: null, character: null}
          ],
          tournament: {
            name: null,
            num: null,
            date: null,
          },
          channel: {
            id: null,
            name: null,
          },
          video: {
            id: null,
            title: null,
          },
          hasFile: false,
          hasVideo: false,
          type: null,
        },
        strict: false,
      },
      page: 1,
      groups: [],
      resultsCount: null,
      lastVisible: null,
      error: false,
      errorMessage: '',
      timezone: new Date().toLocaleTimeString('en-us',{timeZoneName:'short'}).split(' ')[2],
      loadingMatches: false,
      loadingFilterContent: true,
      stop: false,
      oldStrict: false
    }
  },
  mounted() {
    this.getMatches(this.filters, 1)
  },
  watch: {
    'filters.deep': {
      handler: function() {
          this.page = 1
          this.getMatches(this.filters, 1)
      },
      deep: true
    },
    'filters.strict': function() {
      let p1 = JSON.stringify(this.filters.deep.players[0])
      let p2 = JSON.stringify(this.filters.deep.players[1])

      // do not update matches if sides are the same OR filters were just cleared
      if (!this.stop && p1 !== p2) {
        this.page = 1
        this.getMatches(this.filters, 1)
      }
    }
  },
  methods: {
    getMatches: function (filters, page) {
      this.loadingMatches = true

      this.$matches.get({
        filters: {
          strict: filters.strict,
          ...filters.deep
        },
        page: page
      })
      .then((response) => {
        if (response.ok) {
          this.error = false
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
        this.stop = false
      })
      .catch((error) => console.log(error))
    },
    clearFilters() {
      this.stop = true

      this.filters = {
        deep: {
          players: [
            {name: null, character: null},
            {name: null, character: null}
          ],
          tournament: {
            name: null,
            num: null,
            date: null,
          },
          channel: {
            id: null,
            name: null,
          },
          hasFile: false,
          hasVideo: false,
          type: null,
        },
        strict: false,
      }
    },
    updateCharacter(character, i) {
      if (this.filters.deep.players[i].character !== character) {
        this.filters.deep.players[i].character = character
      }
    },
    updateName(name, i) {
      if (this.filters.deep.players[i].name !== name) {
        this.filters.deep.players[i].name = name
      }
    },
    swap() {
      let p1 = JSON.stringify(this.filters.deep.players[0])
      let p2 = JSON.stringify(this.filters.deep.players[1])

      // do not swap if sides are the same
      if (p1 !== p2) {
        this.filters.deep.players = [this.filters.deep.players[1], this.filters.deep.players[0]]
      }
    },
    onScroll: function (event) {
      this.showToTop = event.currentTarget.scrollY >= 250
    },
  }
}
</script>

<style scoped>
@import '../assets/css/matches.css';
@import '../assets/css/filters.css';
</style>