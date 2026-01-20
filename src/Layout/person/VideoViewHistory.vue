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
      mediaList: [
        {
          imgSrc: "https://tse3-mm.cn.bing.net/th/id/OIP-C.FaNkJVeiGCXW6YolPOvbQAHaHa?w=220&h=220&c=7&r=0&o=5&dpr=1.5&pid=1.7",
          avatar: "https://tse3-mm.cn.bing.net/th/id/OIP-C.FaNkJVeiGCXW6YolPOvbQAHaHa?w=220&h=220&c=7&r=0&o=5&dpr=1.5&pid=1.7",
          user: "Lewis",
          vote_num: 999,
          title: "Noice cancelling is a secret weapon",
        },
        {
          imgSrc: "https://tse4-mm.cn.bing.net/th/id/OIP-C.-8sTBQWU55DOkQDjds4BrAHaKk?w=154&h=220&c=7&r=0&o=5&dpr=1.5&pid=1.7",
          avatar: "https://tse4-mm.cn.bing.net/th/id/OIP-C.-8sTBQWU55DOkQDjds4BrAHaKk?w=154&h=220&c=7&r=0&o=5&dpr=1.5&pid=1.7",
          user: "Lewis",
          vote_num: 999,
          title: "Work from home is so boring",
        },
        {
          imgSrc: "https://tse3-mm.cn.bing.net/th/id/OIP-C.FaNkJVeiGCXW6YolPOvbQAHaHa?w=220&h=220&c=7&r=0&o=5&dpr=1.5&pid=1.7",
          avatar: "https://tse3-mm.cn.bing.net/th/id/OIP-C.FaNkJVeiGCXW6YolPOvbQAHaHa?w=220&h=220&c=7&r=0&o=5&dpr=1.5&pid=1.7",
          user: "Lewis",
          vote_num: 999,
          title: "Noice cancelling is a secret weapon",
        },
        {
          imgSrc: "https://tse4-mm.cn.bing.net/th/id/OIP-C.-8sTBQWU55DOkQDjds4BrAHaKk?w=154&h=220&c=7&r=0&o=5&dpr=1.5&pid=1.7",
          avatar: "https://tse4-mm.cn.bing.net/th/id/OIP-C.-8sTBQWU55DOkQDjds4BrAHaKk?w=154&h=220&c=7&r=0&o=5&dpr=1.5&pid=1.7",
          user: "Lewis",
          vote_num: 999,
          title: "Work from home is so boring",
        },
        {
          imgSrc: "https://tse3-mm.cn.bing.net/th/id/OIP-C.FaNkJVeiGCXW6YolPOvbQAHaHa?w=220&h=220&c=7&r=0&o=5&dpr=1.5&pid=1.7",
          avatar: "https://tse3-mm.cn.bing.net/th/id/OIP-C.FaNkJVeiGCXW6YolPOvbQAHaHa?w=220&h=220&c=7&r=0&o=5&dpr=1.5&pid=1.7",
          user: "Lewis",
          vote_num: 999,
          title: "Noice cancelling is a secret weapon",
        },
        {
          imgSrc: "https://tse4-mm.cn.bing.net/th/id/OIP-C.-8sTBQWU55DOkQDjds4BrAHaKk?w=154&h=220&c=7&r=0&o=5&dpr=1.5&pid=1.7",
          avatar: "https://tse4-mm.cn.bing.net/th/id/OIP-C.-8sTBQWU55DOkQDjds4BrAHaKk?w=154&h=220&c=7&r=0&o=5&dpr=1.5&pid=1.7",
          user: "Lewis",
          vote_num: 999,
          title: "Work from home is so boring",
        },
      ]
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
