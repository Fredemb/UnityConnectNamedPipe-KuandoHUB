const fs = require('fs'); //file system
const { get } = require('http');
const path = require('path') //file system paths

var currentColor = 'green'
var colorAlternator = null

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
    let relevantPipe = allPipeNames.find(pipe => pipe.startsWith(nameStart))
    if (!relevantPipe) {
        throw new Error('The script requires Unity Client to be running on the PC, but it appears that is not')
    }
    return relevantPipe
}

function setColor(color){
    currentColor = color
    switch (color) {
        case 'green':
            get('http://localhost:8989/?action=light&red=0&green=100&blue=0') //Make light green
            break;
        case 'yellow':
            get('http://localhost:8989/?action=light&red=100&green=100&blue=0') //Make light yellow
            break;
        case 'red':
            get('http://localhost:8989/?action=light&red=100&green=0&blue=0') //Make light red
            break;
        case 'magenta':
            get('http://localhost:8989/?action=light&red=100&green=0&blue=100') //Make light magenta
            break;
        default:
            get('http://localhost:8989/?action=light&red=0&green=0&blue=0') //Turn light OFF
            currentColor = 'off'
            break;
    }
}

function alternatingColors(color1, color2) {
    colorAlternator = setInterval(() => {
        if (currentColor == color1) {
            setColor(color2)
        } else {
            setColor(color1)
        }
    }, 1000)
}

async function listenOnPipe(pipeDirectory) {
    let relevantPipe = await getRelevantPipe(pipeDirectory, 'UnityConnect_')
    let filePath = `${parentPath}${relevantPipe}`
    let fileData = {}

    try {
        console.log(`Listening from path: ${filePath}`)
    
        const p = path.resolve(filePath)
        const fd = fs.openSync(p, 'r+')
    
        let activeCallCount = 0
        let lastStatus = null
        let readStream = fs.createReadStream(p, {fd}) //Listens for updates in named pipe
        readStream.on('data', (data) => {
            if (colorAlternator){
                clearInterval(colorAlternator) //Stop any alternating colors going on
                colorAlternator = null
            }
            // console.log(data) //Prints data bytes as hex-values
            // console.log(data.toString()) //Prints data as xml string
            fileData = parseXmlToJson(data.toString()) //converts xml data to js object
            // console.log(fileData) //Prints data as json object
            let status = fileData.UnityConnect?.Command?.Status
            console.log(status)
            switch (status) {
                case 'Released':
                    activeCallCount -= 1
                    if (activeCallCount >= 1){
                        setColor('red')
                    } else {
                        setColor('green')
                        activeCallCount = 0 //Ensure activeCallCount doesn't go negative
                    }
                    break;
                case 'Alerting':
                    if (lastStatus == status){ //Do not accept multiple alerting statuses
                        activeCallCount += 1
                        if (activeCallCount > 2) {
                            console.error('ERROR: More than 2 active calls registered')
                        } else if (activeCallCount > 1) {
                            alternatingColors('yellow', 'red')
                        } else {
                            alternatingColors('yellow', 'green')
                        }
                    }
                    break;
                case 'Active':
                    setColor('red')
                    break;
                case 'Held':
                    setColor('magenta')
                    break;
                default:
                    console.error(`ERROR: unhandled unity status '${status}'`)
            }
            lastStatus = status
        })
    
    } catch (error) {
        console.error(`Error reading from pipe: ${error}`)
    }
}

let parentPath = '\\\\.\\pipe\\' //named pipe directory
listenOnPipe(parentPath)
