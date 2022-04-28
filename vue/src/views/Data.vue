<template>
  <!-- Uncomment the following component to add a form for a `modelName` -->
  <!-- <SpCrud store-name="org.repo.module" item-name="modelName" /> -->
  <div class="container">
    <div class="row row-sm-revers">
      <div class="col-md-12">
        <a-button type="primary">Primary Button</a-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useStore } from "vuex";
import { useValidators } from "../composables";
import { computed } from "vue";

export default {
  name: "Explorer",
  setup() {
    let $s = useStore();
    // composables
    let { validators, validatorsRaw } = useValidators({ $s });
    console.log("validators", validators);
    console.log('validatorsRaw',validatorsRaw);
    return {
      validators,
    };
  },
};
</script>
