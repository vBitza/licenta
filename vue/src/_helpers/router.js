import Vue from 'vue';
import Router from 'vue-router';
// @ - de la folderul src in jos
import LoginPage from '../components/LoginPage';
import RegisterPage from '../components/RegisterPage';
import IndexPage from '../components/IndexPage';
import Video from '../components/VideoChat';

Vue.use(Router);
export const router = new Router({
  // mode: 'history',
  routes: [
    {
      path: '/login',
      name: 'LoginPage',
      component: LoginPage,
    }, {
      path: '/register',
      name: 'RegisterPage',
      component: RegisterPage,
    }, {
      path: '/',
      name: 'IndexPage',
      component: IndexPage,
      children: []
    }, {
    	path: '/chat',
    	name: 'VideoChat',
    	component: Video
    }
  ],
});

router.beforeEach((to, from, next) => {
  // redirect to login page if not logged in and trying to access a restricted page
  const publicPages = ['/login', '/register', '/chat'];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = localStorage.getItem('user');

  if (authRequired && !loggedIn) {
    return next('/login');
  }

  next();
})
