<template>
  <div id="index">
      <div
      class="loading__filters"
      v-if="loadingFilterContent">
          <v-progress-linear
          class="progress__filters"
          color="accent"
          indeterminate />
          Retrieving content...
      </div>

    <div
    class="index__body"
    v-scroll="onScroll"
    v-show="!loadingFilterContent">
      <!-- filters box -->
      <Filters
      :players="filters.deep.players"
      :group="filters.deep.group"
      :channel="filters.deep.channel"
      :video="filters.deep.video"
      :hasFile="filters.deep.hasFile"
      :hasVideo="filters.deep.hasVideo"
      :strict="filters.strict"
      @update-name="filters.deep.players[$event.i].name = $event.name"
      @update-character="filters.deep.players[$event.i].character = $event.character"
      @update-strictness="filters.strict = $event"
      @update-group="filters.deep.group = $event"
      @update-hasfile="filters.deep.hasFile = $event"
      @update-hasvideo="filters.deep.hasVideo = $event"
      @update-channel="filters.deep.channel = $event"
      @update-video="filters.deep.video = $event"
      @clear-filters="clearFilters()"
      @swap="swap()"
      @reset-strictness="strict = false"
      @loaded-filter-content="loadingFilterContent = false" />

      <div
      class="loading__matches"
      v-show="loadingMatches">
        <v-progress-linear
        color="accent"
        class="progress__matches"
        indeterminate />
      </div>
      
      <!-- matches table -->
      <div
      id="matches"
      v-show="!loadingMatches">
        <v-layout
        v-show="resultsCount <= 0"
        align-center
        justify-center>
          No matches found!
        </v-layout>

        <template v-if="resultsCount > 0">
          <template v-for="(group, i, j) in groups">
            <div
            class="match-group"
            :key="j">
              <MatchHeader
              v-bind="group._id"
              :downloadAvailable="group.matches.some((match) => match.fileInfo)"
              :timezone="timezone"
              @generate-zip-file="generateZipFile(group.matches, group._id.uploadId)" />

              <MatchRow
              v-for="(match, k) in group.matches"
              :key="k"
              :p1="match.p1"
              :p2="match.p2"
              :fileInfo="match.fileInfo ? match.fileInfo : null"
              :video="match.video ? match.video : null"
              :order="match.order"
              @update-character="updateCharacter($event.character, $event.index)"
              @update-name="updateName($event.name, $event.index)" />
            </div>

            <hr :key="i" v-if="i < groups.length - 1" />
          </template>
        </template>

        <!-- pagination -->
        <div
        class="pages"
        v-if="!loadingMatches && !(resultsCount <= this.$config.itemsPerPage)">
          <v-pagination
          color="accent"
          v-model="page"
          :length="resultsCount % this.$config.itemsPerPage === 0 ?
                    Math.floor(resultsCount / this.$config.itemsPerPage) :
                    Math.floor(resultsCount / this.$config.itemsPerPage) + 1"
          :total-visible="$vuetify.breakpoint.smAndUp ? 7 : 5"
          @input="getMatches(filters, page)"
          circle />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MatchRow from '../components/MatchRow.vue'
import MatchHeader from '../components/MatchHeader.vue'
import Filters from '../components/Filters.vue'
import JSZip from 'jszip'
import saveAs from 'file-saver'

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
          group: {
            title: null,
            part: null,
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
        this.groups = response.body?.groups
        //console.log(JSON.parse(JSON.stringify(this.groups)))
        this.resultsCount = response.body?.count
        //console.log(this.resultsCount)

        this.loadingMatches = false
        this.stop = false
      })
      .catch((error) => {
          this.errorMsg = `${error.status}: ${error.statusText}`
          console.log("Error retrieving matches.\n", this.errorMsg)

          this.loadingMatches = false
          this.stop = false
      })
    },
    clearFilters() {
      this.stop = true

      this.filters = {
        deep: {
          players: [
            {name: null, character: null},
            {name: null, character: null}
          ],
          group: {
            title: null,
            part: null,
            date: null,
          },
          channel: {
            id: null,
            name: null,
          },
          hasFile: false,
          hasVideo: false,
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
    generateZipFile(matches, groupId) {
      let jszip = new JSZip()

      Promise.all([
        matches.filter((match) => {
          if (match.fileInfo) return true
          else return false
        })
        .map((match) => {
          return jszip.file(match.fileInfo.name,
          this.downloadFileAsPromise(match.fileInfo.url))
        })
      ])
      .then(() => {
        jszip.generateAsync({type: 'blob'})
        .then(function(content) {
          saveAs(content, `${groupId}.zip`)
        })
      })

    },
    downloadFileAsPromise(url) {
      return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.responseType = "arraybuffer";
        xhr.onreadystatechange = function(evt) {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              resolve(xhr.response);
            } else {
              reject(new Error("Error for " + url + ": " + xhr.status));
            }
          }
        };
        xhr.send();
      });
    }
  }
}
</script>

<style scoped>
@import '../assets/css/matches.css';
@import '../assets/css/filters.css';
</style>