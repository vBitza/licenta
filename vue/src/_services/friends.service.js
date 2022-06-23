import config from 'config';
import axios from './axios.instance';
import {userService} from './user.service';

export const friendsService = {
	getFriendRequests,
  sendFriendRequest,
  markRequestAsRead,
  acceptFriendRequest,
  deleteFriendRequest,
  getFriendsList
};

function getFriendRequests(token) {
  const requestOptions = {
    url: `${config.apiUrl}/user/friend-requests`,
    method: 'GET',
    headers: { 
    	token: userService.user.token,
    }
  };

  return axios(requestOptions).then((response) => {
  	return response.data;
  });
};

function sendFriendRequest(email) {
  const requestOptions = {
    url: `${config.apiUrl}/user/friend`,
    method: 'POST',
    headers: { 
      token: userService.user.token,
    },
    params: {
      add: email
    }
  };

  return axios(requestOptions).then((response) => {
    return response.data;
  }).catch((error) => {
    return error.response.data;
  });
};

function markRequestAsRead(requestId) {
  const requestOptions = {
    url: `${config.apiUrl}/user/friend-request/read`,
    method: 'GET',
    headers: { 
      token: userService.user.token,
    },
    params: {
      request: requestId
    }
  };

  return axios(requestOptions).then((response) => {
    return response.data;
  }).catch((error) => {
    return error.response.data;
  });
};

function acceptFriendRequest(requestId) {
  const requestOptions = {
    url: `${config.apiUrl}/user/friend-request/accept`,
    method: 'GET',
    headers: { 
      token: userService.user.token,
    },
    params: {
      request: requestId
    }
  };

  return axios(requestOptions).then((response) => {
    return response.data;
  }).catch((error) => {
    return error.response.data;
  });
};

function deleteFriendRequest(requestId) {
  const requestOptions = {
    url: `${config.apiUrl}/user/friend-request/delete`,
    method: 'DELETE',
    headers: { 
      token: userService.user.token,
    },
    params: {
      request: requestId
    }
  };

  return axios(requestOptions).then((response) => {
    return response.data;
  }).catch((error) => {
    return error.response.data;
  });
};

function getFriendsList(token) {
  const requestOptions = {
    url: `${config.apiUrl}/user/friends`,
    method: 'GET',
    headers: { 
      token: userService.user.token,
    }
  };

  return axios(requestOptions).then((response) => {
    return response.data;
  });
};

