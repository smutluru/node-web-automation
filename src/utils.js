const path = require('path');
const locations = require('../locations.json');
const fs = require('fs');

module.exports = {
    renderValue: function (value, values) {
        if (value && typeof value == 'string' && value.length > 0) {
            const r = /\${\w+}/g;
            const surroundings = value.split(r);
            const keys = value.match(r);

            if (keys && keys instanceof Array && keys.length > 0) {
                let ans = surroundings[0];

                for (let i = 0; i < keys.length; i++) {
                    ans += this.renderKey(keys[i].substring(2, keys[i].length - 1), values) + surroundings[i + 1];
                }

                return ans;
            }
        }

        return value;
    },

    renderKey: function (key, values) {
        return values[key] != undefined ? values[key] : ('${' + key + '}');
    },

    assert(check, errorString) {
        if (!check) {
            throw new Error(errorString);
        }
    },

    assertNotNull(value, errorString) {
        this.assert(value != undefined && value != null, errorString);
    },

    updateFile: function (location, newFile) {
        org = fs.readFileSync(location);
        fs.writeFileSync(`${location}.${this.getFormattedDate()}.org`, org);
        fs.writeFileSync(location, JSON.stringify(newFile, null, 4));
    },

    getFormattedDate: function () {
        const d = new Date();
        return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}-${d.getHours()}-${d.getMinutes()}-${d.getSeconds()}`;
    },

    generateId: function () {
        return `${Math.floor(1 + Math.random() * 100000)}`;
    },

    obtainPath(location) {
        if (locations[location]) {
            return path.format(path.parse(path.resolve(locations[location])));
        } else {
            throw new Error(`${location} key missing in locations.json`);
        }
    },

    saveFile: function (location, file, enc) {
        fs.writeFileSync(location, file, enc);
        return location;
    },

    createDir: function (location, folderName) {
        let dirLocation = path.join(location, folderName);
        fs.mkdirSync(dirLocation);

        return dirLocation;
    },

    getDFV: function (obj, keys) {
        if (keys instanceof Array) {
            while (obj != undefined && obj != null && keys.length > 0) {
                obj = obj[keys.shift()];
            }

            return obj;
        }

        return undefined;
    }
}