const utils = require('./utils.js');
const Procedures = require('./procedures.js');

module.exports = class CommandRunner {
    static exeCMD(cmd, report, values, driver) {
        report.log(cmd._logs ? cmd._logs._start : undefined);

        this.initCMDValues(cmd, values);

        switch (cmd.op) {
            case 'use': {
                this.assertCMD(cmd, ['location']);
                report.log(`[${cmd._id}] : Using Test Case @ location : ${cmd.location}`);

                let valuesCopy = values;
                if(cmd._values){
                    valuesCopy = Object.assign(valuesCopy, cmd._values);
                }

                let TestRunner = require('./test-runner.js');
                return TestRunner.executeTC(cmd.location, report, valuesCopy, driver);
            }

            case 'call': {
                this.assertCMD(cmd, ['procedure', 'inputs']);
                report.log(`[${cmd._id}] : Calling procedure : ${cmd.procedure}`);

                return Procedures.call(cmd, report, values, driver);
            }

            case 'open': {
                report.log(`[${cmd._id}] : Opening Browser`);

                return driver.open(cmd._browser);
            }

            case 'maximize': {
                report.log(`[${cmd._id}] : Maximizing browser`);

                return driver.maximize();
            }

            case 'close': {
                report.log(`[${cmd._id}] : Closing Browser`);

                return driver.close();
            }

            case 'goto': {
                this.assertCMD(cmd, ['value']);
                report.log(`[${cmd._id}] : Going to link ${cmd.value}`);

                return driver.goto(cmd.value);
            }

            case 'check': {
                this.assertCMD(cmd, ['xpath']);
                report.log(`[${cmd._id}] : Checking if element is present @ xpath ${cmd.xpath}`);

                return driver.getElement(cmd.xpath);
            }

            case 'click': {
                this.assertCMD(cmd, ['xpath']);
                report.log(`[${cmd._id}] : Clicking element @ xpath ${cmd.xpath}`);

                return driver.click(cmd.xpath);
            }

            case 'click-js': {
                this.assertCMD(cmd, ['xpath']);
                report.log(`[${cmd._id}] : Clicking element @ xpath ${cmd.xpath} via JS`);

                return driver.click_JS(cmd.xpath);
            }

            case 'double-click' : {
                this.assertCMD(cmd, ['xpath']);
                report.log(`[${cmd._id}] : Double Clicking element @ xpath ${cmd.xpath}`);

                return driver.doubleClick(cmd.xpath);
            }

            case 'type': {
                this.assertCMD(cmd, ['xpath', 'value']);
                report.log(`[${cmd._id}] : Typing ${cmd.value} @ xpath ${cmd.xpath}`);

                return driver.type(cmd.xpath, cmd.value);
            }

            case 'screenshot': {
                report.log(`[${cmd._id}] : Taking screenshot`);

                return driver.screenshot()
                    .then(photo => {
                        report.attachImage(photo);
                    });
            }

            case 'switch-frame': {
                this.assertCMD(cmd, ['index']);
                report.log(`[${cmd._id}] : Switching Frame to ${cmd.index >= 0? ('frame # ' + cmd.index) : 'parent frame'}`);

                return driver.switchFrame(cmd.index >= 0 ? cmd.index : null);
            }

            case 'wait': {
                this.assertCMD(cmd, ['xpath']);
                report.log(`[${cmd._id}] : Waiting for element @ xpath ${cmd.xpath}`);

                return driver.wait(cmd.xpath);
            }

            case 'wait-until-enabled': {
                this.assertCMD(cmd, ['xpath']);
                report.log(`[${cmd._id}] : Waiting for element @ xpath ${cmd.xpath} and for it to get enabled.`);

                return driver.wait_until_enabled(cmd.xpath);
            }

            case 'wait-click': {
                this.assertCMD(cmd, ['xpath']);
                report.log(`[${cmd._id}] : Waiting for element @ xpath ${cmd.xpath}, then will click`);

                return driver.wait(cmd.xpath).then(_ => driver.click(cmd.xpath));
            }

            case 'wait-click-js':{
                this.assertCMD(cmd, ['xpath']);
                report.log(`[${cmd._id}] : Waiting for element @ xpath ${cmd.xpath}, then will click via JS`);

                return driver.wait(cmd.xpath).then(_ => driver.click_JS(cmd.xpath));
            }

            case 'wait-double-click': {
                this.assertCMD(cmd, ['xpath']);
                report.log(`[${cmd._id}] : Waiting for element @ xpath ${cmd.xpath}, then will double click`);

                return driver.wait(cmd.xpath).then(_ => driver.doubleClick(cmd.xpath));
            }

            case 'wait-type': {
                this.assertCMD(cmd, ['xpath', 'value']);
                report.log(`[${cmd._id}] : Waiting for element @ xpath ${cmd.xpath}, then will type ${cmd.value}`);

                return driver.wait(cmd.xpath).then(_ => driver.type(cmd.xpath, cmd.value));
            }

            default: {
                report.log(`[${cmd._id}] : No op found in this command`);

                return Promise.resolve();
            }
        }
    }

    static initCMDValues(cmd, values) {
        if (cmd._logs) {
            cmd._logs._start = utils.renderValue(cmd._logs._start, values);
            cmd._logs._success = utils.renderValue(cmd._logs._success, values);
            cmd._logs._failure = utils.renderValue(cmd._logs._failure, values);
        }

        cmd.value = utils.renderValue(cmd.value, values);
        cmd.xpath = utils.renderValue(cmd.xpath, values);
        cmd._browser = utils.renderValue(cmd._browser, values);

        return cmd;
    }

    static assertCMD(cmd, keys) {
        let missingKeys = keys.filter(key => cmd[key] == undefined || cmd[key] == null);

        if (missingKeys.length > 0) {
            throw new Error(`Following keys are missing from the command : ${missingKeys}`);
        }
    }
};
