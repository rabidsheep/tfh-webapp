<template>
  <div
  id="index">
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
      :playerList="playerList"
      :groupList="groupList"
      :channelList="channelList"
      :allVideos="allVideos"
      @update-name="filters.deep.players[$event.index].name = $event.name"
      @update-character="filters.deep.players[$event.index].character = $event.character"
      @update-strictness="filters.strict = $event"
      @update-group="filters.deep.group = $event"
      @update-hasfile="filters.deep.hasFile = $event"
      @update-hasvideo="filters.deep.hasVideo = $event"
      @update-channel="updateChannel($event)"
      @update-video="filters.deep.video = $event"
      @clear-filters="clearFilters()"
      @swap="swap()"
      @reset-strictness="filters.strict = false" />

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
        v-show="groups.length <= 0"
        align-center
        justify-center>
          No matches found!
        </v-layout>

        <template v-if="groups.length > 0">
          <template v-for="(group, i, j) in groups">
            <div
            class="match-group"
            :key="j">
              <MatchHeader
              v-bind="group._id"
              :downloadAvailable="group.matches.some((match) => match.fileInfo)"
              :timezone="timezone"
              @generate-zip-file="generateZipFile(group.matches, group._id.group)" />

              <MatchRow
              v-for="(match, k) in group.matches"
              v-show="!hideMatches[i] || hideMatches[i] && k < 8"
              :key="k"
              :p1="match.p1"
              :p2="match.p2"
              :fileInfo="match.fileInfo ? match.fileInfo : null"
              :video="match.video ? match.video : null"
              :order="match.order"
              @update-character="updateCharacter($event.character, $event.index)"
              @update-name="updateName($event.name, $event.index)" />

              <v-btn
              class="show"
              height="40px"
              v-if="group.matches.length > 8"
              @click="$set(hideMatches, i, !hideMatches[i])"
              tile>
                {{ hideMatches[i] ? 'Show ' + (group.matches.length - 8) + ' More' : 'Show Less' }}
                <v-icon right color="accent">
                  {{ hideMatches[i] ? 'mdi-chevron-double-down' : 'mdi-chevron-double-up' }}
                </v-icon>
              </v-btn>
            </div>

            <hr :key="i" v-if="i < groups.length - 1" />
          </template>
        </template>

        <!-- pagination -->
        <div
        class="pages"
        v-if="!loadingMatches && resultsCount > this.$itemsPerPage">
          <v-pagination
          color="accent"
          v-model="page"
          :length="resultsCount % this.$itemsPerPage === 0 ?
                    Math.floor(resultsCount / this.$itemsPerPage) :
                    Math.floor(resultsCount / this.$itemsPerPage) + 1"
          :total-visible="$vuetify.breakpoint.smAndUp ? 7 : 5"
          @input="getMatches(filters, page)"
          circle />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MatchRow from '../components/MatchRow.vue';
import MatchHeader from '../components/MatchHeader.vue';
import Filters from '../components/Filters.vue';
import JSZip from 'jszip';
import saveAs from 'file-saver';

export default {
  name: 'Matches',

  components: {
    MatchRow,
    MatchHeader,
    Filters,
  },

  data: () => {
    return {
      hidden: false,
      hideMatches: [true, true, true, true, true],
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
          channel: null,
          video: null,
          hasFile: false,
          hasVideo: false,
        },
        strict: false,
      },
      page: 1,
      groups: [],
      groupList: [],
      playerList: [],
      channelList: [],
      allVideos: [],
      resultsCount: null,
      lastVisible: null,
      error: false,
      errorMessage: '',
      timezone: new Date().toLocaleTimeString('en-us',{timeZoneName:'short'}).split(' ')[2],
      loadingMatches: false,
      loadingFilterContent: true,
      stop: false,
    }
  },

  mounted() {
    return this.loadContent().then(() => this.getMatches(this.filters, 1));
  },

  watch: {
    'filters.deep': {
      handler: function() {
        this.page = 1;
        this.getMatches(this.filters, 1);
      },
      deep: true
    },

    'filters.strict': function() {
      let p1 = JSON.stringify(this.filters.deep.players[0]);
      let p2 = JSON.stringify(this.filters.deep.players[1]);

      // do not update matches if sides are the same OR filters were just cleared
      if (!this.stop && p1 !== p2) {
        this.page = 1;
        this.getMatches(this.filters, 1);
      }
    }
  },

  methods: {
    // retrieve content for dropdown lists
    loadContent() {
      return this.$filterContent.get()
      .then((response) => {
          this.error = false;
          this.groupList = response.body?.groups;
          this.playerList = response.body?.players;
          this.channelList = response.body?.channels;
          this.allVideos = response.body?.videos;
          this.loadingFilterContent = false;

          //this.printObj(this.playerList)
      })
      .catch((error) => {
          this.errorMsg = `${error.status}: ${error.statusText}`;
          console.log("Error retrieving filter content.\n", this.errorMsg);
          this.loadingFilterContent = false;
      })
    },

    getMatches(filters, page) {
      this.loadingMatches = true

      return this.$matches.get({
        filters: {
          strict: filters.strict,
          ...filters.deep
        },
        page: page
      })
      .then((response) => {
        this.groups = response.body?.groups;
        //console.log(JSON.parse(JSON.stringify(this.groups)));
        this.resultsCount = response.body?.count;
        //console.log(this.resultsCount);

        this.loadingMatches = false;
        this.stop = false;
      })
      .catch((error) => {
          this.errorMsg = `${error.status}: ${error.statusText}`;
          console.log("Error retrieving matches.\n", this.errorMsg);

          this.loadingMatches = false;
          this.stop = false;
      })
    },

    clearFilters() {
      this.stop = true;

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
          channel: null,
          video: null,
          hasFile: false,
          hasVideo: false,
        },
        strict: false,
      };
    },

    updateCharacter(character, i) {
      if (this.filters.deep.players[i].character !== character)
        this.filters.deep.players[i].character = character;
    },

    updateName(name, i) {
      if (this.filters.deep.players[i].name !== name)
        this.filters.deep.players[i].name = name;
    },

    updateChannel(channel) {
      this.filters.deep.channel = channel
    },

    swap() {
      let p1 = JSON.stringify(this.filters.deep.players[0]);
      let p2 = JSON.stringify(this.filters.deep.players[1]);

      // do not swap if sides are the same
      if (p1 !== p2)
        this.filters.deep.players = [this.filters.deep.players[1], this.filters.deep.players[0]];
    },

    generateZipFile(matches, group) {
      let jszip = new JSZip();
      let zipName = `${group.date}_${group.title.replace(/\s/g, '_').replace(/[-[\]'{}()*+?.,\\^$|]/g, '')}.zip`;

      Promise.all([
        matches.filter((match) => {
          if (match.fileInfo)
            return true;
          else
            return false;
        })
        .map((match) => jszip.file(match.fileInfo.name, this.downloadFileAsPromise(match.fileInfo.url)))
      ])
      .then(() => jszip.generateAsync({type: 'blob'}))
      .then((content) => saveAs(content, zipName));
    },

    downloadFileAsPromise(url) {
      return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.responseType = "arraybuffer";
        xhr.onreadystatechange = function(evt) {
          if (xhr.readyState === 4) {
            if (xhr.status === 200)
              resolve(xhr.response);
            else
              reject(new Error("Error for " + url + ": " + xhr.status));
          }
        };

        xhr.send();
      });
    },

    hide(i) {
      this.$set(this.hideMatches, i, !this.hideMatches[i])
    }
  }
}
</script>

<style scoped>
@import '../assets/css/matches.css';
@import '../assets/css/filters.css';
</style>