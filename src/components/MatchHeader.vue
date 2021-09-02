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
        class="group">
          <v-col
          class="date"
          cols="12">
              <p>{{ date }} @ {{ time }} {{ timezone }}</p>
          </v-col>

        <v-col
        class="group-info"
        cols="12">
          <template v-if="tournament">
            <p>
              {{ tournament.num ?
                tournament.name + ' | ' + tournament.num + ' | ' + tournament.date :
                tournament.name + ' | ' + tournament.date }}
            </p>
          </template>

          <template v-else>
            <p>{{ 'Casual | ' + originalDate }}</p>
          </template>
        </v-col>
        
        </v-col>

        <v-col
        class="download-all">
          <v-icon
          size="36px"
          color="accent"
          title="Download All Files"
          :disabled="!downloadAvailable"
          @click="$emit('generate-zip-file')"
          v-if="downloadAvailable">
              mdi-folder-download
          </v-icon>

          <div class="v-icon" v-else>
            <FolderDownloadOff />
          </div>
        </v-col>
      </v-col>
    </v-row>
</template>

<script>
import moment from 'moment'
import FolderDownloadOff from '../assets/img/svg/folder-download-off.vue'

export default {
  name: 'MatchHeader',
  components: {
    FolderDownloadOff,
  },
  props: {
    uploadId: String,
    uploadForm: String,
    uploadDate: String,
    originalDate: String,
    timezone: String,
    tournament: [Object, null],
    video: [String, null],
    channel: [String, null],
    downloadAvailable: Boolean

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