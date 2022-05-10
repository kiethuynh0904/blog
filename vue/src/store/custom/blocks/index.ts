import blocks from "./blocks";

export default function init(store) {
    console.log('store: ', store);
    
    if (!store.hasModule(['custom'])) {
        store.registerModule(['custom'], { namespaced: true });
    }
    store.registerModule(['custom', 'blocks'], blocks);
    store.subscribe((mutation) => {
        if (mutation.type == 'common/env/INITIALIZE_WS_COMPLETE') {
            store.dispatch('custom/blocks/init', null, { root: true });
        }
    });
}
