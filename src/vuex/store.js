import Vuex from 'vuex'
import Vue from 'vue'
import {CHANGE_LOGIN, TOGGLE_LOGIN} from "./mutation-types";

Vue.use(Vuex);

const state = {
  isLogin: false
};
const actions = {
  [CHANGE_LOGIN](commit, isLogin) {
    commit(CHANGE_LOGIN, isLogin);
  }
};
const getters = {
  isLogin: (state) => state.isLogin
};
const mutations = {
  [CHANGE_LOGIN](state, isLogin) {
    state.isLogin = isLogin;
  }
};


export default new Vuex.Store({
  state,
  actions,
  getters,
  mutations
});
