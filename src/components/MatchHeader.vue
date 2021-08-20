<template>
    <v-row class="header">
      <v-col
      class="btn">
        <router-link
        class="edit"
        :to="`edit?id=${_id}`">
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
            <template v-if="tournament">
              <p>{{ tournament.name }}

              <template v-if="tournament.num">
                {{ tournament.num }}
              </template>
              </p>

              <div class="mr-1 ml-1">|</div>

              <p>{{ _id.tournament.date }}</p>
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
    _id: Object,
    tournament: [Object, null],
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
 created() {
      /* convert timestamp to date and format it */
      this.date = moment(this.uploaded).local(true).format('MM-DD-YYYY')
      this.time = moment(this.uploaded).local(true).format('HH:mm')
  }
}
</script>