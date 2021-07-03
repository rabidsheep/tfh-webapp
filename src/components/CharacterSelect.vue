<template>
    <v-menu
    max-height="400px"
    transition="slide-y-transition"
    offset-y>
        <!-- char select button -->
        <template v-slot:activator="{ on, attrs }">
            <v-btn :ripple="false" class="char-select" v-bind="attrs" v-on="on" height="auto" icon>
                <v-avatar v-if="!selectedCharacter" height="100%" tile>
                    <img :src="require(`../assets/img/sel/0.png`)" />
                </v-avatar>

                <v-avatar v-if="selectedCharacter" height="100%" tile>
                    <img :src="require(`../assets/img/sel/${selectedCharacter.id}.png`)" />
                </v-avatar>
            </v-btn>
        </template>
        <!-- /char select button -->
        
        <!-- char select list -->
        <v-list width="200px">
            <v-list-item
            v-for="(character, id) in $characters"
            :key="id"
            @click="selectCharacter(character)">
                <v-avatar class="mb-2 mr-2" height="100%" tile>
                    <img :src="require(`../assets/img/sel/${character.id}.png`)">
                </v-avatar>
                {{ character.name }}
            </v-list-item>
        </v-list>
        <!-- /char select list -->
    </v-menu>
</template>

<script>
export default {
  name: 'CharacterSelect',
  props: {
    selectedCharacters: Array
  },
  data: () => ({
      selectedCharacter: null,
  
  }),
  methods: {
        selectCharacter: function (selected) {
            this.$emit('character-select', selected)
            this.selectedCharacter = selected;       
        }
  }
}
</script>

<style scoped>
.char-select:hover::before {
    opacity: 0;
}

.v-btn::before {
    background-color: transparent;
}
</style>