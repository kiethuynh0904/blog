import {
  computed,
  ComputedRef,
  onBeforeMount,
  onUnmounted,
  Ref,
  ref,
  watch,
  onMounted,
  watchEffect,
} from "vue";
import { Store } from "vuex";
import { V1Beta1QueryTotalSupplyResponse } from "../store/generated/cosmos/cosmos-sdk/cosmos.bank.v1beta1/module/rest";
import { usePoolBonded } from ".";

type Response = {
  AprCalculation: (validator: object) => string;
  params: Ref<ParamsForUI>;
};

export type ParamsForUI = {
  inflation: string;
  maxValidators: number;
  communityTax: string;
  totalSupply: V1Beta1QueryTotalSupplyResponse;
};

type Params = {
  $s: Store<any>;
  opts?: any;
};

export default function ({ $s }: Params): Response {
  // state
  let AprParams = ref({
    inflation: "",
    maxValidators: 100,
    communityTax: "",
    totalSupply: {
      supply: [],
      pagination: {},
    },
  });

  let { poolRaw } = usePoolBonded({ $s });

  // actions
  let queryStakingParams = (opts: any) =>
    $s.dispatch("cosmos.staking.v1beta1/QueryParams", opts);
  let queryMintInflation = (opts: any) =>
    $s.dispatch("cosmos.mint.v1beta1/QueryInflation", opts);
  let queryDistributionParams = (opts: any) =>
    $s.dispatch("cosmos.distribution.v1beta1/QueryParams", opts);
  let queryTotalSupply = (opts: any) =>
    $s.dispatch("cosmos.bank.v1beta1/QueryTotalSupply", opts);
  // lh
  onMounted(async () => {
    queryStakingParams({
      options: { subscribe: true },
    }).then((response) => {
      AprParams.value.maxValidators = response.params.max_validators;
    });
    queryMintInflation({
      params: {},
      options: { subscribe: true },
    }).then((response) => {
      AprParams.value.inflation = response.inflation;
    });
    queryDistributionParams({
      options: { subscribe: true },
    }).then((response) => {
      AprParams.value.communityTax = response.params.community_tax;
    });
    queryTotalSupply({
      options: { subscribe: true },
    }).then((response) => {
      AprParams.value.totalSupply = response;
    });
  });

  //method
  let AprCalculation = (validator: any): string => {
    let totalStaked = poolRaw.value.bonded_tokens;
    let apr =
      (Number(AprParams.value.inflation) *
        (1 - Number(AprParams.value.communityTax))) /
      (Number(totalStaked) /
        Number(
          AprParams.value.totalSupply.supply.filter(
            (item) => item.denom === "scs"
          )?.[0]?.amount
        ));

    let finalApr =
      apr * (1 - Number(validator?.commission?.commission_rates?.rate));
    return (finalApr * 100).toFixed(2);
  };

  return { AprCalculation, params: AprParams };
}
