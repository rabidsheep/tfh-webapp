<template>
  <v-layout match-row :align-center="!$vuetify.breakpoint.xsOnly" :column="$vuetify.breakpoint.xsOnly">
      <!-- match info (date/patch) -->
      <v-layout match-info :column="!$vuetify.breakpoint.xsOnly" :row="$vuetify.breakpoint.xsOnly">
        <v-flex>
          {{date}}
        </v-flex>
        <div v-if="$vuetify.breakpoint.xsOnly" style="margin: auto 10px;">||</div>
        <v-flex>
          v{{patch}}
        </v-flex>
        <!--<v-flex v-if="this.$version !== patch" :style="$vuetify.breakpoint.xsOnly ? 'margin: 10px' : ''">
          <v-icon class="warning-icon" medium color="#d52726">mdi-alert-circle</v-icon>
        </v-flex>-->
      </v-layout>
      <!-- /match info -->


    <v-layout match-data :row="$vuetify.breakpoint.xsOnly">
      <!-- player info (name/character)-->
      <v-layout players :column="$vuetify.breakpoint.xsOnly">
        <v-flex v-for="(player, i) in players" :key=i :style="$vuetify.breakpoint.xsOnly ? `margin-bottom: 5px;` : ``">
          <v-layout align-center :reverse="i === 0 && $vuetify.breakpoint.smAndUp">
            <!-- *save for possible reuse later -- maybe allow filtering by tournament?*
              <div v-for="(character, j) in player.characters" :key=j>
                <v-avatar tile size="72px">
                  <img :src="require(`../assets/img/pixel/${character.name}.png`)" :alt="character.name" :title="character.name" />
                </v-avatar>
            </div>-->
            <div>
                <v-avatar tile height="100%" :class="$vuetify.breakpoint.smAndUp ? `mr-5 ml-5` : `mr-5`">
                  <img
                  :src="require(`../assets/img/sel/${$characters[player.cid].id}.png`)"
                  :alt="$characters[player.cid].name"
                  :title="$characters[player.cid].name" />
                </v-avatar>
            </div>
            <div class="ma-1">
            {{ player.name }}
            </div>
          </v-layout>
        </v-flex>
        <div class="filler" v-if="$vuetify.breakpoint.smAndUp">
          vs.
        </div>
      </v-layout>
      <!-- /player info -->

      <!-- dl/yt links -->
      <v-layout links :column="$vuetify.breakpoint.xsOnly">

        <v-flex class="icons" large :style="$vuetify.breakpoint.xsOnly ? `margin-bottom: 5px;` : ``">
          <!-- display tooltip if replay is not compatible with current patch -->
          <v-tooltip v-model="show" top :disabled="this.$version === patch" color="primary">
            <template v-slot:activator="{on, attrs}">
              <v-btn icon v-bind="attrs" v-on="on">
                <a target="_blank" :href="`/`">
                  <v-icon large color="#171717">mdi-download</v-icon>
                </a>
              </v-btn>
            </template>
            <div class="tooltip msg">
              <strong>WARNING</strong>
              <br />
              This replay is from an older version of Them's Fightin' Herds.
              <br />
              It may no longer be compatible with the in-game replay system.
            </div>
          </v-tooltip>

        </v-flex>
        <v-flex class="icons" large>
          <v-btn :ripple="false" :disabled="!yt" icon>
            <a :href="ytUrl">
              <v-icon large :color="yt ? '#d52726' : '#5e5e5e'">mdi-youtube</v-icon>
              <div v-if="!yt" class="crossout">
                <v-icon class="yt-unavail">mdi-slash-forward</v-icon>
              </div>
              <!--<v-icon large class="yt-alt" :color="yt ? '#d52726' : '#5e5e5e'">{{ yt ? 'mdi-video' : 'mdi-video-off' }}</v-icon>
            --></a>
          </v-btn>
        </v-flex>
      </v-layout>
      <!-- /links -->
    </v-layout>

  </v-layout>
</template>

<script>
export default {
  name: 'MatchRow',
  props: {
    version: Number,
    date: String,
    patch: Number,
    players: Array,
    dl: Boolean,
    yt: Boolean,
    ytUrl: String,
  },
  data: () => {
    return {
      show: false,
    }
  }
}
</script>

<style scoped lang="scss">
a {
  text-decoration: none;
  color: inherit;
}
.cutoff {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

#matches .v-btn::before, #matches .v-btn::after {
  background-color: transparent;
  opacity: 1;
}

.theme--dark.v-btn.v-btn--disabled .v-icon {
  color: #5e5e5e !important;
}
</style>
