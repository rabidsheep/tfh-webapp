import Vue from 'vue'

export default Vue.mixin({
  methods: {
    printObj: obj => console.log(JSON.parse(JSON.stringify(obj))),
    formatDate: date => {
      if (!date) return null

      const [year, month, day] = date.split('-')
      return `${month}-${day}-${year}`
    },
  }
})