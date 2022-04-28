<template>
  <!-- Uncomment the following component to add a form for a `modelName` -->
  <!-- <SpCrud store-name="org.repo.module" item-name="modelName" /> -->
  <div class="container">
    <div class="row row-sm-revers">
      <a-list item-layout="horizontal" :data-source="validatorList">
        <template #renderItem="{ item, index }">
          <a-row>
            <a-col :span="2">{{ index + 1 }}</a-col>
            <a-col :span="4">
              <a-typography-paragraph strong>{{
                item.name
              }}</a-typography-paragraph>
              <a-typography-paragraph type="secondary">{{
                "item.address"
              }}</a-typography-paragraph>
            </a-col>
            <a-col :span="5">
              <a-typography-paragraph type="secondary"
                >Total Staked</a-typography-paragraph
              >
              <a-typography-paragraph>{{
                formatPrice(item.totalStaked) + " Stake"
              }}</a-typography-paragraph>
            </a-col>
            <a-col :span="3"
              ><a-typography-paragraph type="secondary">
                Voting Power</a-typography-paragraph
              >
              <a-typography-paragraph>{{
                calculateVotePower(item.totalStaked) + " %"
              }}</a-typography-paragraph>
            </a-col>
            <a-col :span="4"
              ><a-typography-paragraph type="secondary"
                >Current APR</a-typography-paragraph
              >
              <a-typography-paragraph>{{
                "APR" + " %"
              }}</a-typography-paragraph>
            </a-col>
            <a-col :span="3"
              ><a-typography-paragraph type="secondary"
                >Self Bonded</a-typography-paragraph
              >
              <a-typography-paragraph>{{
                100 + " Stake"
              }}</a-typography-paragraph>
            </a-col>
            <a-col :span="3"
              ><a-typography-paragraph type="secondary"
                >Commission Rate</a-typography-paragraph
              >
              <a-typography-paragraph>{{
                item.commission.commission_rates.rate * 100 + " %"
              }}</a-typography-paragraph>
            </a-col>
          </a-row>
        </template>
      </a-list>
      <!-- <ValidatorListItem /> -->
    </div>
  </div>
</template>

<script lang="ts">
import { useStore } from "vuex";
import { useValidators, usePoolBonded } from "../composables";
import { computed, ref } from "vue";
import ValidatorListItem from "../components/ValidatorListItem.vue";
import { ValidatorForUI } from "../composables/useValidators";

export default {
  name: "Explorer",
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
      return (Number(bondedTokens) / Number(poolRaw.value.bonded_tokens)) * 100;
    }

    return {
      validatorList,
      formatPrice,
      calculateVotePower,
    };
  },
};
</script>
