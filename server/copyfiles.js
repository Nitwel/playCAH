const { readdirSync, mkdirSync, writeFileSync, readFileSync } = require('fs')
const { join } = require('path')

copyDir('./src/decks', './dist/decks')

function copyDir(from, to, folder = '') {
    
    mkdirSync(join(to, folder), {recursive: true})

    const files = readdirSync(join(from, folder))
    files.forEach(file => {
        if(file.endsWith('.json')) {
            const fileData = readFileSync(join(from, folder, file), 'utf-8')
            writeFileSync(join(to, folder, file), fileData, {encoding: 'utf-8'})
        } else {
            copyDir(from, to, join(folder, file))
        }
    })
}