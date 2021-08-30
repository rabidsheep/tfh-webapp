<template>
    <v-row class="header">
      <v-col
      class="btn">
        <router-link
        class="edit"
        title="Edit Data"
        :to="{
          path: 'edit',
          query: { uploadId, uploadForm }
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
              <p>{{ group.tournament.num ?
                group.tournament.name + ' ' + group.tournament.num + ' | ' + group.tournament.date :
                group.tournament.name + ' | ' + group.tournament.date }}</p>
            </template>

            <template v-else>
              <p>{{ matchDate ? `Casual | ` + matchDate.date : `Casual` }}</p>
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
    group: [Object, null],
    matchId: [String, null],
    tournamentId: [String, null],
    uploaded: String,
    timezone: String,
    uploadForm: String,
    matchDate: [Object, null],
    uploadId: [String, null]
  },
  data: () => {
    return {
      date: null,
      time: null,
    }
  },
  mounted() {
    this.date = moment(this.uploaded).local(true).format('MM-DD-YYYY')
    this.time = moment(this.uploaded).local(true).format('HH:mm')
  },
}
</script>