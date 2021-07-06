<template>
  <div v-scroll="onScroll">
    <Filters />

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
import Filters from '../components/Filters.vue'
import firebase from 'firebase'

export default {
  name: 'Matches',
  components: {
    MatchRow,
    Filters
  },
  props: {
    query: Object,
  },
  data: () => {
    return {
      showToTop: false,
      showCompatible: true,
      resultsCount: -1,
      loading: false,
      error: false,
      errorMessage: '',
      filters: [
          { name: null, character: null },
          { name: null, character: null }
        ],
      matches: []
    }
  },
  mounted: function() {
    this.getMatches(this.query)
  },
  watch: {
    query: function(query) {
      this.getMatches(query)
    }
  },
  methods: {
    getMatches: function () {
      const db = firebase.firestore();
      this.loading = true;

        /* sort by timestamp */
        db.collection('matches').orderBy('timestamp','desc').get()
          .then((querySnapshot) => {
            this.loading = false;
            /* maps objects so they don't display as [Object object] */
            this.matches = querySnapshot.docs.map(doc => doc.data());
            
          })
    },
    onScroll: function (event) {
      this.showToTop = event.currentTarget.scrollY >= 250
    }
  }
}
</script>