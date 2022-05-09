import { computed, ComputedRef, Ref, ref, watch, onMounted } from "vue";
import { Store } from "vuex";
import useAPIPagination, {
  merge,
  Pager,
  Response as APIPagination,
} from "@starport/vue/src/composables/useAPIPagination";
import { Amount } from "@starport/vue/src/utils/interfaces";
import { EventEmitter } from "events";

type Params = {
  $s: Store<any>;
  opts: {
    realTime: boolean;
  };
  validator_addr: string | string[];
};

type Response = {
  pager: ComputedRef<Pager>;
  newTxs: Ref<number>;
  normalize: (tx: object) => TxForUI;
};

export type TxForUI = {
  delegator_address: string;
  validator_address: string;
  amount: Amount[];
  hash: string;
  type: string;
  timestamp: string;
  height: number;
};

export default async function ({
  $s,
  opts: { realTime },
  validator_addr,
}: Params): Promise<Response> {
  //store
  let client = computed<EventEmitter>(() => $s.getters["common/env/client"]);

  //methods
  let normalizeAPIResponse = (resp: any) => {
    let { txs, tx_responses, pagination } = resp;

    let merged = txs.map((tx, i) => {
      return { ...tx, ...tx_responses[i] };
    });

    return {
      data: merged,
      total: Number(pagination.total),
    };
  };

  let normalize = (tx: any): TxForUI => {
    let normalized: any = {};

    let isWithdraw = (tx.body.messages[0]["@type"] as string).includes(
      "cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward"
    );

    let isDelegate = (tx.body.messages[0]["@type"] as string).includes(
      "cosmos.staking.v1beta1.MsgDelegate"
    );

    if (isWithdraw) {
      let amount = tx.logs[0].events
        .filter((item) => (item.type = "withdraw_rewards"))[0]
        .attributes.filter((item) => item.key == "amount")[0].value;
      normalized.amount = amount;
    } else if (isDelegate) {
      normalized.amount = tx.body.messages[0].amount;
    }

    normalized.delegator_address = tx.body.messages[0].delegator_address;
    normalized.validator_address = tx.body.messages[0].validator_address;
    normalized.height = Number(tx.height);
    normalized.type = tx.body.messages[0]["@type"];
    normalized.timestamp = tx.timestamp;
    normalized.hash = tx.txhash;

    return normalized as TxForUI;
  };

  let fetchTxs = async (offset: number, event: string) =>
    $s.dispatch("cosmos.tx.v1beta1/ServiceGetTxsEvent", {
      options: { subscribe: true },
      query: { events: event, "pagination.offset": offset },
    });

  // computed
  let DELEGATE_EVENT = computed<string>(
    () => `delegate.validator='${validator_addr}'`
  );
  let WITHDRAW_REWARDS_EVENT = computed<string>(
    () => `withdraw_rewards.validator='${validator_addr}'`
  );

  // state
  //   let orderParam = order === "asc" ? 1 : 2;
  let newTxs = ref(0);

  // composables
  let recvAPIPagination: APIPagination = await useAPIPagination({
    opts: {},
    getters: {
      fetchList: async ({ offset }) =>
        normalizeAPIResponse(
          await fetchTxs(offset, WITHDRAW_REWARDS_EVENT.value)
        ),
    },
  });
  let sentAPIPagination: APIPagination = await useAPIPagination({
    opts: {},
    getters: {
      fetchList: async ({ offset }) =>
        normalizeAPIResponse(await fetchTxs(offset, DELEGATE_EVENT.value)),
    },
  });

  await recvAPIPagination.pager.load();
  await sentAPIPagination.pager.load();

  // computed
  let recvAndSentPager: ComputedRef<Pager> = computed(() =>
    merge(recvAPIPagination.pager, sentAPIPagination.pager)
  );

  if (realTime) {
    client.value.on("newblock", async () => {
      // there's got bet a better way to diff latest vs. current while sparing this wasted round-trip
      let recv = await fetchTxs(0, WITHDRAW_REWARDS_EVENT.value);
      let sent = await fetchTxs(0, DELEGATE_EVENT.value);
      console.log({ recv, sent });
      let currentTotal = recvAndSentPager.value.total.value;
      let latestTotal =
        Number(recv.pagination.total) + Number(sent.pagination.total);
      let diff = latestTotal - currentTotal;
      newTxs.value = diff;

    });
  }

  //   //watch
  //   watch(
  //     () => address.value,
  //     async () => {
  //       await recvAndSentPager.value.load();
  //     }
  //   );

  return {
    pager: recvAndSentPager,
    newTxs,
    normalize,
  };
}
