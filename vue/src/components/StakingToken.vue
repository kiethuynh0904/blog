<template>
  <a-form
    :model="formState"
    name="basic"
    :label-col="{ span: 8 }"
    :wrapper-col="{ span: 16 }"
    autocomplete="off"
    @finish="onFinish"
    @finishFailed="onFinishFailed"
  >
    <a-form-item label="Validator address">
      <a-input :disabled="true" v-model:value="validatorAddr" />
    </a-form-item>

    <!-- <a-form-item label="Delegator address">
      <a-input :disabled="true" v-model:value="wallet.accounts?.[0].address" />
    </a-form-item> -->

    <a-form-item label="Amount" name="amount">
      <a-input v-model:value="formState.amount" />
    </a-form-item>

    <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
      <a-space wrap>
        <a-button @click="onStakeTokenToValidator" type="primary"
          >STAKE</a-button
        >
      </a-space>
    </a-form-item>
  </a-form>
</template>
<script>
import { useStore } from "vuex";
import { computed, reactive } from "vue";
export default {
  props: {
    validatorAddr: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const $s = useStore();

    const formState = reactive({
      amount: 0,
    });

    let wallet = computed(() => $s.getters["common/wallet/wallet"]);

    const onStakeTokenToValidator = () => {
      let opts = {
        value: {
          delegator_address: wallet.value?.accounts?.[0].address,
          validator_address: props.validatorAddr,
          amount: {
            denom: "scs",
            amount: formState.amount,
          },
        },
      };
      console.log("otc: ", opts);
      if (wallet.value && formState.amount > 0) {
        sendDeligateMsg(opts);
      }
    };

    const sendDeligateMsg = (opts) => {
      $s.dispatch("cosmos.staking.v1beta1/sendMsgDelegate", opts);
    };

    const onFinish = (values) => {
      console.log("Success:", values);
    };

    const onFinishFailed = (errorInfo) => {
      console.log("Failed:", errorInfo);
    };

    return {
      formState,
      onFinish,
      onFinishFailed,
      onStakeTokenToValidator,
    };
  },
};
</script>