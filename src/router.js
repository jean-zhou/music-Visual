import Vue from 'vue'
import VueRouter from 'vue-router'
import EchartMusic from './components/echartMusic.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/home', component: EchartMusic }
]

const router = new VueRouter({
  routes
})

export default router
