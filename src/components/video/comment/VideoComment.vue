<template>
  <div class="h-full relative flex flex-col bg-[#0f1015]">
    <el-scrollbar v-if="show" class="flex-1" wrap-style="padding-bottom: 80px;">
      <div class="video-comment-tree" v-for="(item, index) in videoCommentTree" :key="item.commentId">
        <div class="comment-container px-4 py-2">
          <div class="comment-info">
            <div class="user-info flex items-center mb-1">
              <el-avatar v-if="item.avatar" class="user-avatar w-8 h-8 border border-white/10" :src="item.avatar" />
              <el-avatar v-else class="user-avatar w-8 h-8 border border-white/10" :icon="UserFilled" />
              <div class="user-nickname ml-2">
                <p class="nickname one-line text-gray-300 text-sm font-bold">{{ item.nickName }}</p>
                <span class="text-gray-500 text-xs">{{ smartDateFormat(item.createTime) }}</span>
              </div>
            </div>
            <div class="comment-content pl-10">
              <p class="text-sm text-gray-200 mb-2">{{ item.content }}</p>
              <div class="flex justify-between items-center">
                <div class="comment-operate flex gap-4">
                  <div class="flex items-center cursor-pointer group"
                       @click="handleReplay(item.commentId, item.commentId, item.nickName)">
                    <span class="text-xs text-gray-500 group-hover:text-white">回复</span>
                  </div>
                  <div class="flex items-center cursor-pointer group" 
                       :class="{ 'pointer-events-none opacity-60': item._liking }"
                       @click="handleCommentLike(item)">
                    <svg :width="14" :height="14" viewBox="0 0 24 24" 
                         :fill="item.isLiked ? '#FE2C55' : 'none'" 
                         :stroke="item.isLiked ? '#FE2C55' : '#6B7280'" 
                         stroke-width="2" 
                         class="transition-all duration-200 group-hover:stroke-white"
                         :class="{ 'like-bounce': item._justLiked }">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    <span class="text-xs ml-1 transition-colors duration-200" :class="item.isLiked ? 'text-[#FE2C55]' : 'text-gray-500 group-hover:text-white'">{{ item.likeCount || 0 }}</span>
                  </div>
                </div>
                <div class="flex items-center cursor-pointer" v-if="item.userId === user.userId">
                  <el-popconfirm
                      confirm-button-text="确认"
                      cancel-button-text="取消"
                      title="删除这条评论？"
                      @confirm="handleDelConfirm(item.commentId)">
                    <template #reference>
                      <el-icon class="text-gray-600 hover:text-red-500"><Delete /></el-icon>
                    </template>
                  </el-popconfirm>
                </div>
              </div>
            </div>
            
            <!-- Children Comments (二级评论) -->
            <div class="comment-children pl-10 mt-2 space-y-2" v-if="item.children && item.children.length > 0">
              <div class="comment-container" v-for="(child, cIndex) in item.children" :key="child.commentId">
                <div class="user-info flex items-center mb-1">
                  <el-avatar v-if="child.avatar" class="user-avatar w-6 h-6 border border-white/10" :src="child.avatar" :size="24" />
                  <el-avatar v-else class="user-avatar w-6 h-6 border border-white/10" :icon="UserFilled" :size="24" />
                  <div class="user-nickname ml-2">
                    <p class="nickname one-line text-gray-300 text-xs font-bold">
                      {{ child.nickName }}
                      <span class="text-blue-400 ml-1" v-if="child.replayUserNickName">@{{ child.replayUserNickName }}</span>
                    </p>
                    <span class="text-gray-500 text-[10px]">{{ smartDateFormat(child.createTime) }}</span>
                  </div>
                </div>
                <div class="comment-content pl-8">
                  <p class="text-xs text-gray-300 mb-1">{{ child.content }}</p>
                  <div class="flex justify-between items-center">
                    <div class="comment-operate flex gap-3">
                      <div class="flex items-center cursor-pointer group"
                           @click="handleReplay(child.commentId, item.commentId, child.nickName)">
                        <span class="text-[10px] text-gray-500 group-hover:text-white">回复</span>
                      </div>
                      <div class="flex items-center cursor-pointer group"
                           :class="{ 'pointer-events-none opacity-60': child._liking }"
                           @click="handleCommentLike(child)">
                        <svg :width="12" :height="12" viewBox="0 0 24 24" 
                             :fill="child.isLiked ? '#FE2C55' : 'none'" 
                             :stroke="child.isLiked ? '#FE2C55' : '#6B7280'" 
                             stroke-width="2" 
                             class="transition-all duration-200 group-hover:stroke-white"
                             :class="{ 'like-bounce': child._justLiked }">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                        <span class="text-[10px] ml-1 transition-colors duration-200" :class="child.isLiked ? 'text-[#FE2C55]' : 'text-gray-500 group-hover:text-white'">{{ child.likeCount || 0 }}</span>
                      </div>
                    </div>
                    <div class="flex items-center cursor-pointer" v-if="child.userId === user.userId">
                      <el-popconfirm
                          confirm-button-text="确认"
                          cancel-button-text="取消"
                          title="删除这条回复？"
                          @confirm="handleDelConfirm(child.commentId)">
                        <template #reference>
                          <el-icon class="text-gray-600 hover:text-red-500" :size="12"><Delete /></el-icon>
                        </template>
                      </el-popconfirm>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 展开/收起子评论 -->
            <div class="pl-10 mt-1" v-if="item.childCount > 0">
              <span v-if="!item._childrenLoaded" 
                    class="text-xs text-blue-400 cursor-pointer hover:text-blue-300"
                    @click="loadChildComments(item)">
                展开 {{ item.childCount }} 条回复
              </span>
              <span v-else-if="item.children && item.children.length > 0"
                    class="text-xs text-gray-500 cursor-pointer hover:text-gray-400"
                    @click="collapseChildComments(item)">
                收起回复
              </span>
            </div>

          </div>
        </div>
      </div>
      <el-empty v-show="commentTotal<=0" description="暂无评论" :image-size="60" />
      <div class="p-4 flex justify-center" v-show="commentTotal>0">
         <el-pagination 
             small
             background
             layout="prev, pager, next"
             :total="commentTotal"
             :page-size="commentQueryParams.pageSize"
             :current-page="commentQueryParams.pageNum"
             @current-change="handleCurrentChange"/>
      </div>
    </el-scrollbar>
    
    <div class="comment-input-area absolute bottom-0 left-0 w-full p-4 bg-[#0f1015] border-t border-white/5 z-20">
      <el-input
          v-model="commentInput"
          clearable
          maxlength="100"
          show-word-limit
          @keyup.enter="handleCommentClick"
          placeholder="添加评论..."
          class="custom-input">
        <template #prepend v-if="replayVisible">
          <div class="flex items-center cursor-pointer" @click="handleCancelReplay">
             <span class="text-xs text-gray-400 mr-1">回复</span>
             <span class="text-xs text-blue-400 max-w-[80px] truncate">@{{ replayNickName }}</span>
             <el-icon class="ml-1 text-gray-500 hover:text-white"><Close /></el-icon>
          </div>
        </template>
        <template #append>
          <el-button @click="handleCommentClick">
            <el-icon :color="'#FE2C55'"><Position /></el-icon>
          </el-button>
        </template>
      </el-input>
    </div>
  </div>
</template>

<script>
import { addVideoComment, commentReplyList, deleteVideoComment, likeComment, videoCommentPageList } from "@/api/behave.js";
import { userInfoX } from "@/store/userInfoX";
import { ChromeFilled, Close, Delete, DeleteFilled, InfoFilled, Position, UserFilled } from "@element-plus/icons-vue";

export default {
  name: "VideoComment",
  components: {ChromeFilled, DeleteFilled, Delete, Close, Position},
  computed: {
    InfoFilled() {
      return InfoFilled
    },
    ChromeFilled() {
      return ChromeFilled
    },
    UserFilled() {
      return UserFilled
    }
  },
  props: {
    show: {
      type: Boolean,
      default() {
        return false;
      },
    },
    videoId: {
      type: [String, Number],
      default() {
        return '';
      }
    }
  },
  watch: {
    // Watch for videoId changes and reload comments
    videoId: {
      handler(newVal, oldVal) {
        if (newVal && newVal !== oldVal) {
          this.getCommentList()
        }
      },
      immediate: false
    }
  },
  data() {
    return {
      commentInput: '',
      // 视频评论查询参数
      commentQueryParams: {
        pageNum: 1,
        pageSize: 10,
        videoId: undefined,
      },
      commentDTO: {
        videoId: this.videoId,
        parentId: 0,
        originId: 0,
        content: ""
      },
      commentTotal: 0,
      videoCommentTree: [],
      replayVisible: false,
      replayNickName: '',
      replayCommentId: '', // 待回复评论id
      user: userInfoX().userInfo,
    }
  },
  emits: ['emitUpdateVideoCommentNum', 'emitCommentTotal'],
  created() {
    this.getCommentList()
  },
  mounted() {
  },
  methods: {
    // Transform backend snake_case fields to frontend camelCase
    transformComment(comment) {
      return {
        commentId: comment.comment_id || comment.commentId,
        userId: comment.user_id || comment.userId,
        videoId: comment.video_id || comment.videoId,
        parentId: comment.parent_id || comment.parentId,
        likeCount: comment.like_count || comment.likeCount || 0,
        childCount: comment.child_count || comment.childCount || 0,
        content: comment.content,
        createTime: comment.created_at || comment.createTime,
        updateTime: comment.updated_at || comment.updateTime,
        replyToCommentId: comment.reply_to_comment_id || comment.replyToCommentId,
        // User info from backend
        avatar: comment.avatar_url || comment.avatar || comment.user_avatar || '',
        nickName: comment.user_name || comment.nick_name || comment.nickName || comment.username || '用户' + (comment.user_id || comment.userId || ''),
        // Reply to user info
        replyUserId: comment.reply_to_user_id || comment.replyUserId,
        replayUserNickName: comment.reply_to_user_name || comment.replayUserNickName || '',
        // Like status
        isLiked: comment.is_liked || comment.isLiked || false,
        // 点赞状态控制
        _liking: false,       // 是否正在请求中（防重复点击）
        _justLiked: false,    // 刚点赞动画标记
        // 子评论相关
        children: [],
        _childrenLoaded: false,
      }
    },
    getCommentList() {
      // Ensure videoId is valid before making the request
      if (!this.videoId && this.videoId !== 0) {
        console.warn('VideoComment: videoId is not set, skipping comment fetch')
        this.videoCommentTree = []
        this.commentTotal = 0
        return
      }
      this.commentQueryParams.videoId = this.videoId
      videoCommentPageList(this.commentQueryParams).then(res => {
        this.drawer = true
        const rawItems = res.rows || res.data?.items || res.data?.list || [];
        // Transform snake_case to camelCase，根评论不含children
        this.videoCommentTree = rawItems.map(item => this.transformComment(item));
        this.commentTotal = res.total || res.data?.total || this.videoCommentTree.length || 0;
        this.$emit('emitCommentTotal', this.videoId, this.commentTotal)
      }).catch(err => {
        console.log('Comment list fetch failed:', err)
        this.videoCommentTree = []
        this.commentTotal = 0
      })
    },
    // 加载子评论
    loadChildComments(parentComment) {
      commentReplyList({ commentId: parentComment.commentId }).then(res => {
        const rawItems = res.rows || res.data?.items || res.data?.list || [];
        parentComment.children = rawItems.map(item => this.transformComment(item));
        parentComment._childrenLoaded = true;
      }).catch(err => {
        console.log('Load child comments failed:', err)
      })
    },
    // 收起子评论
    collapseChildComments(parentComment) {
      parentComment.children = [];
      parentComment._childrenLoaded = false;
    },
    handleCurrentChange(v) {
      this.commentQueryParams.pageNum = v
      this.getCommentList()
    },
    handleSizeChange(v) {
      this.commentQueryParams.pageSize = v
      this.getCommentList()
    },
    // 点击评论
    handleCommentClick() {
      if (!this.commentInput || !this.commentInput.trim()) {
        this.$message.warning('请输入评论内容')
        return
      }
      this.commentDTO.videoId = this.videoId
      this.commentDTO.content = this.commentInput
      addVideoComment(this.commentDTO).then(res => {
        if (res.code === 0 || res.code === 200) {
          this.getCommentList();
          this.$message.success('评论成功')
          this.commentInput = null
          this.commentDTO.parentId = null
          this.commentDTO.originId = null
          this.commentDTO.content = null
          this.replayVisible = false
          // 通知父组件更新视频数组评论数量
          this.$emit("emitUpdateVideoCommentNum", this.videoId)
        } else {
          this.$message.error(res.message || res.msg || '评论失败')
        }
      }).catch(err => {
        this.$message.error('评论失败，请检查网络连接')
      })
    },
    // 回复祖先评论
    handleReplay(parentId, originId, nickname) {
      this.replayVisible = true
      this.replayNickName = nickname
      console.log(parentId + "=" + originId + "=" + nickname)
      this.commentDTO.parentId = parentId
      this.commentDTO.originId = originId
    },
    // 删除我的评论
    handleDelConfirm(commentId) {
      console.log(commentId)
      deleteVideoComment(commentId).then(res => {
        if (res.code === 0 || res.code === 200) {
          this.$message.success('删除成功')
          this.getCommentList()
        } else {
          this.$message.error('删除失败')
        }
      }).catch(err => {
        this.$message.error('删除失败，请检查网络连接')
      })
    },
    // 评论点赞（防重复点击 + 使用后端返回值）
    handleCommentLike(comment) {
      // 防止重复点击：如果正在请求中，直接返回
      if (comment._liking) return

      const actionType = comment.isLiked ? 2 : 1  // 1=点赞, 2=取消点赞
      comment._liking = true

      likeComment(comment.commentId, actionType).then(res => {
        if (res.code === 0 || res.code === 200) {
          // 优先使用后端返回的状态
          const respData = res.data || res
          if (respData.is_liked !== undefined) {
            comment.isLiked = respData.is_liked
          } else {
            comment.isLiked = !comment.isLiked
          }
          if (respData.like_count !== undefined) {
            comment.likeCount = respData.like_count
          } else {
            comment.likeCount = comment.isLiked 
              ? (comment.likeCount || 0) + 1 
              : Math.max(0, (comment.likeCount || 0) - 1)
          }
          // 点赞时触发弹跳动画
          if (comment.isLiked) {
            comment._justLiked = true
            setTimeout(() => { comment._justLiked = false }, 400)
          }
        } else {
          this.$message.error(res.message || res.msg || '操作失败')
        }
      }).catch(err => {
        this.$message.error('点赞失败，请检查网络连接')
      }).finally(() => {
        comment._liking = false
      })
    },
    handleDelCancel() {
    },
    handleCancelReplay() {
      this.commentDTO.parentId = null
      this.commentDTO.originId = null
      this.replayVisible = false
    }

  },
}

</script>

<style scoped>
/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Input Styles Override */
:deep(.custom-input .el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.1);
  box-shadow: none;
  border-radius: 20px;
  padding-left: 15px;
}
:deep(.custom-input .el-input__inner) {
  color: white;
}
:deep(.custom-input .el-input-group__append) {
  background-color: transparent;
  box-shadow: none;
  padding: 0 10px;
}
:deep(.custom-input .el-input-group__prepend) {
  background-color: transparent;
  box-shadow: none;
  padding: 0 10px;
}

/* Like bounce animation */
@keyframes like-bounce {
  0% { transform: scale(1); }
  25% { transform: scale(1.4); }
  50% { transform: scale(0.9); }
  75% { transform: scale(1.15); }
  100% { transform: scale(1); }
}
.like-bounce {
  animation: like-bounce 0.4s ease-in-out;
}
</style>
