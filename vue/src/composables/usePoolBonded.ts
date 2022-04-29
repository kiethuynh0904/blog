import {
  computed,
  ComputedRef,
  onBeforeMount,
  onUnmounted,
  Ref,
  ref,
  watch,
  onMounted,
} from "vue";
import { Store } from "vuex";
import { V1Beta1Pool } from "../store/generated/cosmos/cosmos-sdk/cosmos.staking.v1beta1/module/rest";

type Response = {
  poolRaw: ComputedRef<any>;
};

export type PoolForUI = {
  bondedTokens: string;
  notBondedTokens: string;
};

type Params = {
  $s: Store<any>;
  opts?: any;
};

export default function ({ $s }: Params): Response {
  // state
  let pool = ref({});

  // actions
  let queryPool = (opts: any) =>
    $s.dispatch("cosmos.staking.v1beta1/QueryPool", opts);
  // lh
  onMounted(async () => {
    queryPool({
      options: { subscribe: true },
    }).then((response) => {
      console.log("response", response.pool);
      pool.value = response;
    });
  });

  let poolRaw = computed<any>(() => {
    return (
      $s.getters["cosmos.staking.v1beta1/getPool"]({
        params: {},
      })?.pool ?? []
    );
  });

  return { poolRaw };
}
