<template>
    <v-row :id="_id" class="match" align="center">
      <v-layout unique row align-center>
        <v-icon
        :size="$vuetify.breakpoint.smAndDown ? '22px' : '32px'"
        color="primary">
          mdi-square-edit-outline
        </v-icon>

        <div
        v-show="$vuetify.breakpoint.smAndDown"
        :class="$vuetify.breakpoint.smAndDown ? `divider mr-2 ml-2` : `divider`">
        ||
        </div>

        <div
        :class="$vuetify.breakpoint.smAndDown ? `date` : `date mr-3 ml-3`">
          {{ date }}
        </div>


        <div
        v-show="$vuetify.breakpoint.smAndDown"
        :class="$vuetify.breakpoint.smAndDown ? `divider mr-2 ml-2` : `divider`">
          @
        </div>

        <div
        :class="$vuetify.breakpoint.smAndDown ? `time` : `time mr-3`">
          {{ time }} UTC
        </div>
      </v-layout>

      <v-layout players>
        <v-row>
          <v-col
          :cols="$vuetify.breakpoint.smAndDown ? 12 : 5"
          :class="`player p${i+1}`"
          v-for="(player, i) in players"
          :key="i">
            <img
            class="character-icon"
            :src="require(`../assets/img/sel/${player.character.id}.png`)"
            :alt="player.character.name"
            :title="player.character.name"
            @click="$emit('update-character', {character: player.character, index: i})" />

            <p
            class="name"
            @click="$emit('update-name', {name: player.name, index: i})">
              {{ player.name }}
            </p>
            
          </v-col>

          <v-col
          :cols="1"
          v-show="!$vuetify.breakpoint.smAndDown"
          class="vs">
          vs
          </v-col>
        </v-row>
      </v-layout>

      <v-layout
      links>
        <v-row>
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
              color="primary">
                <template v-slot:activator="{on, attrs}">
                  <div
                  :class="file ? 'btn' : 'btn disabled'"
                  style="position: relative;">
                    <template v-if="file">
                      <a :href="file.url">
                        <v-icon
                        v-bind="attrs"
                        v-on="on"
                        x-large
                        color="#171717">
                          mdi-download
                        </v-icon>
                      </a>
                    </template>

                    <template v-else-if="!file">
                      <v-icon
                      class="base"
                      x-large>
                        mdi-download
                      </v-icon>

                      <div
                      class="slash">
                        <v-icon
                        x-large>
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
                  x-large>
                    mdi-youtube
                  </v-icon>

                  <div
                  class="slash">
                    <v-icon
                    x-large>
                      mdi-slash-forward
                    </v-icon>
                  </div>
                </template>

                <a
                v-else-if="video.url"
                :href="video.timestamp ?
                `${video.url}&t=${video.timestamp}` :
                `${video.url}`">
                  <v-icon
                  color="#d52726"
                  class="base"
                  x-large>
                    mdi-youtube
                  </v-icon>
                </a>
                </div>
              </div>
            </template>
          </v-col>
        </v-row>
      </v-layout>
    </v-row>
</template>

<script>
import moment from 'moment'

export default {
  name: 'MatchRow',
  props: {
    _id: String,
    version: Number,
    players: Array,
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
  },
  data: () => {
    return {
      show: false,
      date: null,
      time: null,
    }
  },
 created() {
      /* convert timestamp to date and format it */
      /*var date = (this.timestamp).toDate();*/
      this.date = moment(this.uploadDate).format('MM/DD/YYYY');
      this.time = moment(this.uploadDate + 'T' + this.uploadTime).utc().format('HH:mm:ss');
  }
}
</script>