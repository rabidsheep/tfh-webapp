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
          <picture
          class="character-icon"
          :title="player.character"
          @click="$emit('update-character', {character: player.character, index: i})">
              <source
              type="image/webp"
              :srcset="require(`../assets/img/sel/${player.character}.webp`) + ' 136w'" />
              <source
              type="image/png"
              :srcset="require(`../assets/img/sel/${player.character}.png`) + ' 136w'" />
              <img
              :alt="player.character"
              :src="require(`../assets/img/sel/${player.character}.webp`)" />
          </picture>

          <p
          class="name"
          :title="player.name"
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
        class="file link"
        :cols="$vuetify.breakpoint.smAndDown? 12 : undefined">
          <v-tooltip
          v-model="show"
          top
          :disabled="!version || $version === version"
          color="accent">
            <template v-slot:activator="{on, attrs}">
              <div
              :class="file ? 'btn' : 'btn disabled'">
                <a
                v-if="file"
                title="Download TFHR File"
                :href="file.url"
                rel="noopener">
                  <v-icon
                  v-bind="attrs"
                  v-on="on"
                  size="36px"
                  color="accent">
                    mdi-download
                  </v-icon>
                </a>

                <v-icon
                v-else-if="!file"
                v-bind="attrs"
                v-on="on"
                size="36px"
                color="buttonDisabled">
                  mdi-download-off
                </v-icon>
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
        </v-col>

        <v-col
        class="video link"
        :cols="$vuetify.breakpoint.smAndDown? 12 : undefined">
          <div
          :class="video ? 'btn' : 'btn disabled'">
            <a
            v-if="video"
            title="Watch on YouTube"
            :href="video.timestamp ?
            `https://youtu.be/${video.id}&t=${video.timestamp}` :
            `https://youtu.be/${video.id}`"
            target="_blank"
            rel="noopener">
              <v-icon
              color="accent"
              class="base"
              size="36px">
                mdi-youtube
              </v-icon>
            </a>

            <YoutubeOff
            v-else-if="!video" />
          </div>
        </v-col>
      </v-col>
    </v-row>
</template>

<script>
import YoutubeOff from '../assets/img/svg/youtube-off.vue'

export default {
  name: 'MatchRow',
  components: {
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
  data: () => {
    return {
      show: false,
    }
  },
}
</script>