#!/usr/bin/env node

const fs = require('fs')
const chalk = require('chalk')
const clear = require('clear')
const figlet = require('figlet')
const simpleGit = require('simple-git')
const files = require('./lib/files')
const inquirer = require('./lib/inquirer')
const install = require('./lib/install')
const process = require('child_process')

const currentDirectory = files.getCurrentDirectory()

clear()
console.log(
  chalk.yellow(
    figlet.textSync('githook-check', { horizontalLayout: 'full' })
  )
)

if (!files.isDirectoryExists(`${currentDirectory}/.git`)) {
  // 检查是否存在git的隐藏目录
  console.log(chalk.red('There is not a repository in this directory!'))
  process.exit()
} else {
  const run = async () => {
    // 先安装必要依赖
    process.exec('yarn add simple-git --dev')
    const credentials = await inquirer.askGithookType()
    if (files.isFileExists(`${currentDirectory}/.git/hooks/${credentials.type}`)) {
      const askReplaceHooks = async () => {
        const result = await inquirer.askReplaceHooks()
        if (result.isReplace === 'y') {
          install.install(currentDirectory, credentials.type)
        }
      }

      askReplaceHooks()
    } else {
      install.install(currentDirectory, credentials.type)
    }
  }

  run()
}
