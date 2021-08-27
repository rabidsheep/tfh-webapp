<template>
    <v-row
    class="match"
    align="center"
    justify="center">
      <v-col class="players" :cols="$vuetify.breakpoint.smAndDown ? 10 : 10">
        <v-col
        :cols="$vuetify.breakpoint.smAndDown ? 12 : 6"
        :class="`player p${i+1}`"
        v-for="(player, i) in [p1, p2]"
        :key="i">
          <img
          class="character-icon"
          :src="require(`../assets/img/sel/${player.character}.png`)"
          :alt="player.character"
          :title="player.character"
          @click="$emit('update-character', {character: player.character, index: i})" />

          <p
          class="name"
          @click="$emit('update-name', {name: player.name, index: i})">
            {{ player.name }}
          </p>
          
        </v-col>

        <v-col
        v-show="!$vuetify.breakpoint.smAndDown"
        class="vs">
        vs
        </v-col>
      </v-col>

      <v-col
      class="links">
        <v-col
        :cols="$vuetify.breakpoint.smAndDown? 12 : undefined"
        :class="i === 1 ? 'file link' : 'video link'"
        v-for="i in 2"
        :key="i">
          <template v-if="i === 1">
            <v-tooltip
            v-model="show"
            top
            :disabled="!version || $version === version"
            color="accent">
              <template v-slot:activator="{on, attrs}">
                <div
                :class="file ? 'btn' : 'btn disabled'"
                style="position: relative;">
                  <template v-if="file">
                    <a :href="file.url" >
                      <v-icon
                      v-bind="attrs"
                      v-on="on"
                      size="36px"
                      color="accent">
                        mdi-download
                      </v-icon>
                    </a>
                  </template>

                  <template v-else-if="!file">
                    <DownloadOff />
                  </template>
                </div>
              </template>

              <div class="tooltip msg">
                <center>
                  <strong>WARNING</strong>
                  <br />
                  This file contains an outdated replay version stamp.
                  <br />
                  It may no longer be compatible with the in-game replay system.
                </center>
              </div>
            </v-tooltip>
          </template>

          <template v-else>
            <div
            :class="video ? 'btn' : 'btn disabled'">
            <div style="position: relative;">
              <template v-if="!video">
                <YoutubeOff />
              </template>

              <a
              v-else-if="video"
              :href="video.timestamp ?
              `${video.url}&t=${video.timestamp}` :
              `${video.url}`"
              :target="`_blank`">
                <v-icon
                color="accent"
                class="base"
                size="36px">
                  mdi-youtube
                </v-icon>
              </a>
              </div>
            </div>
          </template>
        </v-col>
      </v-col>
    </v-row>
</template>

<script>
import DownloadOff from '.././assets/img/download-off.vue'
import YoutubeOff from '.././assets/img/youtube-off.vue'

export default {
  name: 'MatchRow',
  components: {
    DownloadOff,
    YoutubeOff,
  },
  props: {
    version: Number,
    p1: Object,
    p2: Object,
    file: {
      url: String,
      name: String,
    },
    video: {
      url: String,
      timestamp: String,
    },
  },
  mounted: function() {
  },
  data: () => {
    return {
      show: false,
    }
  },
}
</script>