<template>
  <div class="favorite-collection-container">
    <div class="flex-between" v-loading="loadingIcon">
      <el-skeleton class="w100" :loading="loading" animated>
        <template #template>
          <div class="loading-container" v-for="i in 2">
            <div class="loading-item" v-for="i in 3">
              <el-skeleton-item variant="image" class="w100" style="height: 120px"/>
              <div class="p1rem">
                <el-skeleton-item variant="h1" class="w100"/>
              </div>
            </div>
          </div>
        </template>
        <template #default>
          <div class="collection-edge cp" v-for="(item,index) in collectionList">
            <div class="collection-container">
              <div class="collection-head flex-between">
                <div class="coll-title fs9 fw600">{{ item.title }}</div>
                <!--              操作区域-->
                <div class="coll-op cp">
                  <el-popover placement="top"
                              trigger="hover"
                              popper-style="padding: 1rem;">
                    <template #reference>
                      <el-icon>
                        <MoreFilled/>
                      </el-icon>
                    </template>
                    <template #default>
                      <div class="flex-center">
                        <el-button type="primary" @click="handleEditCollectionDialog(item.favoriteId)">编辑收藏夹
                        </el-button>
                      </div>
                      <div class="flex-center" style="margin-top: 0.5rem">
                        <el-button type="warning" @click="handleDelCollection(item.favoriteId)">删除收藏夹</el-button>
                      </div>
                    </template>
                  </el-popover>
                </div>
              </div>
              <div class="collection-info flex-start">
                <p class="cg fs7 ptb10px">共 {{ item.videoCount }} 件作品</p>
              </div>
              <div class="collection-video flex-between">
                <div class="video-cover-list flex-center"
                     v-for="(cover,index) in item.videoCoverList">
                  <el-image v-if="cover" class="video-cover eli-ofc" lazy :src="cover"/>
                  <el-avatar v-else class="video-cover eli-ofc" :icon="Film"/>
                </div>
              </div>
            </div>
          </div>
        </template>
      </el-skeleton>
      <div class="w100">
        <el-empty v-show="collectionTotal<=0" description="暂无数据"/>
      </div>
    </div>
  </div>
  <div v-if="dataNotMore">
    <el-divider>暂无更多数据</el-divider>
  </div>
  <!--  编辑详细信息弹框  -->
  <el-dialog v-model="editDialogVisible"
             :width="400"
             align-center
             :show-close="false">
    <template #header="{ close, titleId, titleClass }">
      <h3 class="one-line" :id="titleId" :class="titleClass">编辑收藏夹</h3>
      <el-button circle :icon="Close" class="cb" type="info" @click="close">
      </el-button>
    </template>
    <div class="mb5">收藏夹名称</div>
    <el-input v-model="collectionForm.title"
              placeholder="收藏夹的名称"
              clearable
              maxlength="10"
              show-word-limit
              type="text"></el-input>
    <div class="mtb5">收藏夹描述</div>
    <el-input v-model="collectionForm.description"
              placeholder="收藏夹的描述..."
              clearable
              maxlength="100"
              show-word-limit
              type="textarea"></el-input>
    <div class="flex-between mtb5">
      <div>
        <p class="fs8">>设置为公开</p>
        <p class="fs7 cg">公开后有机会被推荐，帮助到更多人</p>
      </div>
      <div>
        <el-switch
            v-model="collectionForm.showStatus"
            active-value="0"
            inactive-value="1"
            active-color="#13ce66"
            inactive-color="#ff4949">
        </el-switch>
      </div>
    </div>
    <!--  确认按钮  -->
    <div class="edit-button flex-center">
      <el-button class="w100 fw600" type="primary" @click="confirmUpdateCollection">保存</el-button>
    </div>
  </el-dialog>
  <!--  删除收藏夹dialog-->
  <el-dialog v-model="delDialogVisible"
             :width="400"
             :show-close="false" align-center>
    <template #header="{close}">
      <p style="color: var(--niuyin-text-color)">确定删除此收藏夹吗？</p>
      <el-button circle :icon="Close" class="cb" type="info" @click="close">
      </el-button>
    </template>
    <div class="mb1rem">
      <p>确认删除该收藏夹吗，删除后视频依旧可在收藏视频中查看~</p>
    </div>
    <div class="edit-button flex-center">
      <el-button class="w100 fw600" type="primary" @click="handleConfirmDelCollection">确定删除</el-button>
    </div>
  </el-dialog>
</template>

<script>
import {
  collectionInfoList,
  collectionInfoPage,
  deleteFavorite,
  updateFavorite,
  videoFavoritePage
} from "@/api/behave.js";
import {Close, Film, InfoFilled, MoreFilled, UserFilled} from "@element-plus/icons-vue";

export default {
  name: "UserFavoriteCollection",
  components: {MoreFilled},
  computed: {
    Close() {
      return Close
    },
    Film() {
      return Film
    },
    UserFilled() {
      return UserFilled
    },
    InfoFilled() {
      return InfoFilled
    }
  },
  props: {},
  data() {
    return {
      loading: true,
      loadingData: true,
      loadingIcon: false,
      dataNotMore: false,
      editDialogVisible: false,
      delDialogVisible: false,
      collectionQueryParams: {
        pageNum: 1,
        pageSize: 10
      },
      collectionList: [], //收藏夹集合
      collectionTotal: undefined,
      favoriteId: '',
      collectionForm: {},
    }
  },
  created() {
    this.initCollectionList()
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll, true);
  },
  destroyed() {
    document.removeEventListener('scroll', this.handleScroll);
  },
  methods: {
    // 收藏夹集合
    initCollectionList() {
      this.loading = true
      collectionInfoPage(this.collectionQueryParams).then(res => {
        console.log('📦 [COLLECTION] 收藏夹列表响应:', res)
        if (res.code === 0 || res.code === 200) {
          // 后端返回格式: { favorite_list: [...], total_count: number }
          const rawList = res.data?.favorite_list || res.data?.FavoriteList || res.rows || []
          this.collectionList = this.formatCollectionList(rawList)
          this.collectionTotal = res.data?.total_count || res.data?.TotalCount || res.total || 0
          console.log('✅ [COLLECTION] 转换后的收藏夹列表:', this.collectionList)
          this.loading = false
        } else {
          this.loading = false
        }
      }).catch(err => {
        console.error('❌ [COLLECTION] 获取收藏夹列表失败:', err)
        this.loading = false
      })
    },
    // 格式化收藏夹列表
    formatCollectionList(items) {
      if (!Array.isArray(items)) return []
      return items.map(item => {
        const favoriteId = item.favorite_id || item.FavoriteId || item.favoriteId
        const videoCoverList = item.video_cover_list || item.VideoCoverList || item.videoCoverList || []
        // 填充六张作品封面为空串
        const paddedCovers = [...videoCoverList, ...new Array(Math.max(0, 6 - videoCoverList.length)).fill('')]
        
        return {
          favoriteId: favoriteId,
          title: item.name || item.Name || item.title || '未命名收藏夹',
          description: item.description || item.Description || '',
          videoCount: item.video_count || item.VideoCount || item.videoCount || 0,
          videoCoverList: paddedCovers,
          showStatus: item.privacy || item.Privacy || item.showStatus || '0',
        }
      })
    },
    // 编辑操作
    handleEditCollectionDialog(favoriteId) {
      this.editDialogVisible = true
      this.collectionList.forEach((item, index) => {
        if (item.favoriteId === favoriteId) {
          this.collectionForm = item
        }
      })
    },
    // 删除收藏夹dialog
    handleDelCollection(favoriteId) {
      this.delDialogVisible = true
      this.favoriteId = favoriteId
    },
    // 删除收藏夹dialog
    handleConfirmDelCollection() {
      deleteFavorite(this.favoriteId).then(res => {
        if (res.code === 200) {
          this.delDialogVisible = false
          this.$message.success(res.msg)
          this.initCollectionList()
        } else {
          this.delDialogVisible = true
          this.$message.error(res.msg)
        }
      })
    },
    // 更新收藏夹
    confirmUpdateCollection() {
      updateFavorite(this.collectionForm).then(res => {
        if (res.code === 200) {
          this.editDialogVisible = false
          this.$message.success(res.msg)
        } else {
          this.editDialogVisible = true
          this.$message.error(res.msg)
        }
      })
    },
    handleScroll(e) {
      if (e.target.scrollTop + e.target.clientHeight >= e.target.scrollHeight - 10) {
        if (this.dataNotMore) {
          return
        }
        //加载更多
        if (this.loadingData) {
          this.loadingIcon = true
          this.loadingData = false
          this.collectionQueryParams.pageNum += 1
          collectionInfoPage(this.collectionQueryParams).then(res => {
            if (res.code === 0 || res.code === 200) {
              const rawList = res.data?.favorite_list || res.data?.FavoriteList || res.rows || []
              if (rawList === null || rawList.length === 0) {
                this.dataNotMore = true
                this.loadingIcon = false
                this.loadingData = false
                return;
              }
              this.collectionList = this.collectionList.concat(this.formatCollectionList(rawList))
              this.loadingIcon = false
            } else {
              this.loadingIcon = false
            }
          })
          setTimeout(() => {
            // 流控
            this.loadingData = true
          }, 1000);
        }
      }
    },
  },
}
</script>

<style scoped>
.loading-container {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .loading-item {
    width: 33.33333%;
    padding: 0 0.5rem 1rem;
  }
}

.collection-edge {
  width: 33.333333%;
  padding: 0 0.5rem 1rem;

  .collection-container {
    padding: 1rem;
    border-radius: 0.5rem;
    box-shadow: rgba(0, 0, 0, 0.13) 0 2px 3px 0, rgba(0, 0, 0, 0.11) 0 1px 1px 0;
    transition: all 0.3s ease;
    background-color: var(--el-bg-color-page);

    .collection-video {

      .video-cover-list {
        width: 16%;

        .video-cover {
          width: 80px;
          height: 45px;
          border-radius: 6px;
        }

      }
    }
  }

}
</style>
