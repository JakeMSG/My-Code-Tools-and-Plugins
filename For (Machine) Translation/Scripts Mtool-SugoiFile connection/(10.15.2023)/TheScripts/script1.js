const fs = require('fs')

const input = 'ManualTransFile.json'
const outputJap = 'ManualTransFile_onlyJap.json'
const outputNotJap = 'ManualTransFile_onlyNotJap.json'

function isJapanese(text) {
  const regex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/
  return regex.test(text)
}

fs.readFile(input, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the file:', err)
    return
  }

  const jsonData = JSON.parse(data)

  const filteredJap = {}
  const filteredNotJap = {}
  for (const key in jsonData) {
    if (isJapanese(key)) {
      filteredJap[key] = jsonData[key]
    } else{
      filteredNotJap[key]=jsonData[key]
    }
  }

  const filteredJsonJap = JSON.stringify(filteredJap, null, 2)
  const filteredJsonNotJap = JSON.stringify(filteredNotJap, null, 2)

  fs.writeFile(outputJap, filteredJsonJap, 'utf8', (err) => {
    if (err) {
      console.error('Error writing to the file:', err)
      return
    }
    console.log(`Filtered data has been written to ${outputJap}`)
  })

  fs.writeFile(outputNotJap, filteredJsonNotJap, 'utf8', (err) => {
    if (err) {
      console.error('Error writing to the file:', err)
      return
    }
    console.log(`Filtered data has been written to ${outputNotJap}`)
  })
})
