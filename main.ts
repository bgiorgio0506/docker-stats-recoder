import { exec }  from 'child_process'
const csv = require('csv');
var ON_DEATH = require('death'); //this is intentionally ugly

let stdOutArr:Array<String>= [];


let testInterval = setInterval(()=>{
    exec('docker stats --format "{{.CPUPerc}}\t{{.MemUsage}}" --no-stream src_flightnetcore_1',(err, stdout)=>{
        if(err){
            clearInterval(testInterval);
            throw err
        }
        else stdOutArr.push(stdout);
    })
}, 5000)

 
ON_DEATH(function(signal, err) {
    console.log("Grcefully stopping CTRL+C");
    console.log(stdOutArr);
    csv.generate({
        delimiter: ' ',
        length: stdOutArr.length
    }).pipe(csv.parse({
        delimiter: ' '
      }))
      // Transform each value into uppercase
      .pipe(csv.transform(function(record){
         return record.map(function(value){
           return value.toUpperCase()
         });
      }))
      // Convert the object into a stream
      .pipe(csv.stringify({
        quoted: true
      }))
      // Print the CSV stream to stdout
      .pipe(process.stdout)
    process.exit();
})
