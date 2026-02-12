<template>
  <div class="upload-page">
    <div class="upload-container">
      <h2 class="page-title">上传视频</h2>
      
      <!-- 上传区域 -->
      <div class="upload-section">
        <div 
          class="upload-area" 
          :class="{ 'is-dragover': isDragover, 'has-file': selectedFile }"
          @dragover.prevent="isDragover = true"
          @dragleave.prevent="isDragover = false"
          @drop.prevent="handleDrop"
          @click="triggerFileSelect"
        >
          <!-- 上传中状态 -->
          <div v-if="uploading" class="upload-progress">
            <el-progress type="circle" :percentage="uploadPercent" :status="uploadStatus" :width="120"></el-progress>
            <p class="stage-text">{{ stageText }}</p>
            <p v-if="chunkInfo" class="chunk-text">分片进度: {{ chunkInfo.current }} / {{ chunkInfo.total }}</p>
            <el-button type="danger" size="small" @click.stop="cancelUpload" style="margin-top: 15px;">取消上传</el-button>
          </div>
          
          <!-- 已选择文件预览 -->
          <div v-else-if="selectedFile" class="file-preview">
            <video v-if="previewUrl" :src="previewUrl" class="preview-video" controls></video>
            <div class="file-info">
              <p class="file-name">{{ selectedFile.name }}</p>
              <p class="file-size">{{ formatSize(selectedFile.size) }}</p>
              <el-button type="danger" size="small" @click.stop="clearFile">移除文件</el-button>
            </div>
          </div>
          
          <!-- 默认上传提示 -->
          <div v-else class="upload-placeholder">
            <i class="upload-icon">📹</i>
            <p class="upload-title">点击或拖拽视频文件到此处</p>
            <p class="upload-hint">支持 MP4, AVI, MKV, MOV 等格式，最大 2GB</p>
          </div>
          
          <input 
            ref="fileInput" 
            type="file" 
            accept="video/*" 
            style="display: none;" 
            @change="handleFileSelect"
          />
        </div>
      </div>

      <!-- 视频信息表单 -->
      <div class="form-section">
        <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" label-position="top">
          <el-form-item label="视频标题" prop="title">
            <el-input 
              v-model="form.title" 
              placeholder="请输入视频标题" 
              maxlength="100" 
              show-word-limit
            ></el-input>
          </el-form-item>

          <el-form-item label="视频简介" prop="description">
            <el-input 
              type="textarea" 
              v-model="form.description" 
              placeholder="请输入视频简介" 
              maxlength="500" 
              show-word-limit
              :rows="4"
            ></el-input>
          </el-form-item>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="视频分类">
                <el-select v-model="form.category" placeholder="请选择视频分类" style="width: 100%;" :loading="categoryLoading">
                  <el-option
                    v-for="cat in categoryList"
                    :key="cat.id"
                    :label="`${cat.icon} ${cat.name}`"
                    :value="cat.name"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="视频标签">
                <div class="tags-container">
                  <el-tag 
                    v-for="(tag, index) in form.tags" 
                    :key="index" 
                    closable 
                    @close="removeTag(index)"
                    style="margin-right: 8px; margin-bottom: 8px;"
                  >
                    {{ tag }}
                  </el-tag>
                  <el-input
                    v-if="showTagInput"
                    ref="tagInput"
                    v-model="newTag"
                    size="small"
                    style="width: 100px;"
                    @keyup.enter="addTag"
                    @blur="addTag"
                    placeholder="输入标签"
                  ></el-input>
                  <el-button v-else-if="form.tags.length < 5" size="small" @click="showTagInput = true">
                    + 添加标签
                  </el-button>
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="公开设置">
                <el-radio-group v-model="form.open">
                  <el-radio :label="1">公开</el-radio>
                  <el-radio :label="0">私密</el-radio>
                  <el-radio :label="2">好友可见</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item>
            <el-button 
              type="primary" 
              size="large" 
              :loading="uploading" 
              :disabled="!selectedFile || uploading"
              @click="submitUpload"
              style="width: 200px;"
            >
              {{ uploading ? '上传中...' : '发布视频' }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 上传结果 -->
      <el-dialog v-model="showResult" title="上传成功" width="400px" center>
        <div class="result-content">
          <i class="result-icon">✅</i>
          <p>视频已成功上传！</p>
          <p class="result-info">视频ID: {{ uploadResult?.videoId }}</p>
        </div>
        <template #footer>
          <el-button @click="resetAndClose">继续上传</el-button>
          <el-button type="primary" @click="goToVideo">查看视频</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { getVideoCategories } from '@/api/video';
import request from '@/utils/request';
import { ElMessage } from 'element-plus';
import { onUnmounted, reactive, ref } from 'vue';

export default {
  name: 'VideoUpload',
  setup() {
    // 文件相关
    const fileInput = ref(null)
    const selectedFile = ref(null)
    const previewUrl = ref('')
    const isDragover = ref(false)

    // 上传状态
    const uploading = ref(false)
    const uploadPercent = ref(0)
    const uploadStatus = ref('')
    const stageText = ref('')
    const chunkInfo = ref(null)
    const currentUuid = ref(null)

    // 表单
    const formRef = ref(null)
    const form = reactive({
      title: '',
      description: '',
      tags: [],
      category: '',
      open: 1
    })
    const rules = {
      title: [
        { required: true, message: '请输入视频标题', trigger: 'blur' },
        { min: 1, max: 100, message: '标题长度不能超过100个字符', trigger: 'blur' }
      ]
    }

    // 标签输入
    const showTagInput = ref(false)
    const newTag = ref('')
    const tagInput = ref(null)

    // 上传结果
    const showResult = ref(false)
    const uploadResult = ref(null)

    // Category
    const categoryList = ref([])
    const categoryLoading = ref(false)

    // Load categories from backend
    const loadCategories = async () => {
      categoryLoading.value = true
      try {
        const res = await getVideoCategories()
        if (res.code === 200 && res.data?.categories) {
          categoryList.value = res.data.categories
        }
      } catch (e) {
        console.error('Failed to load categories:', e)
        // Fallback categories
        categoryList.value = [
          { id: 1, name: '娱乐', icon: '🎬' },
          { id: 2, name: '音乐', icon: '🎵' },
          { id: 3, name: '游戏', icon: '🎮' },
          { id: 4, name: '知识', icon: '📚' },
          { id: 5, name: '美食', icon: '🍜' },
          { id: 6, name: '运动', icon: '⚽' },
          { id: 7, name: '时尚', icon: '👗' },
          { id: 8, name: '旅行', icon: '✈️' },
          { id: 9, name: '科技', icon: '💻' },
          { id: 10, name: '生活', icon: '🏠' },
          { id: 11, name: '其他', icon: '📌' },
        ]
      } finally {
        categoryLoading.value = false
      }
    }

    // 格式化文件大小
    const formatSize = (bytes) => {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    // 触发文件选择
    const triggerFileSelect = () => {
      if (!uploading.value && !selectedFile.value) {
        fileInput.value?.click()
      }
    }

    // 处理文件选择
    const handleFileSelect = (e) => {
      const file = e.target.files?.[0]
      if (file) processFile(file)
    }

    // 处理拖拽
    const handleDrop = (e) => {
      isDragover.value = false
      const file = e.dataTransfer?.files?.[0]
      if (file) processFile(file)
    }

    // 处理文件
    const processFile = (file) => {
      // 验证文件类型
      if (!file.type.startsWith('video/')) {
        ElMessage.error('请选择视频文件')
        return
      }
      // 验证文件大小 (2GB)
      if (file.size > 2 * 1024 * 1024 * 1024) {
        ElMessage.error('视频文件不能超过 2GB')
        return
      }

      // 清理旧的预览
      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value)
      }

      selectedFile.value = file
      previewUrl.value = URL.createObjectURL(file)

      // 自动填充标题
      if (!form.title) {
        form.title = file.name.replace(/\.[^/.]+$/, '').substring(0, 100)
      }
    }

    // 清除文件
    const clearFile = () => {
      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value)
      }
      selectedFile.value = null
      previewUrl.value = ''
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    }

    // 添加标签
    const addTag = () => {
      const tag = newTag.value.trim()
      if (tag && !form.tags.includes(tag) && form.tags.length < 5) {
        form.tags.push(tag)
      }
      newTag.value = ''
      showTagInput.value = false
    }

    // 移除标签
    const removeTag = (index) => {
      form.tags.splice(index, 1)
    }

    // ========== 核心：分片上传逻辑 ==========
    
    // 分片上传配置
    const UPLOAD_CONFIG = {
      // 小文件阈值：小于此大小的文件不分片，直接上传
      SMALL_FILE_THRESHOLD: 10 * 1024 * 1024, // 10MB
      
      // 分片大小配置（根据文件大小动态调整）
      CHUNK_SIZE_SMALL: 2 * 1024 * 1024,   // 2MB - 用于 10-50MB 的文件
      CHUNK_SIZE_MEDIUM: 5 * 1024 * 1024,  // 5MB - 用于 50-200MB 的文件
      CHUNK_SIZE_LARGE: 10 * 1024 * 1024,  // 10MB - 用于 200MB-1GB 的文件
      CHUNK_SIZE_HUGE: 20 * 1024 * 1024,   // 20MB - 用于 1GB 以上的文件
      
      // 最大分片数限制（避免分片过多）
      MAX_CHUNKS: 100,
      
      // 最小分片大小（避免最后一个分片太小）
      MIN_CHUNK_SIZE: 1 * 1024 * 1024, // 1MB
    }

    // 根据文件大小计算最优分片大小
    const calculateChunkSize = (fileSize) => {
      const { SMALL_FILE_THRESHOLD, CHUNK_SIZE_SMALL, CHUNK_SIZE_MEDIUM, CHUNK_SIZE_LARGE, CHUNK_SIZE_HUGE, MAX_CHUNKS } = UPLOAD_CONFIG
      
      // 小文件不分片
      if (fileSize <= SMALL_FILE_THRESHOLD) {
        return fileSize // 返回文件大小，即只有1个分片
      }
      
      let chunkSize
      
      // 根据文件大小选择基础分片大小
      if (fileSize <= 50 * 1024 * 1024) {
        // 10-50MB: 使用 2MB 分片
        chunkSize = CHUNK_SIZE_SMALL
      } else if (fileSize <= 200 * 1024 * 1024) {
        // 50-200MB: 使用 5MB 分片
        chunkSize = CHUNK_SIZE_MEDIUM
      } else if (fileSize <= 1024 * 1024 * 1024) {
        // 200MB-1GB: 使用 10MB 分片
        chunkSize = CHUNK_SIZE_LARGE
      } else {
        // >1GB: 使用 20MB 分片
        chunkSize = CHUNK_SIZE_HUGE
      }
      
      // 检查分片数量是否超过限制
      let chunks = Math.ceil(fileSize / chunkSize)
      if (chunks > MAX_CHUNKS) {
        // 如果分片数超过限制，增大分片大小
        chunkSize = Math.ceil(fileSize / MAX_CHUNKS)
      }
      
      return chunkSize
    }

    // 获取分片策略描述
    const getChunkStrategyInfo = (fileSize, chunkSize) => {
      const totalChunks = Math.ceil(fileSize / chunkSize)
      const isSmallFile = fileSize <= UPLOAD_CONFIG.SMALL_FILE_THRESHOLD
      
      return {
        fileSize,
        chunkSize,
        totalChunks,
        isSmallFile,
        strategy: isSmallFile ? '直接上传（小文件）' : `分片上传（${totalChunks}片 × ${formatSize(chunkSize)}）`
      }
    }

    const submitUpload = async () => {
      // 表单验证
      const valid = await formRef.value?.validate().catch(() => false)
      if (!valid) return

      if (!selectedFile.value) {
        ElMessage.error('请先选择视频文件')
        return
      }

      uploading.value = true
      uploadPercent.value = 0
      uploadStatus.value = ''
      stageText.value = '初始化上传...'
      chunkInfo.value = null

      const file = selectedFile.value
      
      // 动态计算分片大小
      const chunkSize = calculateChunkSize(file.size)
      const totalChunks = Math.ceil(file.size / chunkSize)
      const strategyInfo = getChunkStrategyInfo(file.size, chunkSize)
      
      console.log(`📊 上传策略分析:`)
      console.log(`   文件大小: ${formatSize(file.size)}`)
      console.log(`   分片大小: ${formatSize(chunkSize)}`)
      console.log(`   分片数量: ${totalChunks}`)
      console.log(`   上传策略: ${strategyInfo.strategy}`)

      try {
        // Step 1: 开始上传
        stageText.value = '创建上传会话...'
        console.log(`🚀 调用 /v2/publish/start 创建上传会话...`)
        const startRes = await request({
          url: '/v2/publish/start',
          method: 'post',
          data: {
            title: form.title,
            description: form.description,
            lab_name: form.tags.join(','),
            category: form.category,
            open: form.open,
            chunk_total_number: totalChunks
          }
        })

        if (startRes.code !== 0 && startRes.code !== 200) {
          throw new Error(startRes.message || '创建上传会话失败')
        }

        const uuid = startRes.data?.upload_session_uuid
        if (!uuid) {
          throw new Error('服务器返回的会话ID无效')
        }
        
        console.log(`✅ 上传会话创建成功, UUID: ${uuid}`)
        currentUuid.value = uuid
        uploadPercent.value = 5

        console.log(`📦 开始分片上传: 文件大小=${formatSize(file.size)}, 分片大小=${formatSize(chunkSize)}, 总分片数=${totalChunks}`)

        // Step 2: 分片上传
        stageText.value = strategyInfo.isSmallFile ? '上传视频...' : '上传视频分片...'
        for (let i = 0; i < totalChunks; i++) {
          const start = i * chunkSize
          const end = Math.min(start + chunkSize, file.size)
          const chunk = file.slice(start, end)

          console.log(`📤 上传分片 ${i + 1}/${totalChunks}: 起始=${start}, 结束=${end}, 分片大小=${formatSize(chunk.size)}`)

          const formData = new FormData()
          formData.append('uuid', uuid)
          formData.append('chunk_number', i + 1)
          formData.append('filename', file.name)
          formData.append('is_m3u8', 'false')
          formData.append('data', chunk, file.name)

          const uploadRes = await request({
            url: '/v2/publish/uploading',
            method: 'post',
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 300000
          })

          if (uploadRes.code !== 0 && uploadRes.code !== 200) {
            throw new Error(uploadRes.message || `分片 ${i + 1} 上传失败`)
          }

          console.log(`✅ 分片 ${i + 1}/${totalChunks} 上传成功`)
          chunkInfo.value = { current: i + 1, total: totalChunks }
          uploadPercent.value = Math.round(5 + ((i + 1) / totalChunks) * 85)
        }

        console.log(`🔗 所有分片上传完成，开始合并...`)

        // Step 3: 完成上传
        stageText.value = '处理视频中...'
        uploadPercent.value = 92

        const completeRes = await request({
          url: '/v2/publish/complete',
          method: 'post',
          data: { uuid: uuid }
        })

        if (completeRes.code !== 0 && completeRes.code !== 200) {
          throw new Error(completeRes.message || '完成上传失败')
        }

        // 上传成功
        uploadPercent.value = 100
        uploadStatus.value = 'success'
        stageText.value = '上传完成！'

        uploadResult.value = {
          videoId: completeRes.data?.video_id,
          videoUrl: completeRes.data?.video_url,
          coverUrl: completeRes.data?.cover_url
        }

        ElMessage.success('视频上传成功！')
        showResult.value = true

      } catch (error) {
        console.error('上传失败:', error)
        uploadStatus.value = 'exception'
        stageText.value = '上传失败'
        ElMessage.error(error.message || '视频上传失败，请重试')

        // 取消上传会话
        if (currentUuid.value) {
          try {
            await request({
              url: '/v2/publish/cancel',
              method: 'post',
              data: { uuid: currentUuid.value }
            })
          } catch (e) {
            console.error('取消上传会话失败:', e)
          }
        }
      } finally {
        uploading.value = false
        currentUuid.value = null
      }
    }

    // 取消上传
    const cancelUpload = async () => {
      if (currentUuid.value) {
        try {
          await request({
            url: '/v2/publish/cancel',
            method: 'post',
            data: { uuid: currentUuid.value }
          })
          ElMessage.info('已取消上传')
        } catch (e) {
          console.error('取消上传失败:', e)
        }
      }
      uploading.value = false
      uploadPercent.value = 0
      uploadStatus.value = ''
      stageText.value = ''
      chunkInfo.value = null
      currentUuid.value = null
    }

    // 重置并关闭
    const resetAndClose = () => {
      showResult.value = false
      clearFile()
      form.title = ''
      form.description = ''
      form.tags = []
      form.category = ''
      form.open = 1
      uploadPercent.value = 0
      uploadStatus.value = ''
      stageText.value = ''
      chunkInfo.value = null
    }

    // 跳转到视频
    const goToVideo = () => {
      showResult.value = false
      // 可以跳转到视频详情页
      window.location.href = '/'
    }

    // 清理
    onUnmounted(() => {
      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value)
      }
    })

    // Load categories on mount
    loadCategories()

    return {
      // 文件
      fileInput,
      selectedFile,
      previewUrl,
      isDragover,
      // 上传状态
      uploading,
      uploadPercent,
      uploadStatus,
      stageText,
      chunkInfo,
      // 表单
      formRef,
      form,
      rules,
      // Category
      categoryList,
      categoryLoading,
      // 标签
      showTagInput,
      newTag,
      tagInput,
      // 结果
      showResult,
      uploadResult,
      // 方法
      formatSize,
      triggerFileSelect,
      handleFileSelect,
      handleDrop,
      clearFile,
      addTag,
      removeTag,
      submitUpload,
      cancelUpload,
      resetAndClose,
      goToVideo
    }
  }
}
</script>

<style scoped>
.upload-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.upload-container {
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.page-title {
  text-align: center;
  font-size: 28px;
  color: #333;
  margin-bottom: 30px;
  font-weight: 600;
}

.upload-section {
  margin-bottom: 30px;
}

.upload-area {
  border: 3px dashed #ddd;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover,
.upload-area.is-dragover {
  border-color: #667eea;
  background: #f8f9ff;
}

.upload-area.has-file {
  border-style: solid;
  border-color: #67c23a;
  cursor: default;
}

.upload-placeholder {
  color: #666;
}

.upload-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 20px;
}

.upload-title {
  font-size: 18px;
  margin-bottom: 10px;
  color: #333;
}

.upload-hint {
  font-size: 14px;
  color: #999;
}

.file-preview {
  width: 100%;
}

.preview-video {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.file-info {
  text-align: center;
}

.file-name {
  font-size: 16px;
  color: #333;
  margin-bottom: 5px;
  word-break: break-all;
}

.file-size {
  font-size: 14px;
  color: #999;
  margin-bottom: 10px;
}

.upload-progress {
  text-align: center;
}

.stage-text {
  margin-top: 15px;
  font-size: 16px;
  color: #666;
}

.chunk-text {
  margin-top: 8px;
  font-size: 14px;
  color: #999;
}

.form-section {
  margin-top: 30px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.result-content {
  text-align: center;
  padding: 20px;
}

.result-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 15px;
}

.result-info {
  color: #999;
  font-size: 14px;
}
</style>
