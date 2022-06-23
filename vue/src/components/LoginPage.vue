<template>
  <div class="login-page">

    <div class="login-panel">
      <h1 class="login-panel__title">Login</h1>

      <form v-on:submit.prevent="loginUser()" class="login-panel__form">
        <div class="login-panel__form__row">
          <p v-if="this.hasErrors" style="color:red">Invalid Credentials</p>
        </div>

        <div class="login-panel__form__row">
          <InputText type="text" v-model="email" class="login-panel__form__field" value="" placeholder="Email" id="login-name"/>
        </div>

        <div class="login-panel__form__row">
          <InputText type="password" v-model="password" class="login-panel__form__field" value="" placeholder="Password" id="login-password"/>
        </div>
        <Button type="submit" label="Login"/>

        <router-link class="login-panel__redirect" :to="{ name: 'RegisterPage'}">Don't have an account yet?</router-link>
      </form>
    </div>
  </div>
</template>

<script>
import {userService} from '../_services/user.service';

export default {
  name: 'LoginPage',
  beforeMount() {
  },
  data() {
    return {
      email: '',
      password: '',
      hasErrors: false,
    };
  },
  methods: {
    loginUser() {
      return userService.login(this.email, this.password).then((response) => {
        if (response.status === 200) {
          this.$router.push({name: 'IndexPage', path: ''});
        } else {
          this.hasErrors = true;
        }
      });
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

.login-page {
  justify-content: center;
  align-items: center;
  display: flex;
  background-color: #2f3136;
  min-height: 100vh;
}

.login-panel {
  margin: 0 auto;
  width: 300px;
  background-color: #FFF;
  border-radius: 5px;
  padding: 20px;
}

.login-panel__title {
  text-align: center;
  color: #777;
  margin: 5px 0;
}

.login-panel__form {
  text-align: center;
  margin-top: 20px;
}

.login-panel__form__row {
  margin-bottom: 10px;
}

.login-panel__form__field {
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

.login-panel__form__field:focus {
  border: 2px solid #3498DB;
  box-shadow: none;
}

.login-panel__submit {
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

.login-panel__submit:hover {
  background-color: #2980B9;
}

.login-panel__redirect {
  font-size: 14px;
  color: #444;
  display: block;
  margin-top: 12px;
}

</style>
