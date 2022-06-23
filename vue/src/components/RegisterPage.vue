<template>
  <div class="register-page">
    <div class="register-panel">
      <h1 class="register-panel__title">Register</h1>

      <form v-on:submit.prevent="registerUser()" class="register-panel__form">

        <div class="register-panel__form__row">
          <input type="email" v-model="email" class="register-panel__form__field" placeholder="E-Mail" id="register-email">
        </div>

        <div class="register-panel__form__row">
          <input type="text" v-model="username" class="register-panel__form__field" placeholder="Username" id="register-first-name">
        </div>

        <div class="register-panel__form__row">
          <input type="password" v-model="password" class="register-panel__form__field" placeholder="Password" id="register-password">
        </div>


        <button type="submit" class="register-panel__submit">register</button>

        <router-link class="register-panel__redirect" :to="{ name: 'LoginPage'}">Already have an account?</router-link>
      </form>
    </div>
  </div>
</template>

<script>

import {userService} from '../_services/user.service';

export default {
  name: 'RegisterPage',
  beforeMount() {
    let isLoggedIn = localStorage.getItem('logged-in');

    if (isLoggedIn) {
      return this.$router.push({ name: 'IndexPage' });
    }
  },
  data() {
    return {
      email: '',
      password: '',
      username: ''
    };
  },
  methods: {
    registerUser() {
      if (!this.password || !this.email || !this.username) {
        alert('Please fill in all fields.');
        return;
      }

      let newUser = {
        password: this.password,
        email: this.email,
        username: this.username,
      };

      userService.register(newUser).then((response) => {
        if (response.status !== 200) {
          alert(response.data.messages);
        } else {
          alert('The user was saved. You will be redirected to login page.');
          this.$router.push({ name: 'LoginPage' });
        }
      });
    },
  },
};

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

.register-page {
  justify-content: center;
  align-items: center;
  display: flex;
  background-color: #2f3136;
  min-height: 100vh;
}

.register-panel {
  margin: 0 auto;
  width: 350px;
  background-color: #FFF;
  border-radius: 5px;
  padding: 20px;
}

.register-panel hr {
  border: none;
  border-top: 1px solid #ddd;
}

.register-panel__title {
  text-align: center;
  color: #777;
  margin: 5px 0;
}

.register-panel__form {
  text-align: center;
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.register-panel__form__row {
  margin-bottom: 10px;
}

.register-panel__form__field {
  text-align: center;
  background-color: #ECF0F1;
  border: 2px solid transparent;
  border-radius: 3px;
  font-size: 16px;
  font-weight: 200;
  padding: 10px 0;
  width: 250px;
  transition: border .5s;
}

.register-panel__form__field:focus {
  border: 2px solid #3498DB;
  box-shadow: none;
}

.register-panel__submit {
  border: 2px solid transparent;
  background: #3498DB;
  color: #ffffff;
  font-size: 16px;
  line-height: 25px;
  padding: 10px 0;
  text-decoration: none;
  text-shadow: none;
  border-radius: 3px;
  box-shadow: none;
  transition: 0.25s;
  display: block;
  width: 250px;
  margin: 0 auto;
  text-transform: uppercase;
}

.register-panel__submit:hover {
  background-color: #2980B9;
}

.register-panel__redirect {
  font-size: 14px;
  color: #444;
  display: block;
  margin-top: 12px;
}

.md-field {
  margin: 0px 0 4px;
  /*padding-top: 4px;*/
}

</style>
