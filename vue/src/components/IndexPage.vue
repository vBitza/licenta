<template>
  <div class="index-page">
    <FriendsList></FriendsList>
  </div>
</template>

<script>
import { userService } from '../_services/user.service';

export default {
  name: 'IndexPage',
  beforeMount() {
    if (!userService.user) {
      return this.$router.push({name: 'LoginPage'});
    }
  },
  data() {
    return {
    };
  },
  computed: {
    user() {
      return userService.user;
    }
  },
  methods: {
    logout() {
      userService.logout(this);
      return this.$router.push({ name: 'LoginPage' });
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

.index-page {
  background-color: #36393f;
  min-height: 100vh;
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #2f3136;
}

::-webkit-scrollbar-thumb {
  background: #26282C;
}
</style>
