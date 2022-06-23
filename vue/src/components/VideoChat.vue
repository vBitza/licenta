<template>
  <div>
    <div v-if="callAnswered === false" class="video-chat__placeholder">
      <p id="statusText" class="statusText">Waiting for the other user to join call...</p>
      <!-- <img src="https://www.shareicon.net/data/512x512/2015/10/30/664066_users_512x512.png"/> -->
    </div>
    <div v-else>
      <p id="call_end" style="display: none" class="statusText">The call has ended.</p>
      <!-- <img src="https://www.shareicon.net/data/512x512/2015/10/30/664066_users_512x512.png"/> -->

      <div class="video-container" id="video-container">
        <!-- Remote video -->
        <div class="video-elements__row">
          <div class="video_partner">
            <!-- Loading component whilst we wait for the remote video track -->
            <!-- <Loading v-if="remoteStream !== null" class="video__spinner"></Loading> -->
            <img 
              class="video_partner-image"
              id="remoteUserImage"
              v-show="!this.remoteVideoStream"
              src="https://i.imgur.com/vhV3w9I.jpg"
            />
            <video 
              id="remoteVideo" 
              class="video-player" 
              autoplay
            />
          </div>
          <!-- Local video -->
          <div class="local__video overlay">
            <video id="localVideo" class="video__myself" autoplay muted></video>
          </div>
        </div>
        <div class="video-chat__toolbar">
          <md-button 
            @click="changeVideoStreamStatus()"
            class="md-icon-button md-raised">
            <md-icon
              id="video-button"
              style="color: white"
            >
              videocam_off
            </md-icon>
          </md-button>
          <md-button 
            @click="changeAudioStreamStatus()"
            class="md-icon-button md-raised"
            :key="localAudioStreamMuted"
          >
            <md-icon
              v-if="localAudioStreamMuted"
              id="video-button"
              style="color: white"
            >
              mic
            </md-icon>
            <md-icon
              v-else
              id="video-button"
              style="color: white"
            >
              mic_off
            </md-icon>
          </md-button>
          <md-button 
            class="md-icon-button md-raised md-primary"
            @click="endCall()">
            <md-icon
              style="color: red"
            >
              call_end
            </md-icon>
          </md-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client';
import { userService } from '../_services/user.service';
import config from 'config';

export default {
  props: {},// room (String), to(String), videoAnswer(Object)
  data() {
    return {
      isCaller: this.$route.query.caller ? true : false,
      socket: io(config.socketUrl, {
        query: {
          conversationId: this.$route.query.conversationId
        }
      }),
      offer: null,
      localOffer: null,
      peerConnection: null,
      remoteStream: null,
      callAnswered: this.$route.query.answer ? this.$route.query.answer : false,
      capabilities: JSON.parse(sessionStorage.getItem('capabilities')),
      remoteUserCapabilities: null,
      remoteVideoStream: false,
      localVideoStream: true,
      localAudioStreamMuted: false,
      remoteAudioStream: false,
    }
  },// Media & Offer config, STUN ICE servers, RTC objec, streams & video
  async created() {
    await this.createPeerConnection();
    this.addLocalStream();
    
    this.socket.on('privateMessagePCSignaling', this.handleMessage);
    this.socket.on('ANSWER_CALL', async() => {
      this.callAnswered = true;
      this.createOffer();
      setTimeout(() => {
        document.getElementById('localVideo').srcObject = this.localStream;
      }, 1000)
    });

    this.socket.on('DECLINE_CALL', async() => {
      document.getElementById('statusText').innerHTML = 'User declined the call.';
    });

    this.socket.on('REMOTE_VIDEO_STOP', async() => {
      console.log('stop video')
      document.getElementById('remoteUserImage').style['display'] = 'initial';
      document.getElementById('remoteVideo').style['z-index'] = 0;
    });

    this.socket.on('REMOTE_VIDEO_START', async() => {
      console.log('start video')
      document.getElementById('remoteUserImage').style['display'] = 'none';
      document.getElementById('remoteVideo').style['z-index'] = 2;
    });

    this.socket.on('REMOTE_AUDIO_STATUS_CHANGE', async() => {
      this.remoteAudioStream = !this.remoteAudioStream;
      console.log(this.remoteAudioStream);
      document.getElementById('remoteVideo').muted = this.remoteAudioStream;
    });

    this.socket.on('REMOTE_VIDEO_ENDED', async() => {
      document.getElementById('video-container').style.display = 'none';
      document.getElementById('call_end').style.display = 'initial';
    });

    if (!this.isCaller) {
      this.acceptOffer();
    }

    this.setLocalVideoSource();
  },
  methods: {
    async acceptOffer() {
      // The callee must wait untill he succesfully receives the offer
      // from the caller
      setTimeout(async() => {
        if (this.offer) {
          let remoteDesc = new RTCSessionDescription(this.offer);
          await this.peerConnection.setRemoteDescription(remoteDesc);
          let answer = await this.peerConnection.createAnswer();
          await this.peerConnection.setLocalDescription(answer);

          this.sendSignalingMessage(this.peerConnection.localDescription, this.capabilities);
        } else {
          this.acceptOffer();
        }
      }, 1000)
    },
    async createPeerConnection() {      
      this.peerConnection = new RTCPeerConnection(config.iceServerConfiguration);
      
      // OnIceCandidate event handler
      this.peerConnection.onicecandidate = ({ candidate }) => {
        this.socket.emit('privateMessagePCSignaling', { 
          conversationId: this.$route.query.conversationId,
          candidate, 
        });
      };

      // OnTrack added event handler
      this.peerConnection.ontrack = async (event) => {
        let remoteVideo = document.getElementById('remoteVideo'); 

        let tracks = await event.streams[0].getTracks();

        for (let index in tracks) {
          if (tracks[index].kind.video) {
            this.remoteVideoStream = true;
          }
        }
        
        document.getElementById('remoteUserImage').style['display'] = 'none';
        remoteVideo.srcObject = event.streams[0];
        setTimeout(() => {
          remoteVideo.style['z-index'] = 2;
        }, 1000);
      }
    },   
    async createOffer() {
      try {
        // Create local offer if it doesn't exist
        if (!this.localOffer) {
          this.localOffer = await this.peerConnection.createOffer(); 
          await this.peerConnection.setLocalDescription(this.localOffer) 
        }

        // Send signaling message
        this.sendSignalingMessage(this.peerConnection.localDescription, this.capabilities) 

        // Queue another signaling message untill we receive a remote description
        if (!this.peerConnection.remoteDescription) {
          setTimeout(this.createOffer, 1000);
        } 
      } catch (error) {
        console.log(error);
      }
    },
    sendSignalingMessage(description, capabilities) { 
      // Send the offer to the other peer
      this.socket.emit("privateMessagePCSignaling", { 
        description,
        capabilities,
        conversationId: this.$route.query.conversationId,
      });
    }, 
    async handleMessage(data) {
      if (data.description && data.description.type === 'offer') {
        this.offer = data.description;
        this.remoteUserCapabilities= data.capabilities;
      }

      if (data.description && data.description.type === 'answer' && this.isCaller) {
        this.callAnswered = true;
        let remoteDescription = new RTCSessionDescription(data.description);
        this.peerConnection.setRemoteDescription(remoteDescription);
      }

      if (this.peerConnection && this.peerConnection.remoteDescription) {
        if (data.candidate) {
          this.peerConnection.addIceCandidate(data.candidate);
        }
      }
    },
    async addLocalStream() {
      if (_.isNil(this.capabilities)) {
        this.capabilities = {};
        await this.getCapabilities();
      }
        
      this.localStream = await navigator.mediaDevices.getUserMedia(this.capabilities);

      for (const track of this.localStream.getTracks()) {
        this.peerConnection.addTrack(track, this.localStream);
      }
    },
    setLocalVideoSource() {
      let localVideoStream = document.getElementById('localVideo');

      if (localVideoStream && this.localStream) {
        localVideoStream.srcObject = this.localStream;
      } else {
        setTimeout(this.setLocalVideoSource, 500);
      }
    },
    getCapabilities() {
      return navigator.mediaDevices.enumerateDevices().then((devices) => {
        for (let deviceIndex in devices) {
          if (devices[deviceIndex].kind == 'videoinput') {
            this.capabilities.video = true;
          } 

          if (devices[deviceIndex].kind == 'audioinput') {
            this.capabilities.audio = true;
          }
        }
      });
    },
    changeVideoStreamStatus() {
      console.log(this.localVideoStream);
      if (this.localVideoStream) {
        document.getElementById('video-button').innerHTML = 'videocam';

        this.socket.emit('REMOTE_VIDEO_STOP', { 
          conversationId: this.$route.query.conversationId, 
        });

      } else {
        document.getElementById('video-button').innerHTML = 'videocam_off';

        this.socket.emit('REMOTE_VIDEO_START', { 
          conversationId: this.$route.query.conversationId, 
        });
      }

      this.localVideoStream = !this.localVideoStream;
    },
    changeAudioStreamStatus() {
      this.localAudioStreamMuted = !this.localAudioStreamMuted;

      this.socket.emit('REMOTE_AUDIO_STATUS_CHANGE', { 
        conversationId: this.$route.query.conversationId, 
      });
    },
    endCall() {
      this.socket.emit('REMOTE_VIDEO_ENDED', { 
        conversationId: this.$route.query.conversationId, 
      });

      document.getElementById('video-container').style.display = 'none';
      document.getElementById('call_end').style.display = 'initial';
    }
  }
};
</script>

<style>
#app {
  background-color: #36393f;
  color: #36393f;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-container {
  display: flex;
  flex-direction: column;
}

.video-elements__row {
  display: flex;
  flex-direction: row;
}

.video_partner {
  justify-items: center;
  width: 640px;
  height: 480px;
  display: grid;
}

.video_partner-image {
  grid-column: 1;
  grid-row: 1;
  border: solid 1px #26282C;
  top: 0px;
  left: 0px;
  z-index: 1;
}

.overlay {
  width: 200px;
  height: 150px;
  margin-left: 20px;
  margin-top: auto;
}

.video-chat__placeholder {
  display: flex;
  align-items: center;
}

.statusText {
  color: #8e9297;
  font-size: 24px;
}

#localVideo {
}

#remoteVideo {
  grid-column: 1;
  grid-row: 1;
  z-index: 0;
}
.video-player {
  max-width: 640px;
  max-height: 480px;
}

.video-chat__toolbar {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
}

.md-button {
  background-color: #26282C;
}
</style>