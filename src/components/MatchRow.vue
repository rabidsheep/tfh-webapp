<template>
  <v-col>
    <v-row class="header">
      <v-layout unique row align-center>
        <router-link
        :user="user"
        class="edit"
        :to="`edit?id=${_id}`">
          <v-icon
          size="22px"
          color="accent">
            mdi-square-edit-outline
          </v-icon>
        </router-link>

        <div
        class='divider mr-2 ml-2'>
        ||
        </div>

        <div
        class="date">
          {{ date }}
        </div>


        <div
        class='divider mr-2 ml-2'>
        @
        </div>

        <div
        class="time">
          {{ time }} {{ timezone }}
        </div>
      </v-layout>
    </v-row>
      
    <v-row
    class="match"
    align="center"
    v-for="(match, n) in matches"
    :key="n">
      <v-col class="players" cols="10">
        <v-col
        :cols="$vuetify.breakpoint.xsOnly ? 12 : 6"
        :class="`player p${i+1}`"
        v-for="(player, i) in [match.p1, match.p2]"
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
        v-show="!$vuetify.breakpoint.xsOnly"
        class="vs">
        vs
        </v-col>
      </v-col>

      <v-col
      class="links">
        <v-col
        :cols="$vuetify.breakpoint.xsOnly? 12 : undefined"
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
                      color="#171717">
                        mdi-download
                      </v-icon>
                    </a>
                  </template>

                  <template v-else-if="!file">
                    <v-icon
                    class="base"
                    size="36px">
                      mdi-download
                    </v-icon>

                    <div
                    class="slash">
                      <v-icon
                      size="36px">
                        mdi-slash-forward
                      </v-icon>
                    </div>
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
                <v-icon
                class="base"
                size="36px">
                  mdi-youtube
                </v-icon>

                <div
                class="slash">
                  <v-icon
                  size="36px">
                    mdi-slash-forward
                  </v-icon>
                </div>
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
  </v-col>
</template>

<script>
import moment from 'moment'

export default {
  name: 'MatchRow',
  props: {
    _id: String,
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
    uploadDate: String,
    uploadTime: String,
    timezone: String,
    matches: Array,
    user: [String, null],
  },
  mounted: function() {
  },
  data: () => {
    return {
      hidden: true,
      show: false,
      date: null,
      time: null,
    }
  },
 created() {
      /* convert timestamp to date and format it */
      let fullDate = this.uploadDate + 'T' + this.uploadTime
      this.date = moment(fullDate).local(true).format('MM/DD/YYYY')
      this.time = moment(fullDate).local(true).format('HH:mm')
  }
}
</script>