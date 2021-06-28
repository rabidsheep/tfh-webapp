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
      filters: [{
          p1: [{ name: '', character: '' }],
          p2: [{ name: '', character: '' }]
        }],
      matches: [{
          date: '06/26/27',
          patch: 2.07,
          players: [
            { name: 'player 1', cid: 1 },
            { name: 'player 2', cid: 2 }
          ],
          dl: true,
          yt: true
        },
        {
          date: '04/25/23',
          patch: 2.03,
          players: [
            { name: 'player 3', cid: 3 },
            { name: 'player 4', cid: 4 }
          ],
          dl: true,
          yt: false
        }]
    }
  },
  methods: {
    onScroll: function (event) {
      this.showToTop = event.currentTarget.scrollY >= 250
    }
  }
}
</script>