const fs = require('fs');
const utils = require('./utils');

module.exports = parser = {
    parseStart: function (start) {
        utils.assertNotNull(start.title, "start.json must have a title.");
        utils.assertNotNull(start.description, "start.json must have a description.");
        utils.assertNotNull(start.reportLocation, "start.json must have a Report Location.");
        utils.assertNotNull(start.values, "start.json must have values object, even if it is empty.");
        utils.assert(start.tss && start.tss instanceof Array && start.tss.length > 0,
            "start.json must have tss array with atleast one element.");

        start.tss.forEach(ts => {
            utils.assertNotNull(ts.location, `Location missing for one of the test-suite element.`);
            utils.obtainPath(ts.location);
        });
    },

    parseTS: function (location) {
        var ts = require(location);

        utils.assertNotNull(ts.title, "Test Suite must have a title.");
        utils.assertNotNull(ts.description, "Test Suite must have a description.");
        utils.assertNotNull(ts.values, "Test Suite must have values object, even if it is empty.");
        utils.assert(ts.tcs && ts.tcs instanceof Array && ts.tcs.length > 0,
            "Test Suite must have tcs array with atleast one element");

        if (this.populateArrayWithId(ts.tcs)) {
            utils.updateFile(location, ts);
        }

        ts = require(location);

        ts.tcs.forEach(tc => {
            utils.assertNotNull(tc.location, `Location missing for TC ID : ${tc._id}`);
            utils.obtainPath(tc.location);
        });
    },

    parseTC: function (location) {
        var tc = require(location);
        let needUpdate = false;

        utils.assertNotNull(tc.title, "Test Case must have a title.");
        utils.assertNotNull(tc.description, "Test Case must have a description.");
        utils.assertNotNull(tc.values, "Test Case must have values object, even if it is empty.");
        utils.assert(tc.commands && tc.commands instanceof Array && tc.commands.length > 0,
            "Test Case must have a commands array with atleast one element");

        if (this.populateArrayWithId(tc.commands)) {
            utils.updateFile(location, tc);
        }
    },

    populateArrayWithId(arrayWithId) {
        const idSet = this.populateIdSet(arrayWithId);
        let needUpdate = false;

        arrayWithId.forEach(a => {
            if (a._id == undefined) {
                a._id = this.getIdNotInSet(idSet);
                idSet.add(a._id);
                needUpdate = true;
            }
        });

        return needUpdate;
    },

    populateIdSet(arrayWithId) {
        const idSet = new Set();

        arrayWithId.forEach(a => {
            if (a._id) {
                if (idSet.has(a._id)) {
                    throw new Error(`Parse Exception : Duplicate id found : ${a._id}
                    \nFound in element : \n${JSON.stringify(a)}`);
                } else {
                    idSet.add(a._id);
                }
            }
        });

        return idSet;
    },

    getIdNotInSet(idSet) {
        let id = null;

        do {
            id = utils.generateId();
        } while (idSet.has(id));

        return id;
    }
};