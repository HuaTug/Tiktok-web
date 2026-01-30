<template>
  <div class="h-full relative flex flex-col bg-[#0f1015]">
    <el-scrollbar v-if="show" class="flex-1" wrap-style="padding-bottom: 80px;">
      <div class="video-comment-tree" v-for="(item, index) in videoCommentTree" :key="item.commentId">
        <div class="comment-container px-4 py-2">
          <div class="comment-info">
            <div class="user-info flex items-center mb-1">
              <el-image class="user-avatar w-8 h-8 rounded-full border border-white/10" :src="item.avatar" alt="" lazy></el-image>
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
                       @click="handleReplay(item.commentId,item.commentId,item.nickName)">
                    <span class="text-xs text-gray-500 group-hover:text-white">Reply</span>
                  </div>
                  <div class="flex items-center cursor-pointer group" @click="handleCommentLike(item)">
                    <el-icon :size="14" :color="item.isLiked ? '#FE2C55' : '#6B7280'"><component :is="item.isLiked ? 'StarFilled' : 'Star'" /></el-icon>
                    <span class="text-xs text-gray-500 ml-1 group-hover:text-white">{{ item.likeCount || 0 }}</span>
                  </div>
                </div>
                <div class="flex items-center cursor-pointer" v-if="item.userId === user.userId">
                  <el-popconfirm
                      confirm-button-text="Yes"
                      cancel-button-text="No"
                      title="Delete this comment?"
                      @confirm="handleDelConfirm(item.commentId)">
                    <template #reference>
                      <el-icon class="text-gray-600 hover:text-red-500"><Delete /></el-icon>
                    </template>
                  </el-popconfirm>
                </div>
              </div>
            </div>
            
            <!-- Children Comments -->
            <div class="comment-children pl-10 mt-2 space-y-2" v-if="item.children && item.children.length > 0">
              <div class="comment-container" v-for="(child, index) in item.children" :key="child.commentId">
                <div class="user-info flex items-center mb-1">
                  <el-image class="user-avatar w-6 h-6 rounded-full border border-white/10" :src="child.avatar" lazy></el-image>
                  <div class="user-nickname ml-2">
                    <p class="nickname one-line text-gray-300 text-xs font-bold">{{ child.nickName }}
                      <span class="text-blue-400 ml-1" v-if="child.replayUserId != null">@{{ child.replayUserNickName }}</span>
                    </p>
                    <span class="text-gray-500 text-[10px]">{{ smartDateFormat(child.createTime) }}</span>
                  </div>
                </div>
                <div class="comment-content pl-8">
                  <p class="text-xs text-gray-300 mb-1">{{ child.content }}</p>
                  <div class="flex justify-between items-center">
                    <div class="comment-operate flex gap-3">
                      <div class="flex items-center cursor-pointer group"
                           @click="handleReplay(child.commentId,item.commentId,child.nickName)">
                        <span class="text-[10px] text-gray-500 group-hover:text-white">Reply</span>
                      </div>
                      <div class="flex items-center cursor-pointer group" @click="handleCommentLike(child)">
                        <el-icon :size="12" :color="child.isLiked ? '#FE2C55' : '#6B7280'"><component :is="child.isLiked ? 'StarFilled' : 'Star'" /></el-icon>
                        <span class="text-[10px] text-gray-500 ml-1 group-hover:text-white">{{ child.likeCount || 0 }}</span>
                      </div>
                    </div>
                    <div class="flex items-center cursor-pointer" v-if="child.userId === user.userId">
                      <el-popconfirm
                          confirm-button-text="Yes"
                          cancel-button-text="No"
                          title="Delete?"
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
          </div>
        </div>
      </div>
      <el-empty v-show="commentTotal<=0" description="No comments yet" :image-size="60" />
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
          placeholder="Add a comment..."
          class="custom-input">
        <template #prepend v-if="replayVisible">
          <div class="flex items-center cursor-pointer" @click="handleCancelReplay">
             <span class="text-xs text-gray-400 mr-1">Replying to</span>
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
import { addVideoComment, deleteVideoComment, likeComment, videoCommentPageList } from "@/api/behave.js";
import { userInfoX } from "@/store/userInfoX";
import { ChromeFilled, Close, Delete, DeleteFilled, InfoFilled, Position, Star, StarFilled } from "@element-plus/icons-vue";

export default {
  name: "VideoComment",
  components: {ChromeFilled, DeleteFilled, Star, StarFilled, Delete, Close, Position},
  computed: {
    InfoFilled() {
      return InfoFilled
    },
    ChromeFilled() {
      return ChromeFilled
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
      type: String,
      default() {
        return '';
      }
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
  emits: ['emitUpdateVideoCommentNum'],
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
        // User info from backend (new fields)
        avatar: comment.avatar_url || comment.avatar || comment.user_avatar || '/default-avatar.png',
        nickName: comment.user_name || comment.nick_name || comment.nickName || comment.username || '用户' + (comment.user_id || comment.userId || ''),
        // Reply to user info
        replyUserId: comment.reply_to_user_id || comment.replyUserId,
        replayUserNickName: comment.reply_to_user_name || comment.replayUserNickName || '',
        // Like status
        isLiked: comment.is_liked || comment.isLiked || false,
        children: comment.children ? comment.children.map(child => this.transformComment(child)) : []
      }
    },
    getCommentList() {
      this.commentQueryParams.videoId = this.videoId
      videoCommentPageList(this.commentQueryParams).then(res => {
        this.drawer = true
        // Refactored-TikTok backend uses code 10000 for success and data.items field
        const rawItems = res.rows || res.data?.items || res.data?.list || [];
        // Transform snake_case to camelCase
        this.videoCommentTree = rawItems.map(item => this.transformComment(item));
        this.commentTotal = res.total || res.data?.total || this.videoCommentTree.length || 0;
      }).catch(err => {
        console.log('Comment list fetch failed:', err)
        this.videoCommentTree = []
        this.commentTotal = 0
      })
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
      this.commentDTO.content = this.commentInput
      addVideoComment(this.commentDTO).then(res => {
        // Refactored-TikTok backend uses code 0 for success
        if (res.code === 0 || res.code === 200) {
          this.getCommentList();
          this.$message.success(res.message || res.msg || '评论成功')
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
        // Refactored-TikTok backend uses code 0 for success
        if (res.code === 0 || res.code === 200) {
          this.$message.success(res.message || res.msg || '删除成功')
          this.getCommentList()
        } else {
          this.$message.error(res.message || res.msg || '删除失败')
        }
      }).catch(err => {
        this.$message.error('删除失败，请检查网络连接')
      })
    },
    // 评论点赞
    handleCommentLike(comment) {
      const actionType = comment.isLiked ? 2 : 1  // 1=点赞, 2=取消点赞
      likeComment(comment.commentId, actionType).then(res => {
        if (res.code === 0 || res.code === 200) {
          // 更新本地状态
          comment.isLiked = !comment.isLiked
          comment.likeCount = comment.isLiked 
            ? (comment.likeCount || 0) + 1 
            : Math.max(0, (comment.likeCount || 0) - 1)
        } else {
          this.$message.error(res.message || res.msg || '操作失败')
        }
      }).catch(err => {
        this.$message.error('点赞失败，请检查网络连接')
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
</style>
