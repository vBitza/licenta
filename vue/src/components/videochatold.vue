<template>
<!--     <div v-if="callAnswered === false">
    </div> -->
      <!-- <img src="https://www.shareicon.net/data/512x512/2015/10/30/664066_users_512x512.png"/> -->
    <div class="video-container" >
      <div>
      </div>
      <!-- Remote video -->
      <div class="video_partner content">
        <!-- Loading component whilst we wait for the remote video track -->
        <!-- <Loading v-if="remoteStream !== null" class="video__spinner"></Loading> -->
        <video id="remoteVideo" class="video__spinner" autoplay></video>
      </div>
      <!-- Local video -->
      <div class="video__partner overlay">
        <video id="localVideo" class="video__myself" autoplay muted></video>
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
    }
  },// Media & Offer config, STUN ICE servers, RTC objec, streams & video
  async created() {
    // Add SignalingMessage Handlet
    this.socket.on('privateMessagePCSignaling', this.handleMessage);
    this.socket.on('ANSWER_CALL', async() => {
      console.log('calll answered?')
      this.callAnswered = true;
      await this.createPeerConnection();
      // this.createOffer();
    });
       
    // Create RTCPeerConnection object
    // await this.createPeerConnection(); 
    
    // Add Local Stream to Peer Connection
    
    // Handle offer based on user type
    this.isCaller ? true : this.acceptOffer(); 
  },
  methods: {
    // CALLEE
    async acceptOffer() {
      // The callee must wait untill he succsefully receives the offer
      // from the caller
      setTimeout(async() => {
        if (this.offer) {
          let remoteDesc = new RTCSessionDescription(this.offer);
          await this.peerConnection.setRemoteDescription(remoteDesc);
          let answer = await this.peerConnection.createAnswer();
          await this.peerConnection.setLocalDescription(answer);
          this.sendSignalingMessage({
            localDescription: this.peerConnection.localDescription,
            capabilities: this.capabilities}
          , false);
        } else {
          this.acceptOffer();
        }
      }, 1000)
    },
    async createPeerConnection() {      
      if (this.callAnswered) {
        this.peerConnection = new RTCPeerConnection(config.iceServerConfiguration);
        // OnIceCandidate event handler
        this.peerConnection.onicecandidate = ({ candidate }) => {
          console.log(candidate);
          this.socket.emit('privateMessagePCSignaling', { 
            conversationId: this.$route.query.conversationId,
            candidate, 
          });
        };

        // OnTrack added event handler
        this.peerConnection.ontrack = (event) => {
          let remoteVideo = document.getElementById('remoteVideo'); 
          remoteVideo.srcObject = event.streams[0];
        }

        this.createOffer();
      } else {
        console.log('tttt')
        setTimeout(this.createPeerConnection, 500);
      }

    },
    async createOffer() {
      try {
        // Create offer 
        if (!this.peerConnection.offer) {
          this.localOffer = await this.peerConnection.createOffer(); 
          await this.addLocalStream(); // Add local video stream
        }

        // Add local description
        await this.peerConnection.setLocalDescription(this.localOffer) 

        // Send signaling message
        console.log(this.peerConnection)
        this.sendSignalingMessage(this.peerConnection.localDescription, true) 

        // if (!this.peerConnection.remoteDescription) {
        //   console.log(this.callAnswered)
        //   console.log('test')
        //   setTimeout(this.createOffer, 1000);
        // }
      } catch (error) {
        console.log(`Error creating the offer from ${this.username}. Error: ${error}`);
      }
    },
    sendSignalingMessage(description, offer) { // Send the offer to the other peer
      this.socket.emit("privateMessagePCSignaling", { 
        description,
        conversationId: this.$route.query.conversationId,
      });
    },
    async addLocalStream() {
      if (_.isNil(this.capabilities)) {
        this.capabilities = {};
        await this.getCapabilities();
      }
        
      this.localStream = await navigator.mediaDevices.getUserMedia(this.capabilities);
      
      document.getElementById('localVideo').srcObject = this.localStream;


      for (const track of this.localStream.getTracks()) {
        console.log(track);
        this.peerConnection.addTrack(track, this.localStream);
      }
    },
    addCandidate(candidate) {
      this.callAnswered = true;
      this.addLocalStream();
      this.peerConnection.addIceCandidate(candidate);
    },
    async handleMessage(data) {
      if (data.description) {
        this.offer = data.description;
        this.remoteUserCapabilities= data.capabilities;
      }

      if (data.description && data.description.type === 'answer' && this.isCaller) {
        let remoteDescription = new RTCSessionDescription(data.description);
        this.peerConnection.setRemoteDescription(remoteDescription);
      }

      if (this.peerConnection && this.peerConnection.remoteDescription) {
        this.callAnswered = true;
        if (data.candidate) {
          console.log('add-candidate')
          console.log(data.candidate)
          this.addCandidate(data.candidate);
        }
      }
    },
    getCapabilities() {
      return navigator.mediaDevices.enumerateDevices().then((devices) => {
        console.log(devices)
        for (let deviceIndex in devices) {
          if (devices[deviceIndex].kind == 'videoinput') {
            this.capabilities.video = true;
          } 

          if (devices[deviceIndex].kind == 'audioinput') {
            this.capabilities.audio = true;
          }
        }
      });
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
  flex-direction: row;
}

.content {
}

.overlay {
  width: 200px;
  height: 150px;
  margin-left: 20px;
  margin-top: auto;
}

#localVideo {
 
}
</style>