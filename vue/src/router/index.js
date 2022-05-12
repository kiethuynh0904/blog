import { createRouter, createWebHistory } from 'vue-router'

import Validators from '../views/Validators.vue'
import Blocks from '../views/Blocks.vue'
import Wallet from '../views/Wallet.vue'
import ValidatorsDetail from '../views/ValidatorsDetail.vue'

const routerHistory = createWebHistory()
const routes = [
  { path: '/', component: Wallet },
  { path: '/wallet', component: Wallet },
  { path: '/validators', component: Validators },
  { path: '/validators/:id', component: ValidatorsDetail, name:"ValidatorsDetail"},
  { path: '/blocks', component: Blocks }
]

const router = createRouter({
  history: routerHistory,
  routes
})

export default router
