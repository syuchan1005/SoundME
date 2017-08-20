<template>
  <div class="main">
    <div id="wallpaper"></div>
    <h1 class="title">SoundME</h1>
    <md-whiteframe md-elevation="10" class="frame">
      <form id="loginForm">
        <md-input-container>
          <label>Username</label>
          <md-input v-model="username"></md-input>
        </md-input-container>
        <md-input-container md-has-password>
          <label>Password</label>
          <md-input type="password" v-model="password"></md-input>
        </md-input-container>
        <md-button class="md-raised loginButton" @click="clickLogin">Login</md-button>
      </form>
    </md-whiteframe>
  </div>
</template>

<script>
import Particle from 'jparticles'
import { mapGetters } from 'vuex'
import store from './../vuex/store'
import {CHANGE_LOGIN} from './../vuex/mutation-types'

export default {
  name: 'hello',
  data: () => {
    return {
      username: "",
      password: ""
    }
  },
  methods: {
    clickLogin: function () {
        this.$http({
          method: 'get',
          url: '/login',
          data: {
            username: this.username,
            password: this.password
          }
        }).then((response) => {
        });
    }
  },
  mounted: () => {
    new Particle.particle('#wallpaper', {
      range: 3000,
      num: 30,
      lineWidth: 1,
      proximity: 90,
      maxR: 15,
      minR: 10,
      maxSpeed: 2
    });
  }
}
</script>

<style lang="scss">
.main {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;

  #wallpaper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: -9999;
  }

  .title {
    font-size: 3rem;
    margin-bottom: 3rem;
  }

  .frame {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    max-width: 500px;
    width: 50vw;
    min-width: 290px;
    max-height: 300px;
    height: 30vh;
    min-height: 215px;
    background-color: rgba(255, 255, 255, 0.7);
  }

  #loginForm {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 90%;
  }
}
</style>
