const utils = require('./utils.js');

module.exports = class Procedures {
    static call(cmd, report, values, driver) {
        if (Procedures[cmd.procedure]) {

            for (let key in cmd.inputs) {
                cmd.inputs[key] = utils.renderValue(cmd.inputs[key], values);
            }

            return Procedures[cmd.procedure](cmd, report, values, driver);
        } else {
            throw new Error(`Unable to locate Procedure by the name : ${cmd.procedure}`);
        }
    }

    static waitTime(cmd, report) {
        let { inputs } = cmd;
        utils.assertNotNull(inputs.time, "Procedure waitTime needs time as input");
        report.log(`[${cmd._id}] : Procedure ${cmd.procedure} called successfully
        Will wait ${inputs.time} seconds`);

        return new Promise(res => {
            setTimeout(() => {
                report.log(`[${cmd._id}] : Procedure ${cmd.procedure} waiting completed`);
                res();
            }, inputs.time * 1000);
        });
    }
    
    static closeNewWindow(cmd, report, values, driver) {
        driver = driver.driver;

        var currentHandle;

        return driver.getWindowHandle()
            .then(_ => currentHandle = _)
            .then(_ => driver.getAllWindowHandles())
            .then(_ => driver.switchTo().window(_[_.length - 1]))
            .then(_ => driver.close())
            .then(_ => driver.switchTo().window(currentHandle));
    }
    
    static waitRefresh(cmd, report, values, driver){
        utils.assertNotNull(cmd.inputs.xpath, "Procedure waitRefresh needs xpath as input");
        utils.assertNotNull(cmd.inputs.xpathLoadedCheck, "Procedure waitRefresh needs xpathLoadedCheck as input");
        let maxAttempts = cmd.inputs._maxAttempts ? cmd.inputs._maxAttempts : defaultMaxRefreshAttempts;
        let intervalInSeconds = cmd.inputs._interval ? cmd.inputs._interval : defaultRefreshIntervalInSeconds;
        report.log(`Will wait for element @ ${cmd.inputs.xpath} and refresh page each ${intervalInSeconds} upto ${maxAttempts} times.`);
        return waitForElementRefreshRepeat(driver, cmd.inputs.xpath, cmd.inputs.xpathLoadedCheck, intervalInSeconds, maxAttempts);
    }
    
    static function waitForElementRefreshRepeat(driver, xpath, xpathLoadedCheck, intervalInSeconds, attemptsLeft){
        console.log(`Reloaded. ${attemptsLeft} attempts left.`);

        return driver.wait(xpathLoadedCheck)
        .then(_ => driver.getElement(xpath))
        .catch(_ => {
            if(attemptsLeft > 0){
                console.log(`Will wait for ${intervalInSeconds} seconds, then reload.`);
                return new Promise(res => setTimeout(() => res(), intervalInSeconds * 1000))
                .then(_ => driver.refresh())
                .then(_ => waitForElementRefreshRepeat(driver, xpath, xpathLoadedCheck, intervalInSeconds, --attemptsLeft));
            }

            return Promise.reject();
        });
    }
}
