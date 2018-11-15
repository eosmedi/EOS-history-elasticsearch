import { setTimeout } from 'timers';

const fs = require('fs');
const TRACE_DIR = './traces';
const TARGET_DIR = './traces/proccesed';
const getFileStreamer = require('./filestreamer');
const elasticWriteStream = require('./elasticWriteStream');
const getTraceTransform = require('./traceTransform');


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
                return filePath;
                break;
            }
        }
    }

    fileProccede(file){

        var date = moment().format('YYYYMMDDHHmmss');
        var targetFilePath = TARGET_DIR+'/'+file+'-'+date;
        // mv file to procceds dir
        fs.renameSync(file, targetFilePath);

    }

    run(){

        var currentFile = this.getNextFile();
        if(!currentFile){
            setTimeout(() => { 
                this.run() 
            }, 100);
        }

        var readStream = getFileStreamer(currentFile);
        var writeStream = new elasticWriteStream(100);
        var traceTranformer = getTraceTransform();

        readStream
            .pipe(traceTranformer)
            .pipe(writeStream);

        // readStream.pipe(writeStream);
        readStream.on('end', () => {
            writeStream.end();
            console.log(currentFile, 'done');
            this.fileProccede(currentFile);
            setTimeout(() => { 
                this.run() 
            }, 100);
        })
        // console.log(currentFile);
    }

}

var currentFiles = fs.readdirSync(TRACE_DIR);


var importer = new Importer(TRACE_DIR);
importer.run();