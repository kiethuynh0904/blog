import { sha256 } from "@cosmjs/crypto";
import { fromBase64, toHex } from "@cosmjs/encoding";
import axios from "axios";

function formatTx({
    txHash = "",
    messages = [],
    memo = "",
    signer_infos = [],
    fee = {},
    gas_used = null,
    gas_wanted = null,
    height = null,
    code = 0,
    log = null,
}) {
    return {
        txHash,
        body: {
            messages,
            memo,
        },
        auth_info: {
            signer_infos,
            fee,
        },
        meta: {
            gas_used,
            gas_wanted,
            height,
            code,
            log,
        },
    };
}

async function getTx(apiCosmos, apiTendermint, encodedTx) {
    const txHash = sha256(fromBase64(encodedTx));
    try {
        const rpcRes = await axios.get(
            apiTendermint + "/tx?hash=0x" + toHex(txHash)
        );
        const apiRes = await axios.get(
            apiCosmos + "/cosmos/tx/v1beta1/txs/" + toHex(txHash)
        );
        return { rpcRes, apiRes, txHash: toHex(txHash).toUpperCase() };
    } catch (e) {
        throw "Error fetching TX data";
    }
}

function mergeResults(value, next_values) {
    for (let prop of Object.keys(next_values)) {
        if (Array.isArray(next_values[prop])) {
            value[prop] = [...value[prop], ...next_values[prop]];
        } else {
            value[prop] = next_values[prop];
        }
    }
    return value;
}

async function decodeTx(apiCosmos, apiTendermint, encodedTx) {
    let fullTx;
    let retries = 0;
    while (!fullTx && retries < 5) {
        try {
            fullTx = await getTx(apiCosmos, apiTendermint, encodedTx);
        } catch (e) {
            retries++;
            await new Promise((resolve) => {
                setTimeout(resolve, 2000);
            });
        }
    }
    const { data } = fullTx.rpcRes;
    const { height, tx_result } = data.result;
    const { code, log, gas_used, gas_wanted } = tx_result;
    const { body, auth_info } = fullTx.apiRes.data.tx;
    const { messages, memo } = body;

    return formatTx({
        txHash: fullTx.txHash,
        messages,
        memo,
        signer_infos: auth_info.signer_infos,
        fee: auth_info.fee,
        gas_used,
        gas_wanted,
        height,
        code,
        log,
    });
}

const getDefaultState = () => ({
    initialBlocks: {},
    offset: 0,
    _Subscriptions: new Set(),
});

const state = getDefaultState();

export default {
    namespaced: true,
    state,
    getters: {
        getBlocks:
            (state) =>
            (params = { params: {} }) => {
                if (!(<any>params).query) {
                    (<any>params).query = null;
                }
                return state.initialBlocks[JSON.stringify(params)] ?? {};
            },
    },
    mutations: {
        RESET_STATE(state) {
            Object.assign(state, getDefaultState());
        },
        QUERY(state, { query, key, value }) {
            state[query][JSON.stringify(key)] = value;
        },
        SUBSCRIBE(state, subscription) {
            state._Subscriptions.add(JSON.stringify(subscription));
        },
        UNSUBSCRIBE(state, subscription) {
            state._Subscriptions.delete(JSON.stringify(subscription));
        },
    },
    actions: {
        init({ dispatch, rootGetters }) {
            console.log("Vuex module: custom.blocks initialized!");
            // if (rootGetters["common/env/client"]) {
            //     rootGetters["common/env/client"].on("newblock", (data) => {
            //         dispatch("addBlock", data);
            //     });
            // }
        },
        async queryBlocksInRange(
            { commit, rootGetters, getters },
            {
                options: { subscribe, all } = { subscribe: false, all: false },
                params,
                query = null,
            }
        ) {
            try {
                const key = params ?? {};
                const blockchainInfo = await axios.get(
                    `${rootGetters["common/env/apiTendermint"]}/abci_info`
                );

                let lastest_height = Number(
                    blockchainInfo.data.result.response.last_block_height
                );

                const blocks = await axios.get(
                    `${
                        rootGetters["common/env/apiTendermint"]
                    }/blockchain?minHeight=${
                        lastest_height - 9
                    }&maxHeight=${lastest_height}`
                );

                commit("QUERY", {
                    query: "initialBlocks",
                    key: { params: { ...key }, query },
                    value: blocks.data.result.block_metas,
                });

                if (subscribe)
                    commit("SUBSCRIBE", {
                        action: "queryBlocksInRange",
                        payload: {
                            options: { all },
                            params: { ...key },
                            query,
                        },
                    });

                return (
                    getters["getBlocks"]({
                        params: { ...key },
                        query,
                    }) ?? {}
                );
            } catch (e) {
                throw new Error(
                    "Query Block In Range API Node Unavailable. Could not perform query: " +
                        e.message
                );
            }
        },
        // async addBlock({ commit, rootGetters }, payload) {
        //     try {
        //         console.log("paylak: ", payload);

        //         const blockDetails = await axios.get(
        //             rootGetters["common/env/apiTendermint"] +
        //                 "/block?height=" +
        //                 payload.data.value.block.header.height
        //         );
        //         const txDecoded = payload.data.value.block.data.txs.map(
        //             async (tx) => {
        //                 const dec = await decodeTx(
        //                     rootGetters["common/env/apiCosmos"],
        //                     rootGetters["common/env/apiTendermint"],
        //                     tx
        //                 );
        //                 return dec;
        //             }
        //         );
        //         const txs = await Promise.all(txDecoded);

        //         const block = {
        //             height: payload.data.value.block.header.height,
        //             timestamp: payload.data.value.block.header.time,
        //             hash: blockDetails.data.result.block_id.hash,
        //             details: payload.data.value.block,
        //             txDecoded: txs,
        //         };

        //         commit("ADD_BLOCK", block);
        //     } catch (e) {
        //         throw new Error(
        //             "Blocks:AddBlock Could not add block. RPC node unavailable"
        //         );
        //     }
        // },
        async StoreUpdate({ state, dispatch }) {
            state._Subscriptions.forEach(async (subscription) => {
                try {
                    const sub = JSON.parse(subscription);
                    await dispatch(sub.action, sub.payload);
                } catch (e) {
                    throw new Error("Subscriptions: " + e.message);
                }
            });
        },
        resetState({ commit }) {
            commit("RESET_STATE");
        },
    },
};
