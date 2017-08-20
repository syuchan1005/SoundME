import Vue from 'vue'
import Router from 'vue-router'
import store from "./../vuex/store"
import Hello from '@/components/Hello'

Vue.use(Router);

var router = new Router({
  routes: [
    { path: '/', component: Hello }
  ]
});

router.beforeEach((to, from, next) => {
  if (to.meta.auth) {
    if (store.state.isLogin) {
      next();
    } else {
      next("/login?route=" + to.path.substring(1));
    }
  } else {
    next();
  }
});

export default router
