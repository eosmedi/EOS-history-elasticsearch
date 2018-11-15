var stream = require('stream'),
    fs = require('fs');

function TraceTransform(){
    var liner = new stream.Transform( { objectMode: true } )

    liner._transform = function (chunk, encoding, done) {
        console.log(chunk);
       
        done()
    }

    liner._flush = function (done) {

        done()
    }

    return liner;
}


module.exports = TraceTransform;