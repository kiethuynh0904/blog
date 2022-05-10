import { blocks, env, wallet } from '@starport/vuex'
import blocksV2 from './custom/blocks';

import generated from './generated'
export default function init(store) {
  for (const moduleInit of Object.values(generated)) {
    moduleInit(store)
  }
  blocks(store)
  blocksV2(store)
  env(store)
  wallet(store)
}
