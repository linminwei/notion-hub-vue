/**
 * 日期时间工具类
 */

/**
 * 格式化日期
 * @param {Date|string|number} date - 日期对象、时间戳或日期字符串
 * @param {string} format - 格式化模板
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return ''
  
  const d = typeof date === 'object' ? date : new Date(date)
  
  if (isNaN(d.getTime())) return ''
  
  const map = {
    YYYY: d.getFullYear(),
    MM: String(d.getMonth() + 1).padStart(2, '0'),
    DD: String(d.getDate()).padStart(2, '0'),
    HH: String(d.getHours()).padStart(2, '0'),
    mm: String(d.getMinutes()).padStart(2, '0'),
    ss: String(d.getSeconds()).padStart(2, '0')
  }
  
  return format.replace(/YYYY|MM|DD|HH|mm|ss/g, match => map[match])
}

/**
 * 获取相对时间
 * @param {Date|string|number} date - 日期
 * @returns {string} 相对时间描述
 */
export function getRelativeTime(date) {
  const now = new Date()
  const target = new Date(date)
  const diff = now - target
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  
  if (diff < 0) {
    return formatDate(date, 'YYYY-MM-DD HH:mm')
  }
  
  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < week) {
    return `${Math.floor(diff / day)}天前`
  } else {
    return formatDate(date, 'YYYY-MM-DD')
  }
}

/**
 * 解析日期
 * @param {string} dateString - 日期字符串
 * @returns {Date} 日期对象
 */
export function parseDate(dateString) {
  return new Date(dateString)
}

/**
 * 判断是否为今天
 */
export function isToday(date) {
  const today = new Date()
  const target = new Date(date)
  
  return today.getFullYear() === target.getFullYear() &&
         today.getMonth() === target.getMonth() &&
         today.getDate() === target.getDate()
}

/**
 * 判断是否为本周
 */
export function isThisWeek(date) {
  const now = new Date()
  const target = new Date(date)
  const oneWeek = 7 * 24 * 60 * 60 * 1000
  
  return now - target < oneWeek && now - target >= 0
}

/**
 * 获取日期范围
 */
export function getDateRange(type) {
  const now = new Date()
  const start = new Date(now)
  const end = new Date(now)
  
  switch (type) {
    case 'today':
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      break
    case 'week':
      const day = now.getDay()
      start.setDate(now.getDate() - day + (day === 0 ? -6 : 1))
      start.setHours(0, 0, 0, 0)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      break
    case 'month':
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(end.getMonth() + 1, 0)
      end.setHours(23, 59, 59, 999)
      break
    case 'year':
      start.setMonth(0, 1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(11, 31)
      end.setHours(23, 59, 59, 999)
      break
  }
  
  return [start, end]
}
