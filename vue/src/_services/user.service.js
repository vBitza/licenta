import config from 'config';
import axios from 'axios';
export const userService = {
  login,
  logout,
  register,
  user: JSON.parse(localStorage.getItem('user'))
};

console.log(config)
function parseJwt (token) {
  return new Promise((resolve, reject) => {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    resolve(JSON.parse(jsonPayload));
  })
};

function login(email, password) {
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
    	email,
    	password
    }
  };

  return axios({
  	method: 'POST',
  	url: `${config.apiUrl}/user/login`,
  	data: requestOptions.body,
  	headers: requestOptions.headers
  }).then((response) => {
  	// Login was succsefull if there's a JWT Token in the Response
  	if (response.data.token) {
  		response.data.token = response.data.token;
      userService.user = response.data;
  		localStorage.setItem('user', JSON.stringify(response.data));
  	}

  	return response;
  }).catch((error) => {
  	return error;
  });
};

function logout() {
  // remove user from local storage to log user out
  localStorage.removeItem('user');
  localStorage.removeItem('userDetails');
};

function register(user) {
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: user
  };

  return axios({
  	method: requestOptions.method,
    url: `${config.apiUrl}/user/register`,
    data: requestOptions.body,
    headers: requestOptions.headers
  }).then((response) => {
  	console.log(response)
    return response;
  }).catch((error) => {
    // handle error
    return error.response;
  });
};
