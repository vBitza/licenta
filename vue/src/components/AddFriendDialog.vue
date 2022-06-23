<template>
  <md-dialog 
    :md-active.sync="show"
    :md-close-on-esc="false"
    :md-click-outside-to-close="false"
    v-on:keyup.esc="closeDialog()"
  >
    <md-dialog-title>ADD FRIENDS</md-dialog-title>
    <md-dialog-content>
      <p v-if="response.code === null">You can add a friend using their email.</p>
      <p v-if="response.code === 500" class="error-message">{{response.messages}}</p>
      <p v-if="response.code === 200" class="succes-message">{{response.messages}}</p>
      <div class="search-friend">
        <md-field class="search-friend__field">
          <md-input 
            class="search-friend__input" 
            v-model="friend" 
            v-on:keyup.enter="sendFriendRequest()"
            placeholder="Enter an E-mail"
          />  
        </md-field>
        <button 
          type="submit" 
          :class="getButtonClass()"
          @click="sendFriendRequest()"
        >
          Send a friend request
        </button>
      </div>

      <div class="friend-requests">
        <div v-for="request in requestsList" class="friend-request"
          @mouseover="markRequestAsRead(request)"
        >
          <span>{{request.user}}</span>
          <span class="friend-request_buttons">
            <i 
              class="material-icons friend-request_accept"
              @click="acceptFriendRequest(request)"
            >
              check_circle
            </i>
            <i 
              class="material-icons friend-request_decline"
              @click="deleteFriendRequest(request)"
            >
              cancel
            </i>
          </span>
        </div>
      </div>
      
    </md-dialog-content>

    <md-dialog-actions>
      <md-button class="md-primary" @click="closeDialog()">Close</md-button>
    </md-dialog-actions>
  </md-dialog>
</template>

<script>
import { friendsService } from '../_services/friends.service';

  export default {
    name: 'DialogCustom',
    data() {
      return {
        show: this.showDialog,
        requestsList: this.requests,
        value: '',
        friend: '',
        response: {
          messages: null,
          code: null
        },
      }
    },
    props: {
      showDialog: Boolean,
      requests: Array
    },
    methods: {
      closeDialog() {
        this.$emit('close:dialog', false);
      },
      getButtonClass() {
        return this.friend.length ? 
          'search-friend_button' : 'search-friend_button-disabled';
      },
      async sendFriendRequest() {
        this.response = await friendsService.sendFriendRequest(this.friend);
      },
      markRequestAsRead(request) {
        if (!request.read) {
          friendsService.markRequestAsRead(request._id);
        }
      },
      acceptFriendRequest(request) {
        friendsService.acceptFriendRequest(request._id);
        this.requestsList = _.remove(this.request, (element) => element._id === request._id)
      },
      deleteFriendRequest(request) {
        friendsService.deleteFriendRequest(request._id);
        this.requestsList = _.remove(this.request, (element) => element._id === request._id)
      }
    }
  }
</script>

<style>
  .md-dialog {
    min-width: 500px;
    max-width: 768px;
    background-color: #2E3035;
    color: #EFF0F0;
  }

  .md-dialog-content label {
    padding: 5px;
  }

  .md-button {
    background-color: #72767D;
    color: #FFF;
    padding: 0px;
  }

  p {
    font-size: 12px;
  }

  .succes-message {
    color: #43b581;
  }

  .error-message {
    color: #f04747;
  }

  .search-friend {
    background: #303339;
    margin: 13px 0;
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
    height: 52px;
  }

  .search-friend__field {
    padding: 0px;
    margin: 0px;
    min-height: 0px;
    width: auto;
  }

  .search-friend__input {
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

  .search-friend__input::placeholder {
    color: #898C92;
  }

  .search-friend_button {
    cursor: pointer;
    border-radius: 8px;
    height: 35px;
    border: none;
    margin-left: auto;
    background-color: #7289DA;
    color: #FFF;
  }

  .search-friend_button-disabled {
    cursor: not-allowed;
    border-radius: 8px;
    height: 35px;
    border: none;
    margin-left: auto;
    background-color: #515E89;
    color: #898C92;
  }

  .friend-request {
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
    padding: 0px 10px;
  }

  .friend-request:hover {
    background-color: rgba(79,84,92,0.16);    
    color: #dcddde;
  }

  .friend-request_buttons {
    margin-left: auto;
    display: flex;
    justify-content: center;
  }

  .friend-requests i {
    margin: 0px 2px;
    color: #484e58;
    cursor: pointer;
  }

  .friend-request_accept:hover {
    color: green;
  }

  .friend-request_decline:hover {
    color: red;
  }

</style>
