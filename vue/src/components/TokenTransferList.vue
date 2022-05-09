<template>
  <div class="tx-list">
    <a-typography-title :level="4" class="title"
      >Transactions</a-typography-title
    >
    <a-button
      v-if="newTxs"
      class="load-more"
      shape="round"
      @click="loadNewItems"
    >
      <a-spin v-if="state.isNewTxLoading" />
      <a-typography-text v-else type="success">
        {{ showMoreText }}</a-typography-text
      >
    </a-button>
    <a-list item-layout="horizontal" :data-source="list">
      <template #renderItem="{ item }">
        <div class="tx-item">
          <!-- <router-link
            class="outer-link"
            :to="{ name: 'ValidatorsDetail', params: { id: item.address } }"
          /> -->
          <a-row>
            <a-col class="tx-message" :span="16">
              <div class="tx-message__header">
                <div class="tx-message__header__title">
                  {{ formatTxType(item.type) }}
                </div>
                <div class="tx-message__header__date">2 days ago</div>
              </div>
              <div class="tx-message__status tx-row">
                <a-typography-text strong>Success</a-typography-text>
              </div>
              <div class="tx-message__txhash tx-row">
                <a-space :size="3">
                  <span class="label-text">Tx hash:</span>
                  <span>{{ item.hash }}</span>
                </a-space>
              </div>
              <div class="tx-message__from tx-row">
                <a-space :size="3">
                  <span class="label-text">From:</span>
                  <span>{{ item.validator_address }}</span>
                </a-space>
              </div>
              <div class="tx-message__to tx-row">
                <a-space :size="3">
                  <span class="label-text">To:</span>
                  <span>{{ item.delegator_address }}</span>
                </a-space>
              </div>
            </a-col>
            <a-col class="tx-basic-info" :span="8">
              <div class="tx-basic-info__height">
                <a-space :size="5">
                  <span
                    :style="{
                      fontSize: 16 + 'px',
                      fontWeight: 'bold',
                      color: 'rgba(8,10,50,.5)',
                    }"
                    >Height:</span
                  >
                  <span :style="{ fontSize: 16 + 'px', fontWeight: 'bold' }">{{
                    "#" + item.height
                  }}</span>
                </a-space>
              </div>
              <div class="tx-basic-info__amount">
                <a-space :size="5">
                  <span class="label-text">Amount:</span>
                  <span
                    v-if="item.type === '/cosmos.staking.v1beta1.MsgDelegate'"
                    :style="{ fontSize: 14 + 'px' }"
                    >{{
                      formatPrice(item?.amount?.amount) +
                      " " +
                      item?.amount?.denom
                    }}</span
                  >
                  <span v-else :style="{ fontSize: 14 + 'px' }">{{
                    item?.amount
                  }}</span>
                </a-space>
              </div>
              <div class="tx-basic-info__fee">
                <a-space :size="5">
                  <span class="label-text">Fee:</span>
                  <span :style="{ fontSize: 14 + 'px' }">{{
                    0.3333 + "Stake"
                  }}</span>
                </a-space>
              </div>
            </a-col>
          </a-row>
        </div>
      </template>
    </a-list>
  </div>
</template>

<script lang="ts">
import { useTxs } from "../composables";
import { defineComponent, computed, reactive, watch } from "vue";
import { useStore } from "vuex";
import { TxForUI } from "../composables/useTxs";
import { formatPrice } from "../helper/common";

export interface State {
  listSize: number;
  listMaxSize: number;
  isNewTxLoading: boolean;
}

export let initialState: State = {
  listSize: 10,
  listMaxSize: 15,
  isNewTxLoading: false,
};
export default defineComponent({
  props: {
    validator_addr: {
      type: String,
      required: true,
    },
  },

  async setup(props) {
    //store
    let $s = useStore();

    // state
    let state: State = reactive(initialState);

    let { pager, newTxs, normalize } = await useTxs({
      $s,
      opts: { realTime: true },
      validator_addr: props.validator_addr,
    });

    console.log("newTxs", newTxs);
    console.log("pager", pager);

    let list = computed<TxForUI[]>(() => {
      return pager.value.page.value
        .map(normalize)
        .slice(
          pager.value.total.value - state.listSize,
          pager.value.total.value,
        )
        .sort((a, b) => b.height - a.height);
    });

    let showMoreText = computed<string>(
      () => `${newTxs.value} new ${newTxs.value > 1 ? "items" : "item"}`
    );

    let loadNewItems = async () => {
      state.isNewTxLoading = true;
      await pager.value.load();
      state.isNewTxLoading = !!newTxs.value;
    };

    console.log("list", list);

    //method
    let formatTxType = (txType: string) => {
      switch (txType) {
        case "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward":
          return "WithdrawDelegatorReward";
        case "/cosmos.staking.v1beta1.MsgDelegate":
          return "Delegate";
        default:
          return "Delegate";
      }
    };

    // //watch
    // watch(
    //   () => newTxs.value,
    //   async () => {
    //     console.log("newTxs.value", newTxs.value);
    //   }
    // );

    return {
      list,
      newTxs,
      formatPrice,
      formatTxType,
      showMoreText,
      loadNewItems,
      state,
    };
  },
});
</script>

<style lang="scss" scoped>
.label-text {
  font-size: 14px;
  color: rgba(8, 10, 50, 0.5);
}

.tx-row {
  display: flex;
  margin-bottom: 10px;
  margin-top: 10px;
}

.tx-list {
  flex: 1;
  .title {
  }
}

.tx-item {
  border: 1px solid #e6e6ea;
  overflow: hidden;
  border-radius: 16px;
  margin-bottom: 22px;
}

.tx-message {
  padding: 15px;
  &__header {
    display: flex;
    justify-content: space-between;
    &__title {
      font-size: 14px;
      font-weight: bold;
    }
    &__date {
    }
  }
}
.tx-basic-info {
  background-color: #fbfbfb;
  padding: 15px;
  &__height {
    display: flex;
  }
}
.load-more {
  margin-bottom: 10px;
}
</style>

