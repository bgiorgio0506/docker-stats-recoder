"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var fs_1 = __importDefault(require("fs"));
var fs_extra_1 = __importDefault(require("fs-extra"));
var path_1 = __importDefault(require("path"));
var csv = require('csv');
var ON_DEATH = require('death'); //this is intentionally ugly
var records = [];
var file = path_1.default.resolve('C:\\Users\\User\\Desktop\\Progetti\\POSCONDev\\docker-stats-recoder', 'test\\out\\test_data_1.csv');
var stdOutArr = [];
function startTest() {
    console.log('Starting test');
    var testInterval = setInterval(function () {
        child_process_1.exec('docker stats --format "{{.CPUPerc}}\t{{.MemUsage}}" --no-stream src_flightnetcore_1', function (err, stdout) {
            if (err) {
                clearInterval(testInterval);
                throw err;
            }
            else {
                var splitStats = stdout.split(' ');
                stdOutArr.push({
                    cpu: splitStats[0],
                    memory: splitStats[1]
                });
            }
        });
    }, 5000);
}
startTest();
ON_DEATH(function (signal, err) {
    console.log("Gracefully stopping CTRL+C");
    csv.generate({
        length: stdOutArr.length
    }).on('readable', function () {
        var record;
        while (record = this.read()) {
            records.push(record);
        }
    })
        .on('error', function (err) {
        console.error(err);
    })
        .on('end', function () {
        console.log(records, file);
        fs_extra_1.default.ensureFileSync(file);
        records.map(function (buffer) {
            fs_1.default.appendFileSync(file, buffer.toString('utf8'));
        });
        process.exit();
    });
});
