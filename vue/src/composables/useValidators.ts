import { Pubkey } from "@cosmjs/amino";
import {
  computed,
  ComputedRef,
  onBeforeMount,
  onMounted,
  onUnmounted,
  Ref,
  ref,
  watch,
} from "vue";
import { Store } from "vuex";
import {
  V1Beta1QueryValidatorsResponse,
  V1Beta1PageResponse,
  ProtobufAny,
  Stakingv1Beta1Validator,
  V1Beta1Commission,
} from "../store/generated/cosmos/cosmos-sdk/cosmos.staking.v1beta1/module/rest";

type Response = {
  validators: Ref<{
    isLoading: boolean;
    validators: ValidatorsForUI;
  }>;
  validatorsRaw: ComputedRef<any>;
};
export type ValidatorsForUI = {
  validators: ValidatorForUI[];
  pagination: V1Beta1PageResponse;
};

export type ValidatorForUI = {
  name: string;
  address: string;
  totalStaked: string;
  selfBonded: string;
  commission: V1Beta1Commission;
};

type Params = {
  $s: Store<any>;
  opts?: any;
};

export default function ({ $s }: Params): Response {
  // state
  let validators = ref({
    isLoading: true,
    validators: {
      validators: [],
      pagination: {},
    },
  });

  // actions
  let queryValidators = (opts: any) =>
    $s.dispatch("cosmos.staking.v1beta1/QueryValidators", opts);

  // lh
  onMounted(async () => {
    queryValidators({
      options: { subscribe: true },
    })
      .then((response) => {
        if (response.validators) {
          let arr: Promise<ValidatorForUI>[] =
            response.validators.map(normalize);
          Promise.all(arr).then((normalized) => {
            validators.value.validators.validators = normalized as any;
          });
        }
        validators.value.validators.pagination = response.pagination;
      })
      .finally(() => {
        validators.value.isLoading = false;
      });
  });

  // computed
  let validatorsRaw = computed<any>(() => {
    return (
      $s.getters["cosmos.staking.v1beta1/getValidators"]({
        params: {},
      })?.validators ?? []
    );
  });

  // methods
  let normalize = async (
    validator: Stakingv1Beta1Validator
  ): Promise<ValidatorForUI> => {
    let normalized: ValidatorForUI = {
      name: "",
      address: "",
      totalStaked: "",
      selfBonded: "",
      commission: {},
    };

    normalized.name = validator.description.moniker;
    normalized.address = validator.operator_address;
    normalized.totalStaked = validator.tokens;
    normalized.selfBonded = validator.tokens;
    normalized.commission = validator.commission;

    return normalized;
  };
  

  return { validators, validatorsRaw };
}
