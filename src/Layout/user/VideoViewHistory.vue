<template>
  <div class="video-view-history">
    <p class="cg">暂无观看历史</p>
  </div>
<!--  <MediaCardWaterfall :data="mediaList"></MediaCardWaterfall>-->
</template>
<script>
import MediaCardWaterfall from "@/components/media/MediaCardWaterfall.vue";

export default {
  name: "VideoViewHistory",
  components: {MediaCardWaterfall},
  data() {
    return {
    }
  },
  created() {
  },
  methods: {}
}
</script>
<style scoped>
.video-view-history {
  padding: 20px;
  text-align: center;
}
</style>
