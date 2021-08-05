<template>
  <div v-scroll="onScroll">
    <!-- filters box -->
    <Filters
    @update-filter="filters = $event" />
    
    <!-- matches table -->
    <div class="loading" style="margin: 20% 0" v-if="loading">
      <v-progress-linear indeterminate v-show="loading"/>
    </div>

      <v-layout
      id="matches"
      column
      v-if="!loading">
      <template v-if="matches.length > 0">
        <MatchRow
          v-for="(match, i) in matches"
          :key="i"
          v-bind="match"
        />
      </template>

      <template v-else>
      <v-layout align-center justify-center>No matches found!</v-layout>
      </template>
      </v-layout>

    <!-- pagination -->
    <v-layout v-if="!loading && !(resultsCount <= this.$config.itemsPerPage)" class="mt-3">
      <v-spacer/>
      <v-pagination
      v-model="page"
      :length="resultsCount % this.$config.itemsPerPage === 0 ?
                Math.floor(resultsCount / this.$config.itemsPerPage) :
                Math.floor(resultsCount / this.$config.itemsPerPage) + 1"
      :total-visible="$vuetify.breakpoint.smAndUp ? 7 : 5"
      @input="getMatches(filters, page)"
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
  data: () => {
    return {
      showToTop: false,
      hidden: false,
      filters: [
        {name: null, character: null},
        {name: null, character: null}
      ],
      matches: [],
      headers: {
        unique: [
          { title: 'ID', code: 'id' },
          { title: 'Upload Date', code: 'date' },
        ],
        general: {
          players: [
            { title: 'P1', code: 'p1' },
            { title: 'P2', code: 'p2' },
          ],
          links: [
            { title: 'File', code: 'file' },
            { title: 'YouTube', code: 'yt' },
          ]
        }
      },
      resultsCount: null,
      page: 1,
      lastVisible: null,
      loading: false,
      error: false,
      errorMessage: '',
    }
  },
  mounted: function() {
    this.getMatches(this.filters, 1)
  },
  watch: {
    'filters': {
      handler: function() {
        this.getMatches(this.filters, 1)
        // move paginate back to page 1 after changing filters
        this.page = 1
      },
      deep: true
    },
  },
  computed: {
    setWidth() {
      if (this.$vuetify.breakpoint.xsOnly) {
        return 'xs'
      
      } else {
        return ''
      }
    }
  },
  methods: {
    getMatches: function (filters, page) {
      this.loading = true

      this.$matches.get({filters, page})
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
    onScroll: function (event) {
      this.showToTop = event.currentTarget.scrollY >= 250
    },
  }
}
</script>

<style scoped>
.table-headers {
  display: grid;
  width: 100%;
  text-align: center;
}

.table-headers .v-btn {
  width: 100%;
}
</style>