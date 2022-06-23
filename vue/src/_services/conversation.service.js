import config from 'config';
import axios from './axios.instance';
import {userService} from './user.service';

export const conversationService = {
	getConversationMessages,
	readConversationMessages,
	uploadImage
};

function getConversationMessages(conversationId) {
  const requestOptions = {
    url: `${config.apiUrl}/conversation`,
    method: 'GET',
    headers: { 
    	token: userService.user.token,
    },
    params: {
    	conversationId
    }
  };

  return axios(requestOptions).then((response) => {
  	console.log(response)

  	return response.data;
  });
};

function incarcaTelefonDinBazaDeDate(telefonId) {
	const requestOptions = {
		url: 'http://serverul-de-unde-ceri-datele/api/getTelefon',
		params: {
			telefonId
		}
	};

	return axios(requestOptions).then((response) => {
		return response.data;
	})
}

function readConversationMessages(conversationId, userId) {
	const requestOptions = {
		url: `${config.apiUrl}/readConversation`,
		method: 'GET',
		headers: {
			token: userService.user.token
		},
		params: {
			conversationId,
			userId
		}
	};

	return axios(requestOptions);
};

function uploadImage(file) {
	const formData = new FormData();
	formData.set('image', file);
	console.log(file);
	const requestOptions = {
		url: 'https://api.imgur.com/3/image',
		method: 'POST',
		data: formData,
		headers: {
			'Content-Type': file.type,
			Authorization: 'Client-ID b4966284da932a6'
		}
	}

	return axios(requestOptions).then((response) => {
		return response.data.data;
	});
};



