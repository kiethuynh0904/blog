<template>
  <div class="blocks">
    <h3>Blocks</h3>
    <div class="blocks-generation-info">
      <div class="chain">
        <strong class="chain-name">S3Corp Universe</strong>
        <div class="chain-desc">
          The backbone of communication among different chains operating in the
          Function X ecosystem
        </div>
        <div class="chain-info">
          <div class="chain-height">
            <p>Height</p>
            <h5>{{ height || 0 }}</h5>
          </div>
          <div class="chain-avg-time">
            <p>Average Block Time</p>
            <h5>5.61 secs</h5>
          </div>
        </div>
      </div>
    </div>
    <h4 class="blocks-time">Latest</h4>
    <div class="blocks-more">
      <span></span>
      <p>Only the latest 10,000 blocks will be shown here.</p>
    </div>
    <div class="blocks-refresh-section" v-if="state.numberOfNewBlocks > 0">
      <a href="#" @click="onUpdateNewBlocks">
        <p>{{ state.numberOfNewBlocks }} new blocks. Click to refresh</p>
        <span></span>
      </a>
    </div>
    <div class="blocks-list">
      <a-list
        :loading="state.isLoading"
        item-layout="horizontal"
        :data-source="state.blocks"
        class="block"
      >
        <template #renderItem="{ item: block }">
          <a-row class="wrapper" type="flex">
            <a-col :xs="12" :sm="12" :md="4" :order="1" class="block-left">
              <h5 class="block-number">#{{ block.header.height }}</h5>
              <p class="block-availability">an hour ago</p>
            </a-col>
            <a-col :xs="12" :sm="12" :md="0" :order="3"> Hello </a-col>
            <a-col :xs="0" :sm="0" :md="20" :order="2" class="block-right">
              <a-row type="flex">
                <a-col :md="6" :order="1" class="block-right-segment">
                  <div class="block-proposer">Proposer</div>
                  <p>{{ block.header.proposer_address }}</p>
                </a-col>
                <a-col :md="6" :order="2" class="block-right-segment">
                  <div class="block-fee">Fee</div>
                  <p>0</p>
                </a-col>
                <a-col :md="6" :order="3" class="block-right-segment">
                  <div class="block-transactions">Transactions</div>
                  <p>0</p>
                </a-col>
                <a-col :md="6" :order="4" class="block-right-segment">
                  <div class="block-bytes">Bytes</div>
                  <p>0</p>
                </a-col>
              </a-row>
            </a-col>
          </a-row>
        </template>
      </a-list>
      <div v-if="state.blocks.length > 0">
        <a-pagination
          show-size-changer
          :default-current="currentPage"
          :total="1000"
          @change="onPageChange"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useStore } from "vuex";
import { computed, onMounted, reactive, watch, ref } from "vue";

export interface State {
  isLoading: boolean;
  numberOfNewBlocks: number;
  blocks: any[];
}

export default {
  name: "Blocks",
  setup() {
    // store
    let $s = useStore();

    // computed
    let state: State = reactive({
      isLoading: false,
      numberOfNewBlocks: 0,
      blocks: <any>[],
    });
    let currentPage = ref(1);
    let latestHeight = ref(null);

    let height = computed(
      () => $s.getters["common/blocks/getBlocks"](10)[0]?.height
    );

    //lh
    onMounted(() => {
      fetchBlocks({
        params: {},
      });
    });

    watch(
      () => [state.blocks, height],
      (currentValue: any) => {
        if (currentValue?.[0].length > 0 && latestHeight.value !== null) {
          state.numberOfNewBlocks =
            Number(currentValue[1].value) - Number(latestHeight.value);
        }
      },
      { deep: true }
    );
    //methods

    const onPageChange = (current: number) => {
      fetchBlocks({
        params: {},
        offset: current,
      });
    };

    let fetchBlocks = async (opts: any) => {
      try {
        state.isLoading = true;
        const response = await $s.dispatch(
          "custom/blocks/queryBlocksInRange",
          opts
        );
        state.blocks = response.blocks;
        latestHeight.value = response.latestHeight;
      } catch (error) {
      } finally {
        state.isLoading = false;
      }
    };

    let onUpdateNewBlocks = () => {
      fetchBlocks({
        params: {},
        offset: currentPage.value,
      });
    };

    return {
      state,
      height,
      onUpdateNewBlocks,
      onPageChange,
      currentPage,
    };
  },
};
</script>

<style lang="scss" scoped>
$title-text: rgba(8, 10, 50, 0.5);

.block {
  margin-bottom: 32px;
  .wrapper {
    border: 1px solid rgba(8, 10, 50, 0.1);
    border-radius: 16px;
    margin-bottom: 14px;
  }
  &-proposer {
    color: $title-text;
  }
  &-left {
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    border-right: 1px solid rgba(8, 10, 50, 0.1);
    h5 {
      font-size: 20px;
      line-height: 24px;
    }
    p {
      color: $title-text;
      margin-bottom: 0;
    }
  }

  &-right-segment {
    padding: 32px 48px;
    div {
      margin-bottom: 10px;
      line-height: 16px;
    }
    p {
      margin-bottom: 0;
      font-weight: 500;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}

.blocks {
  margin: 0 auto;
  width: 1200px;
  &-generation-info {
    border: 1px solid rgba(8, 10, 50, 0.1);
    overflow: hidden;
    margin: 16px 0 32px 0;
    padding: 16px 24px;
    box-sizing: border-box;
    border-radius: 16px;
    background-image: linear-gradient(
      230deg,
      rgba(5, 82, 220, 0.1),
      hsla(0, 0%, 100%, 0) 55%
    );
    .chain {
      &-name {
        font-size: 22px;
        margin: 0 0 8px;
        color: #0552dc;
      }

      &-desc {
        color: $title-text;
      }

      &-info {
        display: flex;
        justify-content: space-between;
        margin-top: 16px;
        h5 {
          font-size: 18px;
          margin-bottom: 0;
          line-height: 1.8em;
        }
        p {
          color: $title-text;
          margin-bottom: 0;
        }
      }
    }
  }
  padding: 32px 16px;
  h3 {
    font-size: 28px;
  }
  &-more {
    p {
      color: rgba(8, 10, 50, 0.5);
    }
  }
  &-time {
    font-size: 24px;
  }
  &-refresh-section {
    box-sizing: border-box;
    padding: 18px 32px;
    background-color: rgba(5, 82, 220, 0.06);
    border-radius: 16px;
    margin-bottom: 32px;
    p {
      margin-bottom: 0;
      font-weight: bold;
    }
  }
}
</style>