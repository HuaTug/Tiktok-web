<template>
  <div class="p10px">
    <el-form :model="videoForm" :rules="rules" ref="ruleForm" label-width="100px">
      <el-row>
        <el-col :lg="12" :xs="24">
          <el-form-item label="上传视频" prop="videoFile">
            <!-- 使用自定义上传，不依赖action -->
            <el-upload 
                class="video-uploader"
                :action="'#'"
                :auto-upload="false"
                :show-file-list="false"
                :limit="1"
                v-loading="loading"
                :on-change="handleVideoChange"
                :before-upload="beforeUploadVideo"
                accept="video/mp4,video/ogg,video/flv,video/avi,video/wmv,video/rmvb,video/mkv">
              <video v-if="videoPreviewUrl && !videoFlag"
                     :src="videoPreviewUrl"
                     class="video"
                     controls
              ></video>
              <div v-else-if="!videoPreviewUrl && !videoFlag"
                   class="el-icon-plus video-uploader-icon">
                <Plus style="width: 1em; height: 1em;"/>
                <div class="upload-text">点击上传视频</div>
              </div>
              <div v-if="videoFlag" class="upload-progress-container">
                <el-progress 
                    type="circle"
                    :percentage="videoUploadPercent"
                    :status="uploadStatus"
                    style="margin-top:30px;">
                </el-progress>
                <div class="upload-stage-text">{{ uploadStageText }}</div>
                <div v-if="chunkProgress" class="chunk-progress">
                  分片进度: {{ chunkProgress.current }}/{{ chunkProgress.total }}
                </div>
              </div>
            </el-upload>
            <div v-if="selectedFile" class="file-info">
              <span>{{ selectedFile.name }}</span>
              <span class="file-size">({{ formatFileSize(selectedFile.size) }})</span>
              <el-button type="danger" size="small" @click="clearSelectedFile" :disabled="loading">
                移除
              </el-button>
            </div>
          </el-form-item>
          <el-form-item label="视频封面" prop="coverImage" v-if="videoForm.coverImage">
            <div v-viewer>
              <img v-if="videoForm.coverImage"
                   :src="videoForm.coverImage"
                   class="video" alt="视频封面"/>
            </div>
          </el-form-item>
        </el-col>
        <el-col :lg="12" :xs="24">
          <el-form-item label="视频标题" prop="videoTitle">
            <el-input v-model="videoForm.videoTitle" maxlength="100" show-word-limit placeholder="请输入视频标题"></el-input>
          </el-form-item>
          <el-form-item label="视频分类" prop="categoryId">
            <el-radio-group v-model="videoForm.categoryId">
              <el-radio-button :label="item.id" v-for="item in categoryList" :key="item.id">{{ item.name }}</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="公开设置" prop="openSetting">
            <el-radio-group v-model="videoForm.openSetting">
              <el-radio-button :label="1">公开</el-radio-button>
              <el-radio-button :label="0">私密</el-radio-button>
              <el-radio-button :label="2">好友可见</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="视频标签" prop="videoTags">
            <el-tag v-for="item in videoTags"
                    :key="item.tag"
                    class="mx-1 mr-5r"
                    effect="dark"
                    round
                    closable
                    @close="handleTagClose(item)">
              {{ item.tag }}
            </el-tag>
            <el-input
                v-if="tagInputVisible"
                ref="RefTagInput"
                v-model="tagInputValue"
                class="ml-1 w100p"
                placeholder="输入标签后回车"
                @keyup.enter.native="handleInputConfirm"/>
            <el-button v-else class="button-new-tag ml-1" v-show="tagBtn" size="small" @click="showTagInput">
              + 标签
            </el-button>
          </el-form-item>
          <el-form-item label="视频简介" prop="videoDesc">
            <el-input type="textarea" v-model="videoForm.videoDesc" maxlength="200" show-word-limit :rows="4" placeholder="请输入视频简介"></el-input>
          </el-form-item>
          <div style="text-align: center">
            <el-button type="primary" @click="submitForm('ruleForm')" :loading="loading" :disabled="!selectedFile">
              {{ loading ? '上传中...' : '发布' }}
            </el-button>
            <el-button v-if="loading" type="danger" @click="cancelUpload">取消上传</el-button>
          </div>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
import { uploadVideoWithChunks, publishVideoCancelV2, videoCategory } from "@/api/video.js";
import { Plus } from "@element-plus/icons-vue";

export default {
  name: "PublishVideo",
  components: { Plus },
  data() {
    return {
      videoFlag: false,
      loading: false,
      videoUploadPercent: 0,
      uploadStatus: '', // '', 'success', 'exception'
      uploadStageText: '',
      chunkProgress: null,
      currentUploadUuid: null, // 当前上传会话UUID，用于取消上传
      selectedFile: null, // 选中的视频文件
      videoPreviewUrl: '', // 本地预览URL

      videoForm: {
        publishType: '0',
        videoTitle: '',
        videoUrl: '',
        categoryId: undefined,
        coverImage: '',
        videoDesc: '',
        videoTags: [],
        openSetting: 1, // 默认公开
        positionFlag: '0',
        position: {},
      },
      categoryList: [], // 视频分类集合
      rules: {
        videoTitle: [
          { required: true, message: '请输入视频标题', trigger: 'blur' },
          { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
        ],
        videoDesc: [
          { required: true, message: '请填写视频简介', trigger: 'blur' },
          { min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur' }
        ]
      },
      // 视频标签对象
      videoTags: [],
      videoTagIds: [],
      videoTag: {
        tagId: null,
        tag: ''
      },
      tagInputVisible: false,
      tagInputValue: undefined,
      tagBtn: true
    }
  },
  created() {
    this.getVideoCategory()
  },
  beforeUnmount() {
    // 组件销毁时释放预览URL
    if (this.videoPreviewUrl) {
      URL.revokeObjectURL(this.videoPreviewUrl)
    }
  },
  methods: {
    getVideoCategory() {
      videoCategory().then(res => {
        if (res.code === 0 || res.code === 200) {
          this.categoryList = res.data || []
        }
      }).catch(err => console.log('Video category fetch failed'))
    },

    // 格式化文件大小
    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    // 验证视频格式
    beforeUploadVideo(file) {
      const validTypes = [
        'video/mp4',
        'video/ogg',
        'video/flv',
        'video/avi',
        'video/wmv',
        'video/rmvb',
        'video/mkv',
        'video/webm',
        'video/quicktime'
      ]
      if (validTypes.indexOf(file.type) === -1) {
        this.$message.error('请上传正确的视频格式（支持 mp4, ogg, flv, avi, wmv, rmvb, mkv, webm）')
        return false
      }
      // 检查文件大小（最大2GB）
      const maxSize = 2 * 1024 * 1024 * 1024
      if (file.size > maxSize) {
        this.$message.error('视频文件大小不能超过 2GB')
        return false
      }
      return true
    },

    // 选择视频文件
    handleVideoChange(file) {
      if (!this.beforeUploadVideo(file.raw)) {
        return
      }
      
      // 释放之前的预览URL
      if (this.videoPreviewUrl) {
        URL.revokeObjectURL(this.videoPreviewUrl)
      }
      
      this.selectedFile = file.raw
      this.videoPreviewUrl = URL.createObjectURL(file.raw)
      
      // 自动填充标题（如果为空）
      if (!this.videoForm.videoTitle && file.name) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
        this.videoForm.videoTitle = nameWithoutExt.substring(0, 100)
      }
    },

    // 清除选中的文件
    clearSelectedFile() {
      if (this.videoPreviewUrl) {
        URL.revokeObjectURL(this.videoPreviewUrl)
      }
      this.selectedFile = null
      this.videoPreviewUrl = ''
      this.videoForm.coverImage = ''
    },

    // 提交表单 - 使用V2分片上传
    async submitForm(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (!valid) {
          this.$message.error('请填写完整信息')
          return
        }

        if (!this.selectedFile) {
          this.$message.error('请先选择要上传的视频文件')
          return
        }

        this.loading = true
        this.videoFlag = true
        this.videoUploadPercent = 0
        this.uploadStatus = ''
        this.uploadStageText = '准备上传...'
        this.chunkProgress = null

        try {
          const result = await uploadVideoWithChunks({
            file: this.selectedFile,
            title: this.videoForm.videoTitle,
            description: this.videoForm.videoDesc,
            labName: this.videoTags.map(t => t.tag).join(','),
            category: this.videoForm.categoryId ? String(this.videoForm.categoryId) : '',
            open: this.videoForm.openSetting,
            onProgress: (percent, stage) => {
              this.videoUploadPercent = percent
              this.updateUploadStageText(stage)
            },
            onChunkComplete: (current, total) => {
              this.chunkProgress = { current, total }
            }
          })

          if (result.success) {
            this.uploadStatus = 'success'
            this.uploadStageText = '上传完成！'
            this.videoForm.videoUrl = result.videoUrl || ''
            this.videoForm.coverImage = result.coverUrl || ''
            
            this.$message.success('视频发布成功！')
            
            // 延迟重置表单
            setTimeout(() => {
              this.resetForm()
            }, 2000)
          }
        } catch (error) {
          console.error('上传失败:', error)
          this.uploadStatus = 'exception'
          this.uploadStageText = '上传失败'
          this.$message.error(error.message || '视频上传失败，请重试')
        } finally {
          this.loading = false
          this.videoFlag = false
          this.currentUploadUuid = null
        }
      })
    },

    // 更新上传阶段文本
    updateUploadStageText(stage) {
      const stageTexts = {
        'starting': '初始化上传...',
        'uploading': '正在上传视频分片...',
        'completing': '正在处理视频...',
        'completed': '上传完成！'
      }
      this.uploadStageText = stageTexts[stage] || '处理中...'
    },

    // 取消上传
    async cancelUpload() {
      if (this.currentUploadUuid) {
        try {
          await publishVideoCancelV2({ uuid: this.currentUploadUuid })
          this.$message.info('已取消上传')
        } catch (error) {
          console.error('取消上传失败:', error)
        }
      }
      
      this.loading = false
      this.videoFlag = false
      this.videoUploadPercent = 0
      this.uploadStatus = ''
      this.uploadStageText = ''
      this.chunkProgress = null
      this.currentUploadUuid = null
    },

    // 重置表单
    resetForm() {
      this.clearSelectedFile()
      this.videoForm = {
        publishType: '0',
        videoTitle: '',
        videoUrl: '',
        categoryId: undefined,
        coverImage: '',
        videoDesc: '',
        videoTags: [],
        openSetting: 1,
        positionFlag: '0',
        position: {},
      }
      this.videoTags = []
      this.videoTagIds = []
      this.videoUploadPercent = 0
      this.uploadStatus = ''
      this.uploadStageText = ''
      this.chunkProgress = null
    },

    // 添加视频标签（本地处理，不再调用后端）
    handleInputConfirm() {
      if (this.videoTags.length >= 5) {
        this.tagInputVisible = false
        this.tagBtn = false
        this.$message.warning('最多添加5个标签')
        return
      }
      
      const tagValue = this.tagInputValue?.trim()
      if (!tagValue) {
        this.tagInputVisible = false
        this.tagInputValue = null
        return
      }

      // 检查标签是否已存在
      if (this.videoTags.some(t => t.tag === tagValue)) {
        this.$message.warning('标签已存在')
        this.tagInputValue = null
        return
      }

      const newTag = {
        tagId: Date.now(), // 使用时间戳作为临时ID
        tag: tagValue
      }
      
      this.videoTags.push(newTag)
      this.videoTagIds.push(newTag.tagId)
      
      this.tagInputVisible = false
      this.tagInputValue = null
      
      if (this.videoTags.length >= 5) {
        this.tagBtn = false
      }
    },

    // 展示标签输入框
    showTagInput() {
      this.tagInputVisible = true
      this.$nextTick(() => {
        this.$refs.RefTagInput?.focus()
      })
    },

    // 删除标签
    handleTagClose(item) {
      const tagIndex = this.videoTags.findIndex(t => t.tagId === item.tagId)
      if (tagIndex > -1) {
        this.videoTags.splice(tagIndex, 1)
        this.videoTagIds.splice(tagIndex, 1)
      }
      if (this.videoTags.length < 5) {
        this.tagBtn = true
      }
    }
  }
}
</script>

<style scoped>
.video-uploader {
  width: 100%;
}

.video-uploader-icon {
  border: 2px dashed darkblue !important;
  border-radius: 0.5rem;
  font-size: 28px;
  color: black;
  width: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s;
}

.video-uploader-icon:hover {
  border-color: #d83f3f !important;
}

.upload-text {
  font-size: 14px;
  color: #666;
  margin-top: 10px;
}

.video-uploader .el-upload:hover {
  border: 2px dashed #d83f3f !important;
}

.video {
  width: 320px;
  height: 200px;
  border-radius: 1rem;
  display: block;
  object-fit: cover;
}

.upload-progress-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.upload-stage-text {
  margin-top: 15px;
  font-size: 14px;
  color: #666;
}

.chunk-progress {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}

.file-info {
  margin-top: 10px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-info .file-size {
  color: #909399;
  font-size: 12px;
}

.file-info .el-button {
  margin-left: auto;
}

.button-new-tag {
  margin-left: 10px;
}

.mr-5r {
  margin-right: 5px;
}

.w100p {
  width: 100px;
}

.ml-1 {
  margin-left: 4px;
}

.mx-1 {
  margin-left: 4px;
  margin-right: 4px;
}
</style>
