<template>
  <!-- Uncomment the following component to add a form for a `modelName` -->
  <!-- <SpCrud store-name="org.repo.module" item-name="modelName" /> -->

  <div class="container">
    <a-typography-title :level="2">Validators</a-typography-title>
    <div class="header">
      <a-typography-title :level="2" :style="{ color: '#0552dc' }"
        >(S)Core</a-typography-title
      >
      <a-typography-paragraph type="secondary"
        >The backbone of communication among different chains operating in the
        S3 ecosystem</a-typography-paragraph
      >
      <div class="header__info">
        <div>
          <a-typography-paragraph type="secondary"
            >Validators</a-typography-paragraph
          >
          <span :style="{ fontSize: 18 + 'px', fontWeight: 'bold' }">
            {{
              validators.validators.pagination.total +
              "/" +
              params.maxValidators
            }}
          </span>
        </div>
        <div>
          <a-typography-paragraph type="secondary"
            >Inflations</a-typography-paragraph
          >
          <span :style="{ fontSize: 18 + 'px', fontWeight: 'bold' }">
            {{ inflation + " %" }}
          </span>
        </div>
        <div>
          <a-typography-paragraph type="secondary"
            >Bonded Token</a-typography-paragraph
          >
          <span :style="{ fontSize: 18 + 'px', fontWeight: 'bold' }">
            {{ Common.formatPrice(poolRaw.bonded_tokens) + " SCS" }}
          </span>
        </div>
      </div>
    </div>
    <div class="header-sub">
      <a-typography-title :level="2">Validator List</a-typography-title>
      <div>
        <a-select
          ref="select"
          v-model:value="valueSelected"
          style="width: 120px"
          :options="options"
        ></a-select>
      </div>
    </div>

    <div class="row row-sm-revers">
      <a-list
        :loading="validators.isLoading"
        item-layout="horizontal"
        :data-source="
          valueSelected === 'inactive'
            ? validatorListInactive
            : validatorListActive
        "
      >
        <template #renderItem="{ item, index }">
          <div class="validator-list-container">
            <router-link
              class="outer-link"
              :to="{
                name: 'ValidatorsDetail',
                params: { id: item.address },
              }"
            />
            <div class="validator-list-item-container validator-list-common">
              <div class="validator-list-item-rank">
                <label>{{ index + 1 }}</label>
              </div>
              <div class="validator-list-item-info">
                <label>
                  <a-typography-paragraph strong>{{
                    item.name
                  }}</a-typography-paragraph>
                  <a-typography-paragraph type="secondary">{{
                    Common.maskedAddress(item.address)
                  }}</a-typography-paragraph>
                </label>
                <label>
                  <a-typography-paragraph type="secondary"
                    >Total Staked</a-typography-paragraph
                  >
                  <a-typography-paragraph>{{
                    Common.formatPrice(item.totalStaked) + " SCS"
                  }}</a-typography-paragraph>
                </label>
                <label
                  ><a-typography-paragraph type="secondary">
                    Voting Power</a-typography-paragraph
                  >
                  <a-typography-paragraph>{{
                    calculateVotePower(item.totalStaked) + " %"
                  }}</a-typography-paragraph>
                </label>
                <label
                  ><a-typography-paragraph type="secondary"
                    >Current APR</a-typography-paragraph
                  >
                  <a-typography-paragraph type="success">{{
                    item?.aprCalculation + " %"
                  }}</a-typography-paragraph>
                </label>
                <!-- <label
                  ><a-typography-paragraph type="secondary"
                    >Self Bonded</a-typography-paragraph
                  >
                  <a-typography-paragraph>{{
                    "1,000,000" + " SCS"
                  }}</a-typography-paragraph>
                </label> -->
                <label
                  ><a-typography-paragraph type="secondary"
                    >Commission Rate</a-typography-paragraph
                  >
                  <a-typography-paragraph>{{
                    item.commission.commission_rates.rate * 100 + " %"
                  }}</a-typography-paragraph>
                </label>
              </div>
            </div>
          </div>
        </template>
      </a-list>
      <!-- <ValidatorListItem /> -->
    </div>
  </div>
</template>

<script lang="ts">
import { useStore } from "vuex";
import {
  useValidators,
  usePoolBonded,
  useAprCalculation,
} from "../composables";
import { computed, ref } from "vue";
import TokenTransferList from "../components/TokenTransferList.vue";
import { ValidatorForUI } from "../composables/useValidators";
import { Common } from "../helper";
import type { SelectProps } from "ant-design-vue";

export default {
  name: "Validators",
  components: {
    TokenTransferList,
  },

  setup() {
    let $s = useStore();
    //state
    let activeKey = ref("1");
    const options = ref<SelectProps["options"]>([
      {
        value: "active",
        label: "Active",
      },
      {
        value: "inactive",
        label: "Inactive",
      },
    ]);
    // composables
    let { validators, validatorsRaw } = useValidators({ $s });
    let { poolRaw } = usePoolBonded({ $s });
    let { params } = useAprCalculation({ $s });

    //computed
    const validatorListActive = computed<ValidatorForUI[]>(() =>
      validators.value.validators.validators.filter((item) => !item.jailed)
    );
    const validatorListInactive = computed<ValidatorForUI[]>(() =>
      validators.value.validators.validators.filter((item) => item.jailed)
    );
    const inflation = computed(() => (Number(params.value.inflation) * 100).toFixed(2))
    //methods
    const calculateVotePower = (bondedTokens: string) => {
      return (
        (Number(bondedTokens) / Number(poolRaw.value.bonded_tokens)) *
        100
      ).toFixed(2);
    };

    console.log("validatorList", validatorListActive);

    return {
      validatorListActive,
      validatorListInactive,
      calculateVotePower,
      Common,
      validators,
      activeKey,
      options,
      valueSelected: ref("active"),
      poolRaw,
      params,
      inflation,
    };
  },
};
</script>

<style lang="scss" scoped>
.header {
  width: 700px;
  border: 1px solid;
  border-radius: 8px;
  padding: 15px;
  border-color: rgba(5, 82, 220, 0.2);
  background-color: #fbfbfb;
  &__info {
    display: flex;
    justify-content: space-between;
  }
}
.header-sub {
  margin-top: 15px;
  display: flex;
  justify-content: space-between;
}
.validator-list-container {
  background-color: transparent;
  margin-bottom: 32px;
  border: 1px solid rgba(8, 10, 50, 0.1);
  border-radius: 16px;
  transition: box-shadow 0.3s ease;
  position: relative;

  &:hover {
    box-shadow: 0 8px 20px 0 rgb(8 10 50 / 6%);
  }

  .validator-list-item-container {
    flex: 1;
    display: flex;

    .validator-list-item-rank {
      width: 112px;
      text-align: center;
    }

    .validator-list-item-info {
      justify-content: space-around;
      flex: 1;
      display: flex;
    }
  }

  .validator-list-common {
    padding-top: 32px;
    padding-bottom: 32px;
  }
}
.outer-link {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}
</style>
