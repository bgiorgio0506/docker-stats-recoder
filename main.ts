import { exec }  from 'child_process';
import { IStats } from './statsInterface';
import fs from 'fs';
import fsExtra from 'fs-extra';
import path from 'path';

const csv = require('csv');
var ON_DEATH = require('death'); //this is intentionally ugly
var records:Array<Buffer>= [];
const file = path.resolve('C:\\Users\\User\\Desktop\\Progetti\\POSCONDev\\docker-stats-recoder', 'test\\out\\test_data_1.csv');

let stdOutArr:Array<IStats>= [];


function startTest() {
  console.log('Starting test')
  let testInterval = setInterval(() => {
    exec('docker stats --format "{{.CPUPerc}}\t{{.MemUsage}}" --no-stream src_flightnetcore_1', (err, stdout) => {
      if (err) {
        clearInterval(testInterval);
        throw err
      }
      else {
          let splitStats:Array<string> = stdout.split(' ');
          stdOutArr.push({
            cpu: splitStats[0],
            memory: splitStats[1]
          })
      }
    })
  }, 5000)
}

startTest();


 
ON_DEATH(function(signal, err) {
    console.log("Gracefully stopping CTRL+C");
    csv.generate({
      length: stdOutArr.length
    }).on('readable', function(){
      let record:Buffer;
      while(record = this.read()){
        records.push(record)
      }
    })
    .on('error', function(err){
      console.error(err)
    })
    .on('end', function(){
      console.log(records, file)
      fsExtra.ensureFileSync(file);
      records.map((buffer) => {
        fs.appendFileSync(file, buffer.toString('utf8'))
      })
      process.exit();
    })
  });
