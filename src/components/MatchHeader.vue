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
            <template v-if="tournament">
              <p>{{ tournament.num ?
                tournament.name + ' ' + tournament.num + ' | ' + tournament.date :
                tournament.name + ' | ' + tournament.date }}</p>
            </template>

            <template v-else>
              <p>{{ originalDate ? `Casual | ` + originalDate : `Casual` }}</p>
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
    uploadId: String,
    uploadForm: String,
    uploadDate: String,
    originalDate: String,
    timezone: String,
    tournament: [Object, null],
    video: [String, null],
    channel: [String, null],

  },
  data: () => {
    return {
      date: null,
      time: null,
    }
  },
  mounted() {
    this.date = moment(this.uploadDate).local(true).format('MM-DD-YYYY')
    this.time = moment(this.uploadDate).local(true).format('HH:mm')
  },
}
</script>