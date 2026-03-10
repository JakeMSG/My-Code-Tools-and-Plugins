const fs = require('fs')

// const inputPath = 'ManualTransFile_onlyJap.json'
// const output = 'ManualTransFile_onlyJap'

const name='ManualTransFile_onlyJap'
const inputPath = `${name}.json`


function nSlashAmount(key) {
  const regex = /\n/g;
  const newlineCount = (key.match(regex) || []).length;

  return newlineCount > 3 ? 3 : newlineCount
}


fs.readFile(inputPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the file:', err)
    return
  }

  const jsonData = JSON.parse(data)

  const filtered0SlashN = {}
  const filtered1SlashN = {}
  const filtered2SlashN = {}
  const filtered3SlashN = {}

  for (const key in jsonData) {
    // console.log('key', key)
    const amount = nSlashAmount(key)
    // console.log('amount', amount)
    switch (amount) {
      case 0:
        filtered0SlashN[key] = jsonData[key]
        break
      case 1:
        filtered1SlashN[key] = jsonData[key]
        break
      case 2:
        filtered2SlashN[key] = jsonData[key]
        break
      case 3:
        filtered3SlashN[key] = jsonData[key]
        break
    }

  }
  // console.log('filtered0SlashN', filtered0SlashN)
  // console.log('filtered1SlashN', filtered1SlashN)
  // console.log('filtered2SlashN', filtered2SlashN)
  // console.log('filtered3SlashN', filtered3SlashN)



  // const filtered0SlashNJson = JSON.stringify(filtered0SlashN, null, 2)
  // const filtered1SlashNJson = JSON.stringify(filtered1SlashN, null, 2)
  // const filtered2SlashNJson = JSON.stringify(filtered2SlashN, null, 2)
  // const filtered3SlashNJson = JSON.stringify(filtered3SlashN, null, 2)

  const filteredSlashNJson = [
    JSON.stringify(filtered0SlashN, null, 2),
    JSON.stringify(filtered1SlashN, null, 2),
    JSON.stringify(filtered2SlashN, null, 2),
    JSON.stringify(filtered3SlashN, null, 2)
  ]

  for (let i = 0; i < 4; i++) {
    const outputPath=`${name}__${i}_slash-n-amount.json`
    fs.writeFile(outputPath, filteredSlashNJson[i], 'utf8', (err) => {
      if (err) {
        console.error('Error writing to the file:', err)
        return
      }
      console.log(`Filtered data has been written to ${outputPath}`)
    })
  }
})
