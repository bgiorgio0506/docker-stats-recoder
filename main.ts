import { exec }  from 'child_process';
import { IStats } from './statsInterface';
import fsExtra from 'fs-extra';
import path from 'path';

const ObjectsToCsv = require('objects-to-csv');
var ON_DEATH = require('death'); //this is intentionally ugly
const file = path.resolve('C:\\Users\\User\\Desktop\\Progetti\\POSCONDev\\docker-stats-recoder', 'test\\out\\test_data_1.csv');

let stdOutArr:Array<IStats>= [];
let startTestTime:number ;
let endTestTime:number ;


function startTest() {
  startTestTime = Date.now();
  console.log('Starting Test with interval 5000ms')
  let testInterval = setInterval(() => {
    exec('docker stats --format "{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" --no-stream src_flightnetcore_1', (err, stdout) => {
      if (err) {
        clearInterval(testInterval);
        throw err
      }
      else {
          let splitStats:Array<string> = stdout.split('\t');
          stdOutArr.push({
            cpu: splitStats[0],
            memory: splitStats[1], 
            netIo: splitStats[2],
            timestamp: Date.now()
          })
      }
    })
  }, 5000)
}

startTest();


 
ON_DEATH(async function(signal, err) {
    endTestTime = Date.now();
    stdOutArr = stdOutArr.map((data:IStats)=>{
        data.timestamp = (data.timestamp - startTestTime)/1000;
        return data;
    })
    console.log('Server test ended with duration: ' + ((endTestTime-startTestTime)/1000)+ 'ms exporting to csv' )
    const csv = new ObjectsToCsv(stdOutArr);
      fsExtra.ensureFileSync(file);
      fsExtra.writeFileSync(file, await csv.toString());
      process.exit();
  });
