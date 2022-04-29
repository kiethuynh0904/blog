import { createRouter, createWebHistory } from 'vue-router'

import Validators from '../views/Validators.vue'
import Portfolio from '../views/Portfolio.vue'
import ValidatorsDetail from '../views/ValidatorsDetail.vue'

const routerHistory = createWebHistory()
const routes = [
  { path: '/', component: Portfolio },
  { path: '/portfolio', component: Portfolio },
  { path: '/validators', component: Validators },
  { path: '/validators/:id', component: ValidatorsDetail, name:"ValidatorsDetail"}
]

const router = createRouter({
  history: routerHistory,
  routes
})

export default router
