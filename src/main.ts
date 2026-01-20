import { createPinia } from "pinia";
import { createApp } from "vue";

import "@/assets/styles/element.scss";
import "@/style.scss";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import 'element-plus/theme-chalk/dark/css-vars.css';
import App from "./App.vue";
import router from "./router/index.ts";
import "./tailwind.css";
//pinia 自动存储话插件
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
// 自定义方法
import {
    addDateRange,
    formatAge,
    getAge,
    handleTree,
    parseTime,
    removeHtmlTags,
    resetForm,
    smartDateFormat
} from "@/utils/roydon.js";
// 图片预览组件
import VueViewer from 'v-viewer';
import 'viewerjs/dist/viewer.css';
// vue瀑布流插件
import { VueMasonryPlugin } from 'vue-masonry';

// v-md-editor
import VMdEditor from '@kangc/v-md-editor';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';
import '@kangc/v-md-editor/lib/theme/style/vuepress.css';
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js';
import Prism from 'prismjs';

import VMdPreview from '@kangc/v-md-editor/lib/preview';
import '@kangc/v-md-editor/lib/style/preview.css';
// 引入所有语言包
import hljs from 'highlight.js';

VMdEditor.use(vuepressTheme, {
    Prism,
});
VMdEditor.use(githubTheme, {
    Hljs: hljs,
});

// highlightjs
VMdPreview.use(githubTheme, {
    Hljs: hljs,
});

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

// 注册所有ele图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}
// 全局方法挂载
app.config.globalProperties.parseTime = parseTime;
app.config.globalProperties.smartDateFormat = smartDateFormat;
app.config.globalProperties.formatAge = formatAge;
app.config.globalProperties.getAge = getAge;
app.config.globalProperties.resetForm = resetForm;
app.config.globalProperties.addDateRange = addDateRange;
app.config.globalProperties.handleTree = handleTree;
app.config.globalProperties.removeHtmlTags = removeHtmlTags;

app.use(router)
app.use(pinia)
app.use(ElementPlus, {
    locale: zhCn,
})
app.use(VueViewer)
VueViewer.setDefaults({
    zIndexInline: 2023
})
app.use(VueMasonryPlugin);
app.use(VMdEditor);
app.use(VMdPreview);

app.mount("#app");
