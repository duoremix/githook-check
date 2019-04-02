const fs = require('fs')
const path = require('path')
const files = require('./files')

module.exports = {
  install: (dir, type) => {
    fs.writeFile(`${dir}/.git/hooks/${type}`, `node ./.githook-check/${type}/index.js\n`, (err) => {
      if (err) {
        throw err
      }
      fs.chmodSync(`${dir}/.git/hooks/${type}`, 0o765)
      const copyFile = () => {
        fs.copyFile(path.resolve(__dirname, '../src/main.js'), `${dir}/.githook-check/${type}/index.js`, (err) => {
          if (err) {
            console.log(err)
            throw err
          }
          console.log('Installing...')
        })
      }
      if (!files.isDirectoryExists(`${dir}/.githook-check`)) {
        fs.mkdirSync(`${dir}/.githook-check`)
      }
      if (!files.isDirectoryExists(`${dir}/.githook-check/${type}`)) {
        fs.mkdirSync(`${dir}/.githook-check/${type}`)
      }
      copyFile()
    })
  }
}