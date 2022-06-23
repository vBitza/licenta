<template>
	<div class="vld-parent">
		<Loading 
			:active="isLoading"
	    :can-cancel="true" 
	    :is-full-page="true"
	  />
	 
		<div class="main-container" v-if="isLoading === false">
			<div class="friends">
		    <md-field class="friends-search">
		      <label>Name</label>
		      <md-input class="friends-search__input" v-model="search"></md-input>
		      <span class="md-helper-text">Search a friend</span>
		    </md-field>
				
				<div class="friends-list">
					<div 
						:key="index"
						v-for="(friend, index) in friendsList" 
						:id="friend.username" 
						class="friend-item"
			      v-bind:class="{'friend-item__selected': selectedFriend ? 
				      selectedFriend.username === friend.username : false}"
						@click="changeFriend(friend)"
					>
			      <md-badge 
				      class="md-primary" 
				      md-position="bottom" 
				      :md-content="friend.unreadCount > 0 ? friend.unreadCount: ''"
				    >
			        <md-avatar>
			          <Avatar :username="friend.username"></Avatar>
			        </md-avatar>

			      </md-badge>

						<p class="friend-item__username">{{friend.username}}</p>
		        <svg height="10" width="10" class="friend-item__status">
						  <circle 
							  cx="5" 
							  cy="5" 
							  r="5" 
							  stroke="black" 
							  stroke-width="1" 
							  :fill="friend.active ? 'green' : 'rgb(116, 127, 141)'" 
							/>
						</svg>
					</div>
				</div>

				<div 
					class="user"
				>
	        <md-avatar>
	          <Avatar :username="user.username"></Avatar>	        	
	        </md-avatar>

		      <p class="friend-item__username">{{user.username}}</p>
		      <span 
			      class="user-toolbar" 
			    >
			    	<div>
			      	<i 
				      	class="material-icons" 
				      	@click="addFriend = true" 
				      	v-bind:class="{active: newRequests}"
			      	>
				      	person_add
				      </i>
				      <md-tooltip md-direction="top">Add Friend</md-tooltip>
				    </div>
				    <div>
			      	<i 
				      	class="material-icons"
				      	@click="logout()"
				      >
						    exit_to_app
						  </i>
				      <md-tooltip md-direction="top">Logout</md-tooltip>
				    </div>

					</span>

				</div>
			</div>

			<div v-if="friend === null"></div>
			<component
				is="ChatPage"
				v-if="friend !== null"
				:key="friend.username"
				:friend="friend"
				:socket="socket"
				:conversationId="friend.conversationId"
				:capabilities="capabilities"
				v-on:refresh="loadData()"
			/>
			<AddFriendDialog 
				v-if="addFriend === true" 
				:showDialog="addFriend"
				:requests="friendRequests.list" 
				v-on:close:dialog="onCloseDialog()"
			></AddFriendDialog>
			<AnswerCallDialog 
				v-if="incomingCall === true" 
				:showDialog="incomingCall"
				:callingUser = "callingUser"
				:data = "data"
				@decline:dialog="declineCall"
				@accept:dialog="acceptCall"
			></AnswerCallDialog>
		</div>		
	</div>
</template>

<script>
import io from 'socket.io-client';
import config from 'config';
import { userService } from '../_services/user.service';
import { friendsService } from '../_services/friends.service';

export default {
	name: 'FriendsList',
	beforeMount() {
		return;
	},
	async created() {
		this.getCapabilities();
		this.loadData();
    this.socket.on('CALL_INCOMING', this.callListener);
    this.queueRefresh(10000);
	},
	computed: {
		newRequests() {
			return this.friendRequests.unread;
		},
		user() {
			return userService.user;
		},
		friend() {
			return this.selectedFriend;
		},
		friendsList() {
			console.log(this.friendsListData)
			return this.friendsListData.filter((user) => {
				return user.username.toLowerCase().includes(this.search.toLowerCase());
			});
		}
	},
  mounted() {
    this.socket.on('MESSAGE', (data) => {
    	console.log(data)
    	this.loadData();
    });
  },
	data() {
		console.log(config.socketUrl)
		return {
			capabilities: {
				audio: false,
				video: false
			},
			data: null,
			incomingCall: false,
			callingUser: null,
			selectedFriend: null,
			isLoading: true,
			friendRequests: {
				list: []
			},
			friendsListData: [],
			addFriend: false,
			search: '',
			socket: io(config.socketUrl, {
				query: {
					token: userService.user.token
				}
			})
		}
	},
	methods: {
		async loadData() {
			this.friendsListData = await friendsService.getFriendsList();
			this.friendRequests = await friendsService.getFriendRequests();
			this.isLoading = false;
		},
		onCloseDialog() {
			this.addFriend = false;
			this.loadData();
		},
		changeFriend(friend) {
			this.selectedFriend = friend;
			return friend.unreadCount = 0;
		},
    async callListener(data) {
    	this.data = data;
			this.callingUser = data.username;
			this.incomingCall = true;  
    },
    acceptCall(data) {
    	this.incomingCall = false;
			this.openCallWindow(data.conversationId);
      this.socket.emit('ANSWER_CALL', {
      	conversationId: data.conversationId,
      	authorId: userService.user._id,
      });
    },
    declineCall(data) {
    	this.incomingCall = false;
    	this.loadData();

    	this.socket.emit('DECLINE_CALL', {
    		conversationId: data.conversationId,
    	});
    },
    openCallWindow(conversationId) {
      let routeData = this.$router.resolve({
        name: 'VideoChat', 
        query: {conversationId, answer: true}
      });
      const dualScreenLeft = (window.screenLeft !==  undefined ? window.screenLeft : window.screenX) / 2 - 640;
      const height = (window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height) / 2 - 360;

      window.open(routeData.href, '', `width=1280, height=720, chrome, left=${dualScreenLeft}, top=${height}`);
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
    },
    queueRefresh(timer) {
    	setTimeout(() => {
    		this.loadData();
    		this.queueRefresh(timer);
    	}, timer);
    },
    logout() {
    	localStorage.clear();
    	location.reload();
    }
	},
	beforeDestroy() {
    this.socket.removeListener('CALL_INCOMING', this.callListener);
	}		
}
</script>

<style>
.friends {
	color: #8e9297;
	width: 200px;
	height: 100vh;
	background: #2f3136;
	display: flex;
	overflow: hidden;
	flex-direction: column;
}

.friends-list {
	border-top: solid 2px #26282C;
	border-bottom: solid 2px #26282C;
	margin-top: 5px;
	box-sizing: border-box;
	height: 90vh;
	display: flex;
	overflow-y: auto;
	overflow-x: hidden;
	flex-direction: column;
}

.friends-search {
	margin: 0 8px;
	margin-bottom: 20px;
	font-size: 14px;
}

.friends-search label {
	padding-left: 5px;
}

.friends-search__input {
	padding: 0px 5px 0px 5px !important;
	max-width: 180px;		
	color: #8e9297;
	background-color: #202225 !important;
}

.md-avatar { 
	margin: 5px;
}

.friend-item {
	display: flex;
	flex-direction: row;
	font-size: 16px;
	margin: 5px 5px;
	align-items: center;
	color: #8e9297;
}

.friend-item__username {
	margin: 0px 10px;
}

.friend-item__status {
	margin-left: auto;
	margin-right: 10px;
}

.friend-item__selected {
	background-color: rgba(79,84,92,0.32);		
	color: #dcddde;
}

.friend-item:hover {
	cursor: pointer;
	background-color: rgba(79,84,92,0.32);		
	color: #dcddde;
}

.user {
	margin: 0px 10px;
	align-items: center;
	display: flex;
	flex-direction: row;
}

.user-toolbar {
	margin-left: auto;
	display: inline-flex;
}

.user-toolbar i {
	margin: 0px 3px;
}

.user-toolbar i:hover {
	cursor: pointer;
	background-color: rgba(79,84,92,0.16);		
	color: #dcddde;
}

.main-container {
	height: 100vh;
	display: flex;
	flex-direction: row;
}

.active { 
	color: #F04747;
	font-size: 34px;
}

.active:hover {
	color: #F04747 !important;
}

.md-tooltip {
	background: white;
}

</style>
