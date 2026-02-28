<template>
  <div class="favorite-collection-container">
    <div class="collection-grid" v-loading="loadingIcon">
      <el-skeleton class="w100" :loading="loading" animated>
        <template #template>
          <div class="loading-grid">
            <div class="loading-item" v-for="i in 3" :key="i">
              <el-skeleton-item variant="image" class="w100" style="height: 140px; border-radius: 8px 8px 0 0;"/>
              <div style="padding: 12px;">
                <el-skeleton-item variant="h3" class="w100" style="margin-bottom: 8px;"/>
                <el-skeleton-item variant="text" style="width: 60%;"/>
              </div>
            </div>
          </div>
        </template>
        <template #default>
          <div class="collection-card cp" v-for="(item,index) in collectionList" :key="item.favoriteId" @click="handleCollectionClick(item)">
            <!-- 封面区域 -->
            <div class="card-cover">
              <el-image v-if="item.coverUrl" class="cover-img" :src="item.coverUrl" fit="cover" lazy/>
              <div v-else class="cover-placeholder">
                <el-icon :size="40" color="#c0c4cc"><Film /></el-icon>
              </div>
              <!-- 视频数量角标 -->
              <div class="card-count">
                <el-icon :size="14" color="#fff"><Film /></el-icon>
                <span>{{ item.videoCount }}</span>
              </div>
              <!-- 公开/私密标识 -->
              <div class="card-privacy" :class="item.showStatus === '0' ? 'public' : 'private'">
                <el-icon :size="12">
                  <View v-if="item.showStatus === '0'"/>
                  <Hide v-else/>
                </el-icon>
                <span>{{ item.showStatus === '0' ? '公开' : '私密' }}</span>
              </div>
              <!-- 操作按钮 -->
              <div class="card-actions" @click.stop>
                <el-popover placement="bottom-end" trigger="hover" popper-style="padding: 8px; min-width: 100px;">
                  <template #reference>
                    <div class="action-btn">
                      <el-icon :size="18" color="#fff"><MoreFilled/></el-icon>
                    </div>
                  </template>
                  <template #default>
                    <div class="action-item" @click="handleEditCollectionDialog(item.favoriteId)">
                      <el-icon><Edit/></el-icon>
                      <span>编辑</span>
                    </div>
                    <div class="action-item danger" @click="handleDelCollection(item.favoriteId)">
                      <el-icon><Delete/></el-icon>
                      <span>删除</span>
                    </div>
                  </template>
                </el-popover>
              </div>
            </div>
            <!-- 信息区域 -->
            <div class="card-info">
              <div class="card-title">{{ item.title }}</div>
              <div class="card-desc" v-if="item.description">{{ item.description }}</div>
              <div class="card-desc" v-else style="color: #ccc; font-style: italic;">暂无简介</div>
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
import {Close, Delete, Edit, Film, Hide, InfoFilled, MoreFilled, UserFilled, View} from "@element-plus/icons-vue";

export default {
  name: "UserFavoriteCollection",
  components: {MoreFilled, Film, View, Hide, Edit, Delete},
  emits: ['collection-click'],  // 声明自定义事件
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
        // Refactored-TikTok backend uses code 10000 for success
        if (res.code === 10000 || res.code === 0 || res.code === 200) {
          // 后端返回格式: { favorite_list: [...], total_count: number }
          const rawList = res.data?.favorite_list || res.data?.FavoriteList || res.data?.list || res.rows || []
          this.collectionList = this.formatCollectionList(rawList)
          this.collectionTotal = res.data?.total_count || res.data?.TotalCount || res.total || rawList.length || 0
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
        const videoCount = item.video_count || item.VideoCount || item.videoCount || 0
        
        // 获取封面列表
        let videoCoverList = item.video_cover_list || item.VideoCoverList || item.videoCoverList || []
        
        // 如果没有封面列表但有收藏夹封面，使用收藏夹封面
        if (videoCoverList.length === 0) {
          const coverUrl = item.cover_url || item.CoverUrl || item.coverUrl || ''
          if (coverUrl) {
            videoCoverList = [coverUrl]
          }
        }
        
        // 只有在有视频时才填充占位符，最多显示6个
        let paddedCovers = []
        if (videoCount > 0) {
          const maxCovers = Math.min(videoCount, 6)
          paddedCovers = [...videoCoverList.slice(0, maxCovers)]
          // 填充占位符
          while (paddedCovers.length < maxCovers) {
            paddedCovers.push('')
          }
        }
        
        // 优先取 name，注意空字符串需要用 !== undefined 判断
        const rawName = item.name !== undefined && item.name !== '' ? item.name
          : (item.Name !== undefined && item.Name !== '' ? item.Name
            : (item.title !== undefined && item.title !== '' ? item.title : '默认收藏夹'))
        
        return {
          favoriteId: favoriteId,
          title: rawName,
          description: item.description || item.Description || '',
          videoCount: videoCount,
          videoCoverList: paddedCovers,
          coverUrl: item.cover_url || item.CoverUrl || item.coverUrl || '',
          // is_public: true/false → switch active-value="0"(公开), inactive-value="1"(私密)
          showStatus: item.is_public ? '0' : '1',
        }
      })
    },
    // 点击收藏夹，跳转到收藏夹视频列表
    handleCollectionClick(item) {
      console.log('📁 [COLLECTION] 点击收藏夹:', item)
      // 通过 emit 事件或路由跳转到收藏夹详情
      this.$emit('collection-click', item)
      // 或者跳转路由（如果有专门的收藏夹详情页面）
      // this.$router.push({ path: '/favorite/detail', query: { favoriteId: item.favoriteId } })
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
        // Refactored-TikTok backend uses code 10000 for success
        if (res.code === 10000 || res.code === 0 || res.code === 200) {
          this.delDialogVisible = false
          this.$message.success('删除成功')
          this.initCollectionList()
        } else {
          this.delDialogVisible = true
          this.$message.error('删除失败')
        }
      }).catch(err => {
        console.error('删除收藏夹失败:', err)
        this.$message.error('删除收藏夹失败')
      })
    },
    // 更新收藏夹
    confirmUpdateCollection() {
      updateFavorite(this.collectionForm).then(res => {
        // Refactored-TikTok backend uses code 10000 for success
        if (res.code === 10000 || res.code === 0 || res.code === 200) {
          this.editDialogVisible = false
          this.$message.success('更新成功')
          // 刷新收藏夹列表
          this.initCollectionList()
        } else {
          this.editDialogVisible = true
          this.$message.error('更新失败')
        }
      }).catch(err => {
        console.error('更新收藏夹失败:', err)
        this.$message.error('更新收藏夹失败')
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
            // Refactored-TikTok backend uses code 10000 for success
            if (res.code === 10000 || res.code === 0 || res.code === 200) {
              const rawList = res.data?.favorite_list || res.data?.FavoriteList || res.data?.list || res.rows || []
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
.collection-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 16px;
  align-items: stretch;
  width: 100%;
}

.loading-grid {
  display: flex;
  gap: 16px;
  width: 100%;
}

.loading-grid .loading-item {
  width: calc(33.333% - 11px);
  border-radius: 8px;
  overflow: hidden;
  background: var(--el-bg-color-page);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.collection-card {
  width: calc(33.333% - 11px);
  border-radius: 10px;
  overflow: hidden;
  background: var(--el-bg-color-page);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.collection-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

/* 封面区域 */
.card-cover {
  position: relative;
  width: 100%;
  height: 150px;
  background: linear-gradient(135deg, #e8eaf0 0%, #d5d8e0 100%);
  overflow: hidden;
}

.card-cover .cover-img {
  width: 100%;
  height: 100%;
  display: block;
}

.card-cover .cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f2f5 0%, #e4e7ed 100%);
}

/* 视频数量角标 */
.card-count {
  position: absolute;
  bottom: 8px;
  left: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  backdrop-filter: blur(4px);
}

/* 公开/私密标识 */
.card-privacy {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  backdrop-filter: blur(4px);
}

.card-privacy.public {
  background: rgba(19, 206, 102, 0.8);
  color: #fff;
}

.card-privacy.private {
  background: rgba(255, 73, 73, 0.8);
  color: #fff;
}

/* 操作按钮 */
.card-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.collection-card:hover .card-actions {
  opacity: 1;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(4px);
  transition: background 0.2s;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

.action-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s;
}

.action-item:hover {
  background: var(--el-fill-color-light);
}

.action-item.danger {
  color: #f56c6c;
}

.action-item.danger:hover {
  background: #fef0f0;
}

/* 信息区域 */
.card-info {
  padding: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-desc {
  font-size: 12px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
