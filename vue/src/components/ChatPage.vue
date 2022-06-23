<template>
  <div class="chat">
    <div 
      v-on:click="closePopover"
      class="card align-middle chat"
    >
      <div class="card-body chat_upper">
        <div class="card-title">
          <h3>{{friend.username}}</h3>
          <span 
            class="material-icons video-call__button"
            v-bind:class="{'video-call__button-disabled': !friend.active}"
            :disabled="!friend.active"
            @click="friend.active ? callUser() : false"
          >
            video_call
          </span>
        </div>
        <!-- <div v-else> -->
        <!-- </div> -->

        <div class="chat_window">
          <div class="messages" v-for="(message, index) in messages.slice().reverse()" :key="index">
            <div class="message__username">
              <span>
                <Avatar 
                  :username="message.username"
                  :size="30"
                />
              </span>
              <span>{{message.username}}</span>
              <span class="message__timestamp">{{message.timestamp}}</span>
            </div>
            <div  class="messages__box">
              <span v-for="(msg, index) in message.messages">
                <p 
                  v-if="msg.type === 'text'"
                  :key="index" 
                  class="message__text"
                >
                  {{msg.message}}
                </p>
                <a target="_blank" v-else @click="showOverlay(msg.message)">
                  <img class="message__image-thumbnail" :src="msg.message">
                  <br>
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    <div class="card-footer">
      <div class="chat-text">
        <md-field class="chat-text__field">
          <md-input 
            v-on:keyup.enter="sendMessage()"
            class="chat-text__input" 
            v-model="message" 
            placeholder="Send a message..."
          />  
        </md-field>
        <span class="chat-text__toolbar">
          <label 
            for="file-input"
            style="margin-bottom: 0px; cursor: pointer"
          >
            <i 
              for="file-input"
              class="material-icons chat-text__toolbar-icon"
            >
              perm_media
            </i>
          </label>
          <input 
            v-on:change="uploadImage"
            type="file" 
            accept="image/*"
            id="file-input"
            style="display: none" 
          />
          <i 
            id="popover-anchor"
            class="material-icons chat-text__toolbar-icon"
            @click="toggleEmojiBoard()"
          >
            emoji_emotions
          </i>
          <i class="material-icons chat-text__toolbar-icon">send</i>
        </span>
      </div>

    </div>
    <b-popover :show.sync="isEmojiOpen" :placement="placement" target="popover-anchor">
      <EmojiPicker @emojiSelected="emojiSelected"/>
    </b-popover>
    </div>
    <div id="overlay" @click="closeOverlay()">
      <img id="overlay-image" src="">
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client';
import {userService} from '../_services/user.service';
import {conversationService} from '../_services/conversation.service';
import moment from 'moment';
import lodash from 'lodash';
export default {
  name: 'Chat',
  beforeMount() {
  },
  components: {
  },
  props: {
    friend: Object,
    socket: Object,
    conversationId: String,
    capabilities: Object
  },
  data() {
    return {
      isCalling: false,
      placement: 'topleft',
      show: false,
      isEmojiOpen: false,
      user: '',
      message: '',
      messages: [],
      placeholder: '',
      peerConnection: null,
      showImageOverlay: false,
    }
  },
  computed: {
    usernamePlaceholder: {
      get() {
        return this.placeholder;
      },
      set(value) {
        if (value != this.placeholder) {
          this.placeholder = value;
        }
      }
    }
  },
  methods: {
    getCurrentUser(msg) {
      if (!this.usernamePlaceholder.length) {
        this.usernamePlaceholder = msg.username;
        return msg.username;
      }

      if (this.usernamePlaceholder !== msg.username) {
        this.usernamePlaceholder = msg.username;
        return msg.username;
      }

      return null;
    },
    async loadData() {
      this.messages = await conversationService.getConversationMessages(this.conversationId);
    },
    emojiSelected(emoji) {
      this.message += emoji;
    },
    sendMessage() {
      this.socket.emit('SEND_MESSAGE', {
        conversationId: this.conversationId,
        type: 'text',
        message: this.message,
        authorId: userService.user._id,
        username: userService.user.username
      });

      this.message = ''
      setTimeout(this.loadData, 300);
    },
    toggleEmojiBoard() {
      this.isEmojiOpen = !this.isEmojiOpen;
    },
    closePopover(event) {
      if (event.target.id === 'popover-anchor') {
        return;
      }
      this.isEmojiOpen = false;
    },
    messageListener(data) {
      conversationService.readConversationMessages(data.conversationId, userService.user._id).then(() => {
       this.emitRefresh();
      });
      
      this.loadData();
    },
    async callUser() {
      this.isCalling = true;
      navigator.mediaDevices.getUserMedia(this.capabilities).then((stream) => {
        stream.getTracks().forEach((track) => {
          track.stop();
        });

        this.socket.emit('CALL_FRIEND', {
          conversationId: this.conversationId,
          authorId: userService.user._id,
          username: userService.user.username,
        });

        this.openCallWindow();
      }).catch((error) => {
        console.log(error)
        window.alert('Camera permission disabled. You need to allow camera access');
      });
    },
    async openCallWindow(data) {
      sessionStorage.setItem('capabilities', JSON.stringify(this.capabilities));
      localStorage.setItem('caller', true);
      let routeData = this.$router.resolve({
        name: 'VideoChat', 
        query: {
          conversationId: this.conversationId,
          caller: true
        }
      });
      const dualScreenLeft = (window.screenLeft !==  undefined ? window.screenLeft : window.screenX) / 2 - 640;
      const height = (window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height) / 2 - 360;

      window.open(routeData.href, '', `width=1280, height=720, chrome, left=${dualScreenLeft}, top=${height}`);
    },
    uploadImage(event) {
      console.log(event.target.files[0])
      console.log('test');
      conversationService.uploadImage(event.target.files[0]).then((data) => {
        console.log(data);
        this.socket.emit('SEND_MESSAGE', {
          conversationId: this.conversationId,
          type: 'image',
          message: data.link,
          authorId: userService.user._id,
          username: userService.user.username
        });

        this.loadData();
      });
    },
    showOverlay(image) {
      console.log(image)
      document.getElementById('overlay-image').src = image;
      document.getElementById('overlay').style.display = 'flex';
    },
    closeOverlay() {
      document.getElementById('overlay').style.display = 'none';
    }
  },
  beforeDestroy() {

  },
  created() {
    this.loadData();    
    this.socket.on('MESSAGE', this.messageListener);
    // this.socket.on('ANSWER_CALL', this.openVideoWindow);
    this.socket.on('DECLINE_CALL', () => {
      this.isCalling = false;
    });
    this.emitRefresh = _.debounce(function() {
      console.log('debounced')
      this.$emit('refresh');
    }, 1000);
  },
};
</script>

<style>
.chat {
  display: flex;
  flex: auto;
  background-color: #36393f;
}

.chat_upper {
  display: flex;
  flex-direction: column;
  height: 800px;
}

.chat_window {
  flex: 1 1 auto;
  bottom: 0px;
  display: flex;
  flex-direction: column-reverse;
  overflow-y: auto;
}

.chat-input {
  display: flex;
  flex-direction: row;
}

.chat-input__button {
  margin-left: auto;
}

.card-title {
  color: #8e9297;
  display: flex;
  flex-direction: row;
  border-bottom: solid 2px #26282C;
}

.card-title span { 
  left: 0px;
}

.card-footer {
  background-color: #36393f;
  border: none;
  margin-bottom: 10px;
}

 .chat-text {
  background: #303339;
  position: relative;
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,0.3);
  background-color: #26292F;
  padding: 0 12px;
  -webkit-box-orient: horizontal;
  -webkit-box-direction: normal;
  -ms-flex-direction: row;
  flex-direction: row;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  height: 40px;
}

.chat-text__field {
  padding: 0px;
  margin: 0px;
  min-height: 0px;
  width: auto;
}

.chat-text__input {
  position: relative;
  z-index: 1;
  -webkit-box-flex: 0;
  -ms-flex: 0 0 auto;
  flex: 0 0 auto;
  display: block;
  padding: 0 16px;
  font-size: 22px;
  border-radius: 5px;
  border: none;
  background-color: #26292F;
  color: #dcddde;
}

.chat-text__input::placeholder {
  color: #898C92;
}

.chat-text__toolbar {
  user-select: none;
  cursor: pointer;
  border-radius: 8px;
  border: none;
  margin-left: auto;
  color: #8e9297;
}

.chat-text__toolbar-icon:hover {
  color: #dcddde;
}

.chat-text_button-disabled {
  cursor: not-allowed;
  border-radius: 8px;
  height: 35px;
  border: none;
  margin-left: auto;
  background-color: #515E89;
  color: #898C92;
}

.popover {
  max-width: 500px;
  margin-bottom: 15px;
}

.popover-body {
  padding: 0px;
}

.bs-popover-top .arrow::after,
.bs-popover-auto[x-placement^="top"] .arrow::after {
  border-top-color: #26292F; 
}

.message__username {
  align-items: center;
  display: inline-flex;
  color: #FFF;
  font-size: 16px;
}

.message__username span {
  margin: 0px 3px;
}

.message__timestamp {
  font-size: 12px;
  color: #72767d;
}

.vue-avatar--wrapper {
  font-size: 24px;
}

.messages {
  margin-bottom: 10px;
}

.messages__box {
  margin-left: 40px;
}

.message__text {
  color: #FFF;
  margin-bottom: 3px;
  padding-left: 5px;
}

.messages__box p:hover {
  background-color: #292b2f;
}

.message__image-thumbnail {
  padding: 5px; 
  width: 150px; 
  margin-bottom: 3px;
}

.message__image-thumbnail:hover {
  box-shadow: 0 0 2px 1px #8e9297;
}

.video-call__button {
  margin-left: auto;
  margin-right: 10px;
  cursor: pointer;
}

.video-call__button-disabled {
  cursor: not-allowed;  
  color: #1b222b;
}

.p-progressbar-indeterminate {
  max-height: 12px!important;
}

#overlay {
  align-items: center;
  justify-content: center;
  position: fixed; /* Sit on top of the page content */
  display: none; /* Hidden by default */
  width: 100%; /* Full width (cover the whole page) */
  height: 100%; /* Full height (cover the whole page) */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.75); /* Black background with opacity */
  z-index: 2; /* Specify a stack order in case you're using a different order for other elements */
}

#overlay-image {
  max-height: 80%;
  max-width: 80%;
}
</style>
