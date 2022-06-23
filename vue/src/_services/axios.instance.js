import axios from 'axios';
import {router} from '../_helpers/router';
import {userService} from './user.service';

const axiosInstance = axios.create();

axiosInstance.interceptors.response.use((response) => {
  // Any status code that lie within the range of 2xx cause this function to trigger
  // Do something with response data
  return response;
},  (error) => {
	if (error.response.status === 403) {
		userService.logout();
		router.push({name: 'LoginPage', path: ''});
	}
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  // Do something with response error
  return Promise.reject(error);
});

module.exports = axiosInstance;
