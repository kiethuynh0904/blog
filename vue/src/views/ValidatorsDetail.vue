<template>
  <div class="container">
    <a-typography-title :level="2">Validator Detail</a-typography-title>
    <div class="validator-info distinguish">
      <div class="validator-info-avatar"></div>
      <div class="validator-info-label">
        <a-typography-title :level="5">{{
          validator.data?.validator?.description?.moniker
        }}</a-typography-title>
        <a-typography-paragraph copyable>{{
          validator.data?.validator?.operator_address
        }}</a-typography-paragraph>
      </div>
      <div class="validator-info-community"></div>
    </div>

    <a-row class="validator-chain-detail distinguish">
      <a-col class="validator-chain-detail-item" :span="8">
        <a-typography-paragraph type="secondary"
          >Current APR</a-typography-paragraph
        >
        <a-typography-title type="success" :level="4">{{
          aprCalculation + "%"
        }}</a-typography-title>
      </a-col>
      <a-col class="validator-chain-detail-item" :span="8">
        <a-typography-paragraph type="secondary"
          >Total Staked</a-typography-paragraph
        >
        <a-typography-title :level="4"
          >{{
            Common.formatPrice(validator.data?.validator?.tokens, 2) + " Stake"
          }}
        </a-typography-title>
      </a-col>
      <a-col class="validator-chain-detail-item" :span="8">
        <a-typography-paragraph type="secondary"
          >Voting Power</a-typography-paragraph
        >
        <a-typography-title :level="4">{{
          calculateVotePower(validator.data?.validator?.tokens) + "%"
        }}</a-typography-title>
      </a-col>
    </a-row>
    <a-row class="validator-basic-info">
      <a-col class="basic-info-left distinguish" :span="15">
        <div class="label-item">
          <a-space :size="5">
            <a-typography-paragraph type="secondary"
              >Self Bonded:</a-typography-paragraph
            >
            <a-typography-paragraph>100 SCS(0%)</a-typography-paragraph>
          </a-space>
        </div>
        <div class="label-item">
          <a-space :size="5">
            <a-typography-paragraph type="secondary"
              >Stake Balance:</a-typography-paragraph
            >
            <a-typography-paragraph>20.106894 SCS</a-typography-paragraph>
          </a-space>
        </div>
        <div class="label-item">
          <a-space :size="5">
            <a-typography-paragraph type="secondary"
              >Bonded Height:</a-typography-paragraph
            >
            <a-typography-paragraph> #0</a-typography-paragraph>
          </a-space>
        </div>
        <div class="label-item">
          <a-space :size="5">
            <a-typography-paragraph type="secondary"
              >Current Commission Rate:</a-typography-paragraph
            >
            <a-typography-paragraph>10% (Max:20%)</a-typography-paragraph>
          </a-space>
        </div>
        <div class="label-item">
          <a-space :size="5">
            <a-typography-paragraph type="secondary"
              >Number of Tx:</a-typography-paragraph
            >
            <a-typography-paragraph>9760 Tx</a-typography-paragraph>
          </a-space>
        </div>
      </a-col>
      <a-col class="basic-info-right distinguish" :span="8" :offset="1">
      </a-col>
    </a-row>
    <Suspense>
      <TokenTransferList :validator_addr="route.params.id" />
    </Suspense>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  ref,
  computed,
  watch,
  reactive,
} from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { Common } from "../helper";
import { usePoolBonded, useAprCalculation, useTxs } from "../composables";
import TokenTransferList from "../components/TokenTransferList.vue";

export default {
  components: { TokenTransferList },

  setup() {
    // store & route
    let $s = useStore();
    let route = useRoute();

    //state
    let validator = ref({
      isLoading: true,
      data: {},
    });

    let aprCalculation = ref("");

    let { poolRaw } = usePoolBonded({ $s });
    let { AprCalculation, params } = useAprCalculation({ $s });

    let queryValidatorDetail = async (opts?: any) => {
      try {
        const response = await $s.dispatch(
          "cosmos.staking.v1beta1/QueryValidator",
          opts
        );
        validator.value.data = response;
        aprCalculation.value = AprCalculation(response.validator);
      } catch (error) {
      } finally {
        validator.value.isLoading = false;
      }
    };

    onMounted(() => {
      if (route.params.id) {
        queryValidatorDetail({
          options: { subscribe: true },
          params: { validator_addr: route.params.id },
        });
      }
    });

    watch(params.value, () => {
      if (route.params.id) {
        queryValidatorDetail({
          options: { subscribe: true },
          params: { validator_addr: route.params.id },
        });
      }
    });

    //methods
    const calculateVotePower = (bondedTokens: string) => {
      return (
        (Number(bondedTokens) / Number(poolRaw.value.bonded_tokens)) *
        100
      ).toFixed(2);
    };

    return {
      route,
      validator,
      Common,
      calculateVotePower,
      aprCalculation,
      AprCalculation,
    };
  },
};
</script>

<style lang="scss" scoped>
.distinguish {
  background-color: #fbfbfb;
}
.validator-info {
  display: flex;
  padding: 32px;
  margin-bottom: 44px;
  border-radius: 16px;

  .validator-info-icon {
    margin-right: 32px;
    flex-shrink: 0;
  }
  .validator-info-label {
    margin-top: 6px;
  }
  .validator-info-community {
    flex: 1;
    flex-shrink: 0;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-left: 130px;
  }
}
.validator-chain-detail {
  padding: 32px 0;
  border-radius: 16px;
  margin-bottom: 44px;

  .validator-chain-detail-item {
    text-align: center;
  }
}

.validator-basic-info {
  .basic-info-left {
    border-radius: 16px;
    padding: 32px;
    margin-bottom:10px;
    .label-item {
      display: flex;
    }
  }
  .basic-info-right {
    border-radius: 16px;
    padding: 32px;
  }
}
</style>

