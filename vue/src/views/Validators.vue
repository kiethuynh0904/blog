<template>
  <!-- Uncomment the following component to add a form for a `modelName` -->
  <!-- <SpCrud store-name="org.repo.module" item-name="modelName" /> -->
  <div class="container">
    <div class="row row-sm-revers">
      <a-list
        :loading="validators.isLoading"
        item-layout="horizontal"
        :data-source="validatorList"
      >
        <template #renderItem="{ item, index }">
          <div class="validator-list-container">
            <router-link
              class="outer-link"
              :to="{ name: 'ValidatorsDetail', params: { id: item.address } }"
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
                    formatPrice(item.totalStaked) + " Stake"
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
                    "APR" + " %"
                  }}</a-typography-paragraph>
                </label>
                <label
                  ><a-typography-paragraph type="secondary"
                    >Self Bonded</a-typography-paragraph
                  >
                  <a-typography-paragraph>{{
                    100 + " Stake"
                  }}</a-typography-paragraph>
                </label>
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
import { useValidators, usePoolBonded } from "../composables";
import { computed } from "vue";
import ValidatorListItem from "../components/ValidatorListItem.vue";
import { ValidatorForUI } from "../composables/useValidators";
import { Common } from "../helper";

export default {
  name: "Validators",
  components: {
    ValidatorListItem,
  },

  setup() {
    let $s = useStore();

    // composables
    let { validators, validatorsRaw } = useValidators({ $s });
    let { poolRaw } = usePoolBonded({ $s });

    //computed
    const validatorList = computed<ValidatorForUI[]>(
      () => validators.value.validators.validators
    );

    //method
    function formatPrice(value) {
      let val = (value / 1).toFixed(0);
      return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function calculateVotePower(bondedTokens: string) {
      return (
        (Number(bondedTokens) / Number(poolRaw.value.bonded_tokens)) *
        100
      ).toFixed(2);
    }

    return {
      validatorList,
      formatPrice,
      calculateVotePower,
      Common,
      validators,
    };
  },
};
</script>

<style lang="scss" scoped>
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
