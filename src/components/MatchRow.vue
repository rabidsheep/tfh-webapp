<template>
  <v-row>
    <v-layout
    match
    :align-center="!$vuetify.breakpoint.xsOnly"
    :align-content-center="!$vuetify.breakpoint.xsOnly"
    :row="$vuetify.breakpoint.xsOnly">
      <v-layout
      unique
      :row="$vuetify.breakpoint.xsOnly">
        <v-layout
        column
        uploadId
        :justify-center="!$vuetify.breakpoint.xsOnly">
          <template v-if="$vuetify.breakpoint.xsOnly">
            <span><b>ID</b>: {{ id }}</span>
          </template>

          <template v-else-if="!$vuetify.breakpoint.xsOnly">
            {{ id }}
          </template>
        </v-layout>
        
        <v-layout
        column
        v-if="$vuetify.breakpoint.xsOnly"
        style="margin: auto 10px;">
          ||
        </v-layout>

        <!-- timestamp -->
        <v-layout
        column
        timestamp
        :justify-center="!$vuetify.breakpoint.xsOnly">
            {{ uploadDate }}
        </v-layout>
        <!-- /timestamp -->
        
        <a
        v-if="$vuetify.breakpoint.xsOnly"
        href="/">
          <v-icon
          large
          color="#171717">
            mdi-square-edit-outline
          </v-icon>
        </a>
      </v-layout>

        <v-layout general>
        <!-- players -->
        <v-layout
        players
        :column="$vuetify.breakpoint.xsOnly"
        :align-center="!$vuetify.breakpoint.xsOnly">
          <div
          :class="`player p${i+1}`"
          v-for="(player, i) in players"
          :key=i
          :style="$vuetify.breakpoint.xsOnly ? `margin-bottom: 10px;` : ``">
            <v-layout
            content
            align-center
            :reverse="i === 0 && $vuetify.breakpoint.smAndUp">
              <div
              class="player__icon icon">
                  <v-avatar
                  tile
                  height="100%"
                  >
                  <!--:class="$vuetify.breakpoint.smAndUp ? `mr-5 ml-5` : `mr-5`"-->
                    <img
                    :src="require(`../assets/img/sel/${player.character.id}.png`)"
                    :alt="`player.character.name`"
                    :title="`player.character.name`" />
                  </v-avatar>
              </div>

              <div
              class="player__name">
                {{ player.name }}
              </div>
            </v-layout>
          </div>

          <div
          class="vs"
          v-if="$vuetify.breakpoint.smAndUp">
            vs.
          </div>
        </v-layout>
        <!-- /players -->

        <!-- links -->
        <v-layout
        links
        :column="$vuetify.breakpoint.xsOnly"
        align-center>
          <!-- display tooltip if replay is not compatible with current patch -->
          <v-tooltip
          v-model="show"
          top
          :disabled="this.$version === version"
          color="primary">
            <template v-slot:activator="{on, attrs}">
                <a :href="fileUrl">
                  <v-icon
                  v-bind="attrs"
                  v-on="on"
                  large
                  color="#171717">
                    mdi-download
                  </v-icon>
                </a>
            </template>

            <div class="tooltip msg">
              <strong>WARNING</strong>
              <br />
              This file contains an outdated replay version stamp.
              <br />
              It may no longer be compatible with the in-game replay system.
            </div>
          </v-tooltip>

          <div
          style="position: relative;">
            <template v-if="!ytUrl">
                <v-icon
                large
                color="#5e5e5e">
                  mdi-youtube
                </v-icon>

                <div
                v-if="!ytUrl"
                class="yt-unavail">
                  <v-icon>
                    mdi-slash-forward
                  </v-icon>
                </div>
            </template>

            <a
            v-else-if="ytUrl"
            :href="ytUrl">
              <v-icon
              large
              color="#d52726">
                mdi-youtube
              </v-icon>
            </a>
          </div>

          <a v-if="!$vuetify.breakpoint.xsOnly" href="/">
            <v-icon large color="#171717">
              mdi-square-edit-outline
            </v-icon>
          </a>
        </v-layout>
      <!-- /links -->
      </v-layout>
    </v-layout>
  </v-row>
</template>

<script>
import moment from 'moment';

export default {
  name: 'MatchRow',
  props: {
    version: Number,
    timestamp: String,
    players: Array,
    fileUrl: String,
    ytUrl: String,
  },
  data: () => {
    return {
      id: '0001',
      show: false,
      uploadDate: null,
      uploadTime: null,
    }
  },
 created() {
      /* convert timestamp to date and format it */
      /*var date = (this.timestamp).toDate();*/
      this.uploadDate = moment(this.timestamp).format('MM/DD/YYYY');
      this.uploadTime = moment(this.timestamp).utc().format('HH:mm:ss');
  }
}
</script>

<style scoped lang="scss">
.theme--dark .match .v-btn.v-btn--disabled .v-icon {
  color: #5e5e5e !important;
}
</style>
