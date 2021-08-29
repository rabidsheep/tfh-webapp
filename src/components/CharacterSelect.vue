<template>
    <v-menu
    max-height="300px"
    transition="slide-y-transition"
    offset-y>
        <!-- char select button -->
        <template v-slot:activator="{ on, attrs }">
            <picture
            class="icon"
            v-bind="attrs"
            v-on="on"
            :title="currentCharacter">
                <source
                type="image/webp"
                :srcset="require(`../assets/img/sel/${currentCharacter}.webp`)" />
                <source
                type="image/png"
                :srcset="require(`../assets/img/sel/${currentCharacter}.png`)" />
                <img
                :alt="currentCharacter"
                :src="require(`../assets/img/sel/${currentCharacter}.webp`)"
                    />
            </picture>
        </template>
        <!-- /char select button -->
        
        <!-- char select list -->
        <v-list
        v-if="selectionEnabled"
        class="character-menu"
        width="210px">
            <template v-for="(character, i, j) in $characters">
                <v-list-item
                v-if="!anyEnabled && character.value"
                :key="i"
                @click="selectCharacter(character)">
                    <picture class="icon" :title="character.name" >
                        <source
                        type="image/webp"
                        :srcset="require(`../assets/img/sel/${character.img}.webp`)" />
                        <source
                        type="image/png"
                        :srcset="require(`../assets/img/sel/${character.img}.png`)" />
                        <img
                        :src="require(`../assets/img/sel/${character.img}.png`)" />
                    </picture>
                    {{ character.name }}
                </v-list-item>

                <v-list-item
                v-else-if="anyEnabled"
                :key="j"
                @click="selectCharacter(character)">
                    <picture class="icon" :title="character.name" >
                        <source
                        type="image/webp"
                        :srcset="require(`../assets/img/sel/${character.img}.webp`)" />
                        <source
                        type="image/png"
                        :srcset="require(`../assets/img/sel/${character.img}.png`)" />
                        <img
                        :src="require(`../assets/img/sel/${character.img}.png`)" />
                    </picture>
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
    anyEnabled: Boolean,
  },
  methods: {
        /* passes selected character up to parent */ 
        selectCharacter: function (selected) {
            
            if (selected.img === this.currentCharacter) {
                return null
            } else {
                this.$emit('character-select', selected.value)
            }
        },
    }
}
</script>

<style scoped>
.v-btn::before {
    background-color: transparent
}
</style>