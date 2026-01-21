import {defineStore} from "pinia";
import {ref} from "vue";

export const tokenX = defineStore(
    "token",
    () => {
        let token = ref("");
        const setToken = (val: any) => {
            token.value = val;
        };
        const removeToken = () => {
            token.value = "";
        };
        return {
            token,
            setToken,
            removeToken,
        };
    },
    {
        persist: {
            key: 'tokenX',  // 使用不同的key避免与auth.js中的'token'冲突
            storage: localStorage,
        }
    }
);
