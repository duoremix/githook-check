const fs = require('fs')
const path = require('path')

module.exports = {
  getCurrentDirectory: () => {
    return process.cwd()
  },

  getCurrentDirectoryBase: () => {
    return path.basename(process.cwd())
  },

  isDirectoryExists: (filePath) => {
    try {
      return fs.statSync(filePath).isDirectory()
    } catch (err) {
      return false
    }
  },

  isFileExists: (filePath) => {
    try {
      return fs.existsSync(filePath)
    } catch (err) {
      return false
    }
  }
}