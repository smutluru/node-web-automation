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
}