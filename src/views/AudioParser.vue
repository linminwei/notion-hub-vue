<template>
  <div class="audio-parser">
    <a-card class="audio-card">
      <!-- 上传区域，解析后隐藏 -->
      <div v-if="albums.length === 0" class="upload-area">
        <a-upload-dragger
          v-model:file-list="fileList"
          name="files"
          :multiple="true"
          :before-upload="beforeUpload"
          :show-upload-list="false"
          accept="audio/*"
          @remove="handleRemove"
        >
          <p class="upload-icon"><InboxOutlined /></p>
          <h3 class="upload-title">拖放音乐文件到此处</h3>
          <p class="upload-hint">支持 MP3、FLAC、WAV、AAC 等格式，可批量上传</p>
          <a-button class="select-file-btn" type="primary" size="large">选择文件</a-button>
        </a-upload-dragger>

        <div class="file-list-cards" v-if="fileList.length > 0">
          <div class="file-card" v-for="(item, idx) in fileList" :key="idx">
            <div class="file-icon">
              <AudioOutlined />
            </div>
            <div class="file-info">
              <div class="file-name">{{ (item.name || (item.originFileObj && item.originFileObj.name)) }}</div>
              <div class="file-meta">
                {{ (getFileExtension(item.name || (item.originFileObj && item.originFileObj.name)) || '').toUpperCase() }} ·
                {{ formatFileSize((item.size) || (item.originFileObj && item.originFileObj.size)) }}
              </div>
            </div>
            <a-button type="text" class="file-remove" @click="handleRemove(item)">移除</a-button>
          </div>
        </div>
        
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
            <!-- 解析结果标题已移除 -->
          </a-space>
        </div>
        <div class="overview-stats">
          <div class="stat-grid">
            <div class="stat-card">
              <div class="stat-icon-wrapper">
                <FileOutlined class="stat-icon files-icon" />
              </div>
              <div class="stat-content">
                <div class="stat-title">总文件数</div>
                <div class="stat-value">{{ totalFiles }}</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon-wrapper">
                <SoundOutlined class="stat-icon success-icon" />
              </div>
              <div class="stat-content">
                <div class="stat-title">解析成功</div>
                <div class="stat-value">{{ totalSuccess }}</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon-wrapper">
                <CloseCircleOutlined class="stat-icon failure-icon" />
              </div>
              <div class="stat-content">
                <div class="stat-title">解析失败</div>
                <div class="stat-value">{{ totalFailure }}</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon-wrapper">
                <ClockCircleOutlined class="stat-icon duration-icon" />
              </div>
              <div class="stat-content">
                <div class="stat-title">总时长</div>
                <div class="stat-value">{{ totalDuration }}</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon-wrapper">
                <DatabaseOutlined class="stat-icon size-icon" />
              </div>
              <div class="stat-content">
                <div class="stat-title">总大小</div>
                <div class="stat-value">{{ totalFileSize }}</div>
              </div>
            </div>
          </div>
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
                    <img
                      :src="generateCoverPlaceholder(album.albumName)"
                      alt="封面占位"
                    />
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
                      总时长: {{ calculateTotalDuration(album.tracks) }}
                    </span>
                    <span class="stat-item">
                      总大小: {{ calculateTotalSize(album.tracks) }}
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
                          :src="getQualityIconUrl(record.soundQuality)"
                          :alt="record.soundQuality"
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
                        <a-tag v-if="record.sampleRate" color="green" size="small">{{ formatSampleRate(record.sampleRate) }}</a-tag>
                        <a-tag v-if="record.bitDepth" color="purple" size="small">{{ formatBitDepth(record.bitDepth) }}</a-tag>
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
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { 
  InboxOutlined, 
  AudioOutlined,
  FileSearchOutlined, 
  ClearOutlined,
  FileImageOutlined,
  UserOutlined,
  CalendarOutlined,
  TagOutlined,
  SoundOutlined,
  ReloadOutlined,
  DownOutlined,
  UpOutlined,
  FileOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  DatabaseOutlined
} from '@ant-design/icons-vue'
import { parseAudioFiles } from '@/api/audio'
import { 
  TABLE_COLUMNS, 
  MESSAGES, 
  AUDIO_FORMATS,
  QUALITY_LABELS
} from '@/constants/audio'
import { 
  formatDuration, 
  formatFileSize,
  calculateTotalDuration,
  calculateTotalSize,
  getQualityIcon,
  isSupportedAudioFormat,
  formatSampleRate,
  formatBitDepth,
  generateCoverPlaceholder,
  getFileExtension
} from '@/utils/audio'

const fileList = ref([])
const albums = ref([])
const loading = ref(false)
const expandedAlbums = ref([]) // 展开的专辑索引
const lyricsVisible = ref(false) // 歌词弹窗显示
const currentTrack = ref(null) // 当前选中的音轨

// 概览统计
const totalAlbums = computed(() => albums.value.length)
const totalTracks = computed(() => albums.value.reduce((sum, a) => sum + ((a.tracks && a.tracks.length) || 0), 0))
const totalDuration = computed(() => calculateTotalDuration(albums.value.flatMap(a => a.tracks || [])))
const totalSize = computed(() => calculateTotalSize(albums.value.flatMap(a => a.tracks || [])))
const totalFiles = computed(() => fileList.value.length)
const totalSuccess = computed(() => totalTracks.value)
const totalFailure = computed(() => Math.max(totalFiles.value - totalSuccess.value, 0))
const totalFileSize = computed(() => {
  return albums.value.length > 0 
    ? calculateTotalSize(albums.value.flatMap(a => a.tracks || []))
    : formatFileSize(fileList.value.reduce((sum, f) => sum + ((f.size) || (f.originFileObj && f.originFileObj.size) || 0), 0))
})

// 使用常量中的表格列配置
const trackColumns = TABLE_COLUMNS

// 上传前处理
const beforeUpload = (file) => {
  // 只做前端验证，不实际上传
  if (!file.type.startsWith(AUDIO_FORMATS.MIME_PREFIX)) {
    message.error(MESSAGES.INVALID_FILE.replace('{filename}', file.name))
    return false
  }
  
  // 验证文件格式
  if (!isSupportedAudioFormat(file.name)) {
    message.error(MESSAGES.INVALID_FILE.replace('{filename}', file.name))
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
    message.warning(MESSAGES.NO_FILES)
    return
  }
  
  loading.value = true
  
  try {
    // 提取原始文件对象
    const files = fileList.value.map(item => item.originFileObj || item)
    
    // 显示上传提示
    const hideLoading = message.loading(MESSAGES.PARSING, 0)
    
    const response = await parseAudioFiles(files)
    
    hideLoading()
    
    if (response.code === 200) {
      albums.value = response.data
      message.success(MESSAGES.PARSE_SUCCESS.replace('{count}', albums.value.length))
    } else {
      message.error(response.message || MESSAGES.PARSE_ERROR)
    }
  } catch (error) {
    console.error('解析失败:', error)
    if (error.code === 'ECONNABORTED') {
      message.error(MESSAGES.TIMEOUT_ERROR)
    } else {
      message.error(MESSAGES.PARSE_ERROR)
    }
  } finally {
    loading.value = false
  }
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

// 显示歌词
const showLyrics = (track) => {
  currentTrack.value = track
  lyricsVisible.value = true
}

// 获取音质图标
const getQualityIconUrl = (quality) => {
  return getQualityIcon(quality)
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
  padding: 12px 0;
}

.action-buttons .ant-button {
  border-radius: 8px;
  font-weight: 500;
}

.albums-container {
  margin-top: 32px;
}

.result-header {
  margin: 24px 0 16px;
  padding: 0;
  border-bottom: none;
  display: flex;
  align-items: center;
  gap: 12px;
}

.result-header .ant-space {
  display: flex;
  align-items: center;
  gap: 12px;
}

.overview-stats {
  margin: 16px 0 24px;
  padding: 16px;
  background: linear-gradient(180deg, #fafafa 0%, #fdfdfd 100%);
  border: 1px solid #f0f0f0;
  border-radius: 12px;
}

.overview-stats .ant-space-item {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  padding: 12px 18px;
  min-width: 180px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}

.overview-stats .ant-statistic-title {
  font-size: 12px;
  color: #8c8c8c;
  letter-spacing: 0.3px;
}

.overview-stats .ant-statistic-content {
  font-weight: 600;
  font-size: 22px;
  color: #1f1f1f;
}

.no-cover-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.85;
}

.audio-parser {
  padding: 24px;
  background: #ffffff;
  min-height: 100vh;
}

.audio-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  border: none;
}

.upload-area :deep(.ant-upload.ant-upload-drag) {
  border: 2px dashed #8b5cf6;
  background: #f8f5ff;
  border-radius: 16px;
  padding: 36px 24px;
}

.upload-icon {
  color: #8b5cf6;
  font-size: 42px;
  margin-bottom: 8px;
}

.upload-title {
  font-size: 18px;
  font-weight: 600;
  color: #4c1d95;
  margin: 6px 0 4px;
}

.upload-hint {
  color: #7c7c7c;
  margin-bottom: 14px;
}

.select-file-btn {
  background: linear-gradient(90deg, #8b5cf6 0%, #6d28d9 100%);
  border: none;
}

.overview-stats {
  margin: 16px 0 24px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 0;
}

.stat-grid {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #ffffff;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 16px 18px;
  min-width: 180px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  transition: all .3s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(139,92,246,0.12);
  border-color: #e5d9f6;
  transform: translateY(-2px);
}

.stat-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon {
  font-size: 20px;
}

/* 为不同类型的图标设置wrapper背景色和icon颜色 */
.stat-icon-wrapper:has(.files-icon) {
  background: #f3e8ff;
}

.stat-icon-wrapper .files-icon {
  color: #8b5cf6;
}

.stat-icon-wrapper:has(.success-icon) {
  background: #ecfdf5;
}

.stat-icon-wrapper .success-icon {
  color: #10b981;
}

.stat-icon-wrapper:has(.failure-icon) {
  background: #fef2f2;
}

.stat-icon-wrapper .failure-icon {
  color: #ef4444;
}

.stat-icon-wrapper:has(.duration-icon) {
  background: #f3e8ff;
}

.stat-icon-wrapper .duration-icon {
  color: #8b5cf6;
}

.stat-icon-wrapper:has(.size-icon) {
  background: #fffbeb;
}

.stat-icon-wrapper .size-icon {
  color: #f59e0b;
}

.stat-title {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
  letter-spacing: 0;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.2;
}

.file-list-cards {
  margin: 16px 0 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.file-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: all .2s ease;
}

.file-card:hover {
  box-shadow: 0 4px 12px rgba(139,92,246,0.12);
  transform: translateY(-1px);
  border-color: #d9d6fe;
}

.file-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6d28d9;
  background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
  flex-shrink: 0;
}

.file-info { flex: 1; }
.file-name { font-size: 14px; font-weight: 600; color: #1f2937; }
.file-meta { font-size: 11px; color: #9ca3af; margin-top: 2px; }

.file-remove { color: #8b5cf6; font-size: 13px; }

.album-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
}

.album-item {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  overflow: hidden;
  transition: all .3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.album-item:hover {
  box-shadow: 0 6px 16px rgba(139,92,246,0.12);
  border-color: #d9d6fe;
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
