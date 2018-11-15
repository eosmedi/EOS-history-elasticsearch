
const fs = require('fs');
const TRACE_DIR = './traces';
const TARGET_DIR = './traces/proccesed';
const getFileStreamer = require('./filestreamer');
const elasticWriteStream = require('./elasticWriteStream');
const getTraceTransform = require('./traceTransform');
const moment = require('moment');
var Stream = require('stream');

if(!fs.existsSync(TARGET_DIR)){
    fs.mkdirSync(TARGET_DIR);
}

class Importer {

    constructor(DIR){
        this.dir = DIR;
    }

    getNextFile(){
        var currentFiles = fs.readdirSync(TRACE_DIR);
        for (let index = 0; index < currentFiles.length; index++) {
            const currentFile = currentFiles[index];
            var filePath = TRACE_DIR+'/'+currentFile;
            var status = fs.lstatSync(filePath);
            if(!status.isDirectory()){
                return currentFile;
                break;
            }
        }
    }

    fileProccede(file){
        var date = moment().format('YYYYMMDDHHmmss');
        var targetFilePath = TARGET_DIR+'/'+file+'-'+date;
        // mv file to procceds dir
        fs.renameSync(TRACE_DIR+'/'+file, targetFilePath);

        return targetFilePath;
    }

    run(){

        var currentFile = this.getNextFile();
        if(!currentFile){
            setTimeout(() => { 
                this.run() 
            }, 100);
            return;
        }
        
        var filePath = TRACE_DIR+'/'+currentFile;
        var targetFilePath = this.fileProccede(currentFile);
        var readStream = getFileStreamer(targetFilePath);
        var writeStream = new elasticWriteStream(100);
        var traceTranformer = getTraceTransform();

        console.log(currentFile, filePath, targetFilePath);

        readStream.on('readable', () => {
            console.log('readable')
        })


        var writable = Stream.Writable({
            objectMode: true,
            write: function(line, _, next) {
                console.log('line', line);
            }
        })

        readStream.pipe(writable);

        // readStream
        //     .pipe(traceTranformer)
        //     .pipe(writeStream);

        readStream.on('end', () => {
            writeStream.end();
            console.log(currentFile, 'done');
            // process.exit();
            setTimeout(() => { 
                this.run() 
            }, 100);
        })
    }

}



var importer = new Importer(TRACE_DIR);
importer.run();