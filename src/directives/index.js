/**
 * 指令入口文件
 * 统一导出所有自定义指令
 */
import permission from './permission'

export default {
  install(app) {
    app.directive('permission', permission)
  }
}

export {
  permission
}
