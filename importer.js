
const fs = require('fs');
const TRACE_DIR = './traces';
const TARGET_DIR = './traces/proccesed';
const getFileStreamer = require('./lib/filestreamer');
const elasticWriteStream = require('./lib/elasticWriteStream');
const getTraceTransform = require('./lib/traceTransform');
const moment = require('moment');
const Stream = require('stream');
const WAIT_DURATION = 60 * 1000;

if(!fs.existsSync(TARGET_DIR)){
    fs.mkdirSync(TARGET_DIR);
}

class Importer {

    constructor(DIR){
        this.dir = DIR;
        this.transforms = [];
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

    fileProccede(file, filePath){
        var date = moment().format('YYYYMMDDHHmmss');
        var targetFilePath = TARGET_DIR+'/'+file+'-'+date;
        // mv file to procceds dir
        // fs.renameSync(TRACE_DIR+'/'+file, targetFilePath);

        return filePath;
        return targetFilePath;
    }


    addTransform(transformer){
        this.transforms.push(transformer);
    }

    run(){

        try{
            var currentFile = this.getNextFile();
            if(!currentFile){
                setTimeout(() => { 
                    this.run() 
                }, WAIT_DURATION);
                console.log('empty');
                return;
            }
            
            var filePath = TRACE_DIR+'/'+currentFile;
            var targetFilePath = this.fileProccede(currentFile, filePath);
            
            var readStream = getFileStreamer(targetFilePath);
            var writeStream = new elasticWriteStream(100);
            var traceTranformer = getTraceTransform();

            this.transforms.forEach((transform) => {
                traceTranformer.use(transform);
            })

            console.log(currentFile, filePath, targetFilePath);
            // console.log(readStream._readableState);

            readStream.on('error', (er) => {
                console.log('error', er);
            });




            readStream
                .pipe(traceTranformer)
                .pipe(writeStream);

            // readStream.resume();

            readStream.on('end', () => {
                console.log(currentFile, 'done');
                writeStream.end();
                // process.exit();
                setTimeout(() => { 
                    this.run() 
                }, WAIT_DURATION);
            })
        }catch(e){
            console.log(e.stack)
        }
    }

}



var importer = new Importer(TRACE_DIR);

importer.addTransform(require('./transforms/account'));

importer.run();

