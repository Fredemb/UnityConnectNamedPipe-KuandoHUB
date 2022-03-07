const fs = require('fs'); //file system
const { get } = require('http');
const path = require('path') //file system paths

function parseXmlToJson(xml) { //function to parse xml to js obj stolen from https://stackoverflow.com/a/61593773/7624888
    const json = {};
    for (const res of xml.matchAll(/(?:<(\w*)(?:\s[^>]*)*>)((?:(?!<\1).)*)(?:<\/\1>)|<(\w*)(?:\s*)*\/>/gm)) {
        const key = res[1] || res[3]; //res[1] is tag name for opening tags, res[3] is tag name for self-closing tags (<tag/>)
        const value = res[2] && parseXmlToJson(res[2]); //res[2] is data between opening and closing tags, with recursion to handle nesting
        json[key] = ((value && Object.keys(value).length) ? value : res[2]) || null;

    }
    return json;
}

async function getRelevantPipe(directory, nameStart) {
    let allPipeNames = await fs.promises.readdir(directory)
    return allPipeNames.find(pipe => pipe.startsWith(nameStart))
}

async function listenOnPipe(pipeDirectory) {
    let relevantPipe = await getRelevantPipe(pipeDirectory, 'UnityConnect_')
    let filePath = `${parentPath}${relevantPipe}`
    let fileData = {}

    try {
        console.log(`Listening from path: ${filePath}`)
    
        const p = path.resolve(filePath)
        const fd = fs.openSync(p, 'r+')
    
        let readStream = fs.createReadStream(p, {fd}) //Listens for updates in named pipe
        readStream.on('data', (data) => {
            // console.log(data) //Prints data bytes as hex-values
            // console.log(data.toString()) //Prints data as xml string
            fileData = parseXmlToJson(data.toString()) //converts xml data to js object
            // console.log(fileData) //Prints data as json object
            let status = fileData.UnityConnect?.Command?.Status
            console.log(status)
            switch (status) {
                case 'Released':
                    get('http://localhost:8989/?action=light&red=0&green=100&blue=0') //Make light green
                    break;
                case 'Alerting':
                    get('http://localhost:8989/?action=light&red=100&green=100&blue=0') //Make light yellow
                    break;
                case 'Active':
                    get('http://localhost:8989/?action=light&red=100&green=0&blue=0') //Make light red
                    break;
                default:
                    console.error(`unhandled unity status '${status}'`)
            }
        })
    
    } catch (error) {
        console.error(`Error reading from pipe: ${error}`)
    }
}

let parentPath = '\\\\.\\pipe\\' //named pipe directory
listenOnPipe(parentPath)
