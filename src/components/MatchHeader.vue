<template>
    <v-row class="header">
      <v-col
      class="btn">
        <router-link
        class="edit"
        :to="{
          path: 'edit',
          query: group.tournament ?
          { tournamentId: group.id,
          videoId: group.videoId,
          fromUser: group.uploadedBy }
           :
          { matchId: group.id }
        }">
        <!-- edit?id=${_id} -->
          <v-icon
          size="30px"
          color="accent">
            mdi-square-edit-outline
          </v-icon>
        </router-link>
      </v-col>

      <v-divider class="mr-3 ml-2" vertical/>

      <v-col
      class="data">
        <v-col
        cols="12">
          <v-row>
            <p>{{ date }}</p>
            <div class="mr-1 ml-1">@</div>
            <p>{{ time }} {{ timezone }}</p>
          </v-row>
        </v-col>

        <v-col
        cols="12">
          <v-row>
            <template v-if="group.tournament">
              <p>{{ group.tournament.name }}

              <template v-if="group.tournament.num">
                {{ group.tournament.num }}
              </template>
              </p>

              <div class="mr-1 ml-1">|</div>

              <p>{{ group.tournament.date }}</p>
            </template>

            <template v-else>
              <p>Casual</p>
            </template>
          </v-row>
        </v-col>
      </v-col>
    </v-row>
</template>

<script>
import moment from 'moment'

export default {
  name: 'MatchHeader',
  props: {
    group: Object,
    matchId: [String, null],
    tournamentId: [String, null],
    uploaded: String,
    timezone: String,
  },
  mounted: function() {
  },
  data: () => {
    return {
      date: null,
      time: null,
    }
  },
  mounted() {

  },
  created() {
      /* convert timestamp to date and format it */
      this.date = moment(this.uploaded).local(true).format('MM-DD-YYYY')
      this.time = moment(this.uploaded).local(true).format('HH:mm')
  },
  methods: {
  }
}
</script>