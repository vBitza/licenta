<template>
  <VEmojiPicker 
    :pack="pack" 
    @select="selectEmoji" 
    class="emoji-picker"
    color="#FFF"
    labelSearch="Search..."
  />
</template>

<script>
import VEmojiPicker from 'v-emoji-picker';
import packData from 'v-emoji-picker/data/emojis.json';

export default {
  name: 'Demo',
  components: {
    VEmojiPicker
  },
  data: () => ({
    pack: packData,
    message: 'test',
    color: '#898C92'
  }),
  methods: {
    selectEmoji(emoji) {
      console.log(emoji.emoji)
      this.$emit('emojiSelected', emoji.emoji);
    }
  }
}
</script>

<style>
.emoji-picker {
  background: #26292F;
  color: #26292F !important;
  background-color: #26292F !important;
  max-width: 100%;
  border: none !important;
}

#Categories {
  background: #26292F !important;
  border-bottom: 1px solid black !important;
}

.active {
  border-bottom: 3px solid #7289DA !important; 
}
</style>
