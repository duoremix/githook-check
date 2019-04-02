const path = require('path')
const rootPath = path.resolve(__dirname, '../../')
const git = require('simple-git/promise')(rootPath)
const fs = require('fs')

const gitHookCheck = {
  config: {
    // 是否检测文件冲突
    isCheckConflict: true
  },
  getChangeFiles: () => new Promise(async (resolve) => {
    let changeFiles = []

    /**
     * 注意：per-commit再进行diff的时候，内容会进入暂存区
     * 这个时候如果不加 --cached 将会检测不到任何变化，请参考：
     * https://stackoverflow.com/questions/45721633/git-diff-does-not-work-when-run-from-a-git-pre-commit-hook
     * 当前文件差异只支持per-commit hooks，其它hooks的差异对比需通过diff tree实现
     */
    let diffSummaryStr = await git.diff(['--cached', '--numstat']).catch(() => {
      resolve(changeFiles)
    })
    /* 将diffSummary字符串转换成只有文件路径的数组信息 */
    let diffArr = diffSummaryStr.split('\n')
    let filePathArr = []
    diffArr.forEach((strLine) => {
      let filePath = strLine.split('\t')[2]
      if (filePath) {
        filePathArr.push(path.join(rootPath, filePath))
      }
    })
    changeFiles = filePathArr

    if (!diffSummaryStr) {
      let status = await git.status().catch(function () {
        resolve(changeFiles)
      })
      if (status) {
        changeFiles = [].concat(status.created, status.modified, status.renamed)
        changeFiles = changeFiles.map(filePath => path.join(rootPath, filePath))
      }
    }

    resolve(changeFiles)
  }),
  /**
   * [fileConflictCheck 检测文件是否冲突]
   * @return {[Boolean]} [检测结果]
   */
  fileConflictCheck: function(fileList) {
    const t = this
    if (!this.config.isCheckConflict) {
      return true
    }
    let limitFileList = []
    fileList.forEach((filePath) => {
      if (!fs.existsSync(filePath)) {
        return false
      }
      let content = fs.readFileSync(filePath).toString()
      let matchResult = content.match(/>>>>/g) || content.match(/<<<</g)
      if (matchResult && matchResult.length) {
        limitFileList.push(filePath)
      }
    })

    let isPass = !limitFileList.length

    if (!isPass) {
      const tips = '部分文件存在冲突，请解决冲突后提交'
      console.error(tips)
      console.error(limitFileList)
    } else {
      console.log('无文件冲突')
    }

    return isPass
  },
  /**
   * [shutdown 停止git操作]
   */
  shutdown() {
    console.error('验证不通过，不允许该git操作！')
    process.exit(1)
  },
  async run() {
    const fileList = await this.getChangeFiles()

    const isPass = this.fileConflictCheck(fileList)

    if (!isPass) {
      this.shutdown()
    }
    
  }
}

gitHookCheck.run()