const Report = require('./report.js');
const parser = require('./parser');
const utils = require('./utils.js');
const Driver = require('./driver.js');
const CommandRunner = require('./command-runner.js');

module.exports = class TestRunner {
    constructor(start) {
        this.start = start;
        parser.parseStart(this.start);
        this.report = new Report(this.start);
    }

    run() {
        var p = Promise.resolve();

        this.start.tss.forEach(ts => {
            let tsReport = this.report.createTSReport();

            p = p.then(_ => {
                return TestRunner.executeTS(ts.location, tsReport, Object.assign({}, this.start.values));
            }).catch(_ => {
            });
        });

        return p.then(_ => this.report.compile());
    }

    static executeTS(location, report, values) {
        parser.parseTS(utils.obtainPath(location));
        const ts = require(utils.obtainPath(location));
        values = Object.assign(values, ts.values);
        var p = Promise.resolve();

        report.setDetails(ts.title, ts.description);

        ts.tcs.forEach(tc => {
            let tcReport = report.createTCReport();

            p = p.then(_ => {
                return TestRunner.executeTC(tc.location, tcReport, Object.assign({}, values));
            }).then(_ => {
                tcReport.pass();
            }).catch(_ => {
                tcReport.log(_);
                tcReport.fail();
            }).catch(_ => { });
        });

        return p;
    }

    static executeTC(location, report, values, driver) {
        parser.parseTC(utils.obtainPath(location));
        const tc = require(utils.obtainPath(location));
        values = Object.assign(values, tc.values);
        var p = Promise.resolve();

        if (driver == undefined) {
            driver = new Driver();
            report.setDetails(tc.title, tc.description, tc._logs);
        }

        tc.commands.forEach(cmd => {
                p = p.then(_ => {
                    return _ && _.end ? _ :
                        CommandRunner.exeCMD(cmd, report, values, driver);
                }).then(_ => {
                    return _ && _.end ? _ :
                        report.log(utils.getDFV(cmd, ['_logs', '_success']));
                }).catch(_ => {
                    report.log(`Error in ${cmd._id}`);
                    report.log(_);
                    report.log(utils.getDFV(cmd, ['_logs', '_failure']));

                    if (cmd._isOptional) {
                        report.log(`${cmd._id} failed but continuing execution`);
                    } else {
                        report.fail();

                        return driver.screenshot().then(_ => {
                            report.attachImage(_);
                        }).then(_ => {
                            //return driver.close()
                        })
                        .then(_ => {
                            return {end: true};
                        }).catch(_ => {
                            return {end: true};
                        });
                    }

                    return Promise.resolve();
                }).catch(_ => { });
            });

        return p;
    }
};
