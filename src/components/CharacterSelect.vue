<template>
    <v-menu
    max-height="300px"
    transition="slide-y-transition"
    offset-y>
        <!-- char select button -->
        <template v-slot:activator="{ on, attrs }">
            <v-btn
            :disabled="!selectionEnabled"
            :ripple="false"
            class="icon"
            v-bind="attrs"
            v-on="on"
            height="auto"
            icon>
                <v-avatar
                height="100%"
                tile>
                    <img
                    :src="require(`../assets/img/sel/${!currentCharacter ? `Any Character` : currentCharacter}.png`)" />
                </v-avatar>
            </v-btn>
        </template>
        <!-- /char select button -->
        
        <!-- char select list -->
        <v-list
        class="character-menu"
        v-if="selectionEnabled"
        width="210px">
            <template v-for="character in $characters">
                <v-list-item
                v-if="!anyEnabled && character.id > 0"
                :key="character.id"
                @click="selectCharacter(character.value)">
                        <v-avatar
                        class="icon"
                        height="100%"
                        tile>
                            <img :src="require(`../assets/img/sel/${character.name}.png`)">
                        </v-avatar>
                        {{ character.name }}
                </v-list-item>

                <v-list-item
                v-if="anyEnabled"
                :key="character.id"
                @click="selectCharacter(character.value)">
                        <v-avatar
                        class="icon"
                        height="100%"
                        tile>
                            <img :src="require(`../assets/img/sel/${character.name}.png`)">
                        </v-avatar>
                        {{ character.name }}
                </v-list-item>
            </template>
        </v-list>
        <!-- /char select list -->
    </v-menu>
</template>

<script>
export default {
  name: 'CharacterSelect',
  props: {
    currentCharacter: [ String, null ],
    selectionEnabled: Boolean,
    index: Number,
    anyEnabled: Boolean,
  },
  methods: {
        /* passes selected character up to parent */ 
        selectCharacter: function (selected) {
            
            if (selected === this.currentCharacter) {
                return null
            } else {
                this.$emit('character-select', selected)
            }
        }
    }
}
</script>

<style scoped>
.v-btn::before {
    background-color: transparent
}
</style>