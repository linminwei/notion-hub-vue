<template>
  <div class="audio-parser">
    <a-card title="音频元数据解析">
      <!-- 上传区域，解析后隐藏 -->
      <div v-if="albums.length === 0" class="upload-area">
        <a-upload-dragger
          v-model:file-list="fileList"
          name="files"
          :multiple="true"
          :before-upload="beforeUpload"
          :show-upload-list="true"
          accept="audio/*"
          @remove="handleRemove"
        >
          <p class="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p class="ant-upload-text">点击或拖拽音频文件到此区域</p>
          <p class="ant-upload-hint">
            支持多个音频文件上传，支持 MP3、FLAC、WAV 等格式
          </p>
        </a-upload-dragger>
        
        <div class="action-buttons" v-if="fileList.length > 0">
          <a-space>
            <a-button 
              type="primary" 
              :loading="loading" 
              @click="handleParse"
              size="large"
            >
              <template #icon><FileSearchOutlined /></template>
              解析元数据
            </a-button>
            <a-button @click="handleClear" size="large">
              <template #icon><ClearOutlined /></template>
              清空文件
            </a-button>
          </a-space>
        </div>
      </div>

      <!-- 专辑展示区域 -->
      <div v-if="albums.length > 0" class="albums-container">
        <div class="result-header">
          <a-space>
            <a-button type="primary" @click="handleReparse" size="large">
              <template #icon><ReloadOutlined /></template>
              重新上传
            </a-button>
            <span style="font-size: 16px; font-weight: bold;">
              解析结果（共 {{ albums.length }} 个专辑）
            </span>
          </a-space>
        </div>
        
        <!-- 专辑列表 -->
        <div class="album-list">
          <div 
            v-for="(album, index) in albums" 
            :key="index" 
            class="album-item"
          >
            <!-- 专辑头部 -->
            <div class="album-header">
              <!-- 左侧封面 -->
              <div class="album-cover-wrapper">
                <div class="album-cover-large">
                  <img
                    v-if="album.albumArt"
                    :src="`data:image/jpeg;base64,${album.albumArt}`"
                    alt="专辑封面"
                  />
                  <div v-else class="no-cover-large">
                    <FileImageOutlined style="font-size: 80px; color: #ccc;" />
                    <div>无封面</div>
                  </div>
                </div>
              </div>
              
              <!-- 右侧专辑信息 -->
              <div class="album-info-wrapper">
                <div class="album-meta">
                  <h2 class="album-name">{{ album.albumName }}</h2>
                  <div class="album-details">
                    <a-tag v-if="album.artist" color="red" class="info-tag">
                      <UserOutlined /> {{ album.artist }}
                    </a-tag>
                    <a-tag v-if="album.year" color="blue" class="info-tag">
                      <CalendarOutlined /> {{ album.year }}
                    </a-tag>
                    <a-tag v-if="album.genre" color="green" class="info-tag">
                      <TagOutlined /> {{ album.genre }}
                    </a-tag>
                    <a-tag v-if="album.language" color="orange" class="info-tag">
                      🌐 {{ album.language }}
                    </a-tag>
                    <a-tag color="purple" class="info-tag">
                      <SoundOutlined /> {{ album.tracks.length }} 首歌曲
                    </a-tag>
                  </div>
                  
                  <!-- 专辑统计信息 -->
                  <div class="album-stats">
                    <span class="stat-item">
                      总时长: {{ getTotalDuration(album.tracks) }}
                    </span>
                    <span class="stat-item">
                      总大小: {{ getTotalSize(album.tracks) }}
                    </span>
                  </div>
                </div>
                
                <!-- 折叠按钮 -->
                <div class="toggle-button">
                  <a-button 
                    @click="toggleAlbum(index)" 
                    type="text"
                    size="large"
                  >
                    <template #icon>
                      <DownOutlined v-if="!expandedAlbums.includes(index)" />
                      <UpOutlined v-else />
                    </template>
                    {{ expandedAlbums.includes(index) ? '收起' : '展开' }}曲目列表
                  </a-button>
                </div>
              </div>
            </div>
            
            <!-- 可折叠的歌曲列表 -->
            <a-collapse-transition>
              <div v-show="expandedAlbums.includes(index)" class="track-list">
                <a-table 
                  :columns="trackColumns" 
                  :data-source="album.tracks" 
                  :pagination="false"
                  :row-key="(record, idx) => idx"
                  size="small"
                  bordered
                >
                  <template #bodyCell="{ column, record, index: idx }">
                    <template v-if="column.key === 'index'">
                      <span class="track-index">{{ record.track || (idx + 1) }}</span>
                    </template>
                    <template v-else-if="column.key === 'title'">
                      <div class="track-title-cell">
                        <div class="track-name">{{ record.title || record.fileName }}</div>
                        <div class="track-artist" v-if="record.artist">{{ record.artist }}</div>
                      </div>
                    </template>
                    <template v-else-if="column.key === 'quality'">
                      <div class="quality-badge">
                        <img 
                          v-if="record.soundQuality === 'Hi-Res'" 
                          src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCA0OCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iMjQiIHJ4PSI0IiBmaWxsPSIjRkZENzAwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiMwMDAwMDAiPkhpLVJlczwvdGV4dD48L3N2Zz4="
                          alt="Hi-Res"
                          class="quality-icon"
                        />
                        <img 
                          v-else
                          src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCA0OCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iMjQiIHJ4PSI0IiBmaWxsPSIjNDA5RUZGIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNGRkZGRkYiPkNEKzwvdGV4dD48L3N2Zz4="
                          alt="CD+"
                          class="quality-icon"
                        />
                      </div>
                    </template>
                    <template v-else-if="column.key === 'language'">
                      <a-tag v-if="record.language" color="cyan">{{ record.language }}</a-tag>
                      <span v-else style="color: #ccc;">--</span>
                    </template>
                    <template v-else-if="column.key === 'duration'">
                      {{ formatDuration(record.duration) }}
                    </template>
                    <template v-else-if="column.key === 'technical'">
                      <div class="technical-info">
                        <a-tag v-if="record.bitrate" color="blue" size="small">{{ record.bitrate }} kbps</a-tag>
                        <a-tag v-if="record.sampleRate" color="green" size="small">{{ record.sampleRate }} Hz</a-tag>
                        <a-tag v-if="record.bitDepth" color="purple" size="small">{{ record.bitDepth }} bit</a-tag>
                      </div>
                    </template>
                    <template v-else-if="column.key === 'fileSize'">
                      {{ formatFileSize(record.fileSize) }}
                    </template>
                    <template v-else-if="column.key === 'action'">
                      <a-button 
                        v-if="record.lyrics" 
                        type="link" 
                        size="small"
                        @click="showLyrics(record)"
                      >
                        查看歌词
                      </a-button>
                      <span v-else style="color: #ccc;">无歌词</span>
                    </template>
                  </template>
                </a-table>
              </div>
            </a-collapse-transition>
          </div>
        </div>
      </div>
    </a-card>
    
    <!-- 歌词弹窗 -->
    <a-modal
      v-model:open="lyricsVisible"
      :title="currentTrack ? `${currentTrack.title || currentTrack.fileName} - 歌词` : '歌词'"
      width="600px"
      :footer="null"
    >
      <div class="lyrics-container">
        <pre class="lyrics-content">{{ currentTrack?.lyrics || '暂无歌词' }}</pre>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { 
  InboxOutlined, 
  FileSearchOutlined, 
  ClearOutlined,
  FileImageOutlined,
  UserOutlined,
  CalendarOutlined,
  TagOutlined,
  SoundOutlined,
  ReloadOutlined,
  DownOutlined,
  UpOutlined
} from '@ant-design/icons-vue'
import { parseAudioFiles } from '@/api/audio'

const fileList = ref([])
const albums = ref([])
const loading = ref(false)
const uploadProgress = ref(0)
const expandedAlbums = ref([]) // 展开的专辑索引
const lyricsVisible = ref(false) // 歌词弹窗显示
const currentTrack = ref(null) // 当前选中的音轨

// 表格列定义
const trackColumns = [
  {
    title: '音轨号',
    key: 'index',
    width: 60,
    align: 'center'
  },
  {
    title: '歌曲名称',
    key: 'title',
    ellipsis: true
  },
  {
    title: '音质',
    key: 'quality',
    width: 100,
    align: 'center'
  },
  {
    title: '语种',
    key: 'language',
    width: 100,
    align: 'center'
  },
  {
    title: '时长',
    key: 'duration',
    width: 100,
    align: 'center'
  },
  {
    title: '音频参数',
    key: 'technical',
    width: 280,
    align: 'center'
  },
  {
    title: '文件大小',
    key: 'fileSize',
    width: 120,
    align: 'center'
  },
  {
    title: '操作',
    key: 'action',
    width: 100,
    align: 'center'
  }
]

// 上传前处理
const beforeUpload = (file) => {
  // 只做前端验证，不实际上传
  const isAudio = file.type.startsWith('audio/')
  if (!isAudio) {
    message.error(`${file.name} 不是音频文件`)
    return false
  }
  
  // 阻止自动上传
  return false
}

// 移除文件
const handleRemove = (file) => {
  const index = fileList.value.indexOf(file)
  const newFileList = fileList.value.slice()
  newFileList.splice(index, 1)
  fileList.value = newFileList
}

// 清空文件
const handleClear = () => {
  fileList.value = []
  albums.value = []
}

// 重新上传
const handleReparse = () => {
  albums.value = []
  fileList.value = []
}

// 解析音频文件
const handleParse = async () => {
  if (fileList.value.length === 0) {
    message.warning('请先上传音频文件')
    return
  }
  
  loading.value = true
  uploadProgress.value = 0
  
  try {
    // 提取原始文件对象
    const files = fileList.value.map(item => item.originFileObj || item)
    
    // 显示上传提示
    const hideLoading = message.loading('正在上传和解析文件，请耐心等待...', 0)
    
    const response = await parseAudioFiles(files)
    
    hideLoading()
    
    if (response.code === 200) {
      albums.value = response.data
      message.success(`成功解析 ${albums.value.length} 个专辑`)
    } else {
      message.error(response.message || '解析失败')
    }
  } catch (error) {
    console.error('解析失败:', error)
    if (error.code === 'ECONNABORTED') {
      message.error('请求超时，文件可能太大，请尝试减少文件数量')
    } else {
      message.error('解析失败，请检查文件格式或网络连接')
    }
  } finally {
    loading.value = false
    uploadProgress.value = 0
  }
}

// 格式化时长
const formatDuration = (seconds) => {
  if (!seconds) return '--'
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (!bytes) return '--'
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(2)} ${units[unitIndex]}`
}

// 切换专辑展开/收起
const toggleAlbum = (index) => {
  const idx = expandedAlbums.value.indexOf(index)
  if (idx > -1) {
    expandedAlbums.value.splice(idx, 1)
  } else {
    expandedAlbums.value.push(index)
  }
}

// 计算专辑总时长
const getTotalDuration = (tracks) => {
  const total = tracks.reduce((sum, track) => sum + (track.duration || 0), 0)
  return formatDuration(total)
}

// 计算专辑总大小
const getTotalSize = (tracks) => {
  const total = tracks.reduce((sum, track) => sum + (track.fileSize || 0), 0)
  return formatFileSize(total)
}

// 显示歌词
const showLyrics = (track) => {
  currentTrack.value = track
  lyricsVisible.value = true
}
</script>

<style scoped>
.audio-parser {
  padding: 20px;
}

.upload-area {
  margin-bottom: 24px;
}

.action-buttons {
  margin-top: 16px;
  text-align: center;
}

.albums-container {
  margin-top: 32px;
}

.result-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.album-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.album-item {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
}

.album-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.album-header {
  display: flex;
  padding: 24px;
  gap: 24px;
}

.album-cover-wrapper {
  flex-shrink: 0;
}

.album-cover-large {
  width: 200px;
  height: 200px;
  position: relative;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.album-cover-large img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
}

.no-cover-large {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  gap: 8px;
}

.album-info-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.album-meta {
  flex: 1;
}

.album-name {
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 16px 0;
  color: #333;
}

.album-details {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.info-tag {
  font-size: 14px;
  padding: 4px 12px;
}

.album-stats {
  display: flex;
  gap: 24px;
  color: #666;
  font-size: 14px;
}

.stat-item {
  display: flex;
  align-items: center;
}

.toggle-button {
  text-align: right;
}

.track-list {
  border-top: 1px solid #e8e8e8;
  padding: 0;
}

.track-index {
  color: #999;
  font-weight: 500;
}

.track-title-cell {
  text-align: left;
}

.track-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.track-artist {
  font-size: 12px;
  color: #999;
}

.technical-info {
  display: flex;
  gap: 4px;
  justify-content: center;
  flex-wrap: wrap;
}

.quality-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.quality-icon {
  height: 20px;
  width: auto;
}

.lyrics-container {
  max-height: 500px;
  overflow-y: auto;
  padding: 16px 0;
}

.lyrics-content {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.8;
  color: #333;
  margin: 0;
}

.lyrics-container::-webkit-scrollbar {
  width: 6px;
}

.lyrics-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.lyrics-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.lyrics-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
