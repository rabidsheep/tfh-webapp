<template>
    <div class="header">
      <div
      class="edit">
        <router-link
        class="edit__button"
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
      </div>

      <v-divider class="mr-3 ml-2" vertical/>

      <div
      class="data">
          <p class="group">
            {{ group.part ?
            group.title + ' | ' + group.part + ' | ' + group.date :
            group.title + ' | ' + group.date }}
          </p>

          <p class="upload">
            <i>Uploaded {{ date }} @ {{ time }} {{ timezone }}</i>
          </p>
        </div>

        <v-icon
        v-if="downloadAvailable"
        class="download-all__button"
        size="36px"
        color="accent"
        title="Download All Files"
        :disabled="!downloadAvailable"
        @click="$emit('generate-zip-file')">
            mdi-folder-download
        </v-icon>

        <div v-else class="download-all__button off" >
          <FolderDownloadOff />
        </div>
    </div>
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
    group: [Object, null],
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