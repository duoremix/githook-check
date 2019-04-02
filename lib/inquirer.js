const inquirer = require('inquirer')
const files = require('./files')

module.exports = {

  askGithookType: () => {
    const questions = [
      {
        name: 'type',
        type: 'input',
        message: 'Enter the githook type(eg. pre-commit、pre-push):',
        validate: function(value) {
          if (value.length) {
            return true
          } else {
            return 'Please enter the githook type.'
          }
        }
      }
    ]
    return inquirer.prompt(questions)
  },
  askReplaceHooks: () => {
    const questions = [
      {
        name: 'isReplace',
        type: 'input',
        message: 'Githook file exist! Are you going to replace？(y or n, default for n)',
        validate: function(value) {
          if (value.length) {
            return true
          }
        }
      }
    ]
    return inquirer.prompt(questions)
  }
}
