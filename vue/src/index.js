import Vue from 'vue';
import VeeValidate from 'vee-validate';
import BootstrapVue from 'bootstrap-vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import VueMaterial from 'vue-material';
import 'vue-material/dist/vue-material.min.css'
import FriendsList from './components/FriendsList';
import AddFriendDialog from './components/AddFriendDialog';
import AnswerCallDialog from './components/AnswerCallDialog';
import ChatPage from './components/ChatPage';
import Video from './components/VideoChat.vue';
import EmojiPicker from './components/EmojiPicker';
import babelPolyfill from 'babel-polyfill'
import Avatar from 'vue-avatar';
import _ from 'lodash';
import Loading from 'vue-loading-overlay';
import ProgressBar from 'primevue/progressbar';
 
// import { store } from './_store';
import { router } from './_helpers/router';
import App from './app/App';

Vue.use(VueMaterial)
Vue.use(BootstrapVue)
Vue.use(VeeValidate);
Vue.use(ToastService);

Vue.component('InputText', InputText);
Vue.component('Button', Button);
Vue.component('Toast', Toast);
Vue.component('FriendsList', FriendsList);
Vue.component('Avatar', Avatar);
Vue.component('AddFriendDialog', AddFriendDialog);
Vue.component('Loading', Loading);
Vue.component('ChatPage', ChatPage);
Vue.component('EmojiPicker', EmojiPicker);
Vue.component('Video', Video);
Vue.component('AnswerCallDialog', AnswerCallDialog);
Vue.component('ProgressBar', ProgressBar);

import 'vue-loading-overlay/dist/vue-loading.css';
import 'primevue/resources/themes/nova-light/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';

// setup fake backend
// import { configureFakeBackend } from './_helpers';
// configureFakeBackend();

new Vue({
  el: '#app',
  router,
  render: h => h(App)
});
