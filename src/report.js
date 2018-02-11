const utils = require('./utils.js');
const path = require('path');

const reportFileName = 'report.html';

module.exports = class Report {
    constructor(start) {
        this.title = start.title;
        this.description = start.description;
        this.location = path.join(utils.createDir(utils.obtainPath(start.reportLocation), `test-${utils.getFormattedDate()}`), reportFileName);

        this.tss = [];
    }

    createTSReport() {
        const ts = new TSReport(path.dirname(this.location));
        this.tss.push(ts);
        return ts;
    }

    setDetails(title, description) {
        this.title = title;
        this.description = description;
    }

    compile() {
        utils.saveFile(this.location, ReportToHTML.compileReport(this));
    }
};

class TSReport {
    constructor(location) {
        this.location = path.join(utils.createDir(location, `ts-${utils.getFormattedDate()}`), reportFileName);
        this.tcs = [];
    }

    setDetails(title, description) {
        this.title = title;
        this.description = description;
    }

    createTCReport() {
        const tc = new TCReport(path.dirname(this.location));
        this.tcs.push(tc);
        return tc;
    }

    compile() {
        utils.saveFile(this.location, ReportToHTML.compileTS(this));
    }
};

class TCReport {
    constructor(location) {
        this.location = path.join(utils.createDir(location, `tc-${utils.getFormattedDate()}`), reportFileName);
        this.success = null;
        this.title = null;
        this.description = null;

        this.logs = "";
        this.imgs = [];

    }

    setDetails(title, description, _logs) {
        this.title = title;
        this.description = description;

        this.successLog = _logs ? _logs._success : undefined;
        this.failureLog = _logs ? _logs._failure : undefined;

        this.log(_logs ? _logs._start : undefined);
    }

    attachImage(data) {
        this.imgs.push({
            data,
            location: path.join(path.dirname(this.location), `img-${this.imgs.length}.png`)
        });

        this.log(`Image taken, will be saved at : ${this.imgs[this.imgs.length - 1].location}`);
    }

    fail() {
        if (this.success == null) {
            this.success = false;
            this.log(this.failureLog);
        }
    }

    pass() {
        if (this.success == null) {
            this.success = true;
            this.log(this.successLog);
        }
    }

    log(log) {
        this.logs += log ? `${log}\n` : ``;
    }

    compile() {
        this.imgs.forEach(img => utils.saveFile(img.location, img.data, 'base64'));
        utils.saveFile(this.location, ReportToHTML.compileTC(this));
    }
}

class ReportToHTML {
    static compileTC(tc) {
        return `<html>
            <head>
                <title>${tc.title}</title>
                <link href="https://fonts.googleapis.com/css?family=Ubuntu" rel="stylesheet">
                <style>
                    div{
                        font-family :  'Ubuntu', sans-serif;
                        text-align : center;
                    }
                </style>
            </head>
            <body>
                <div style="font-size: 400%">${tc.title}</div><br/>
                <div style="font-size: 125%; background-color : ${tc.success ? 'green' : 'red'};  color:white;">The Test Case was a ${tc.success ? 'Success' : 'Failure'}</div>
                <div style="font-size: 125%">${tc.description}</div><br/>
                <code>${tc.logs.replace(/\n/g, '<br/>')}</code><br/>
                <div style="text-align : left;">${ReportToHTML.getGallery(tc.imgs)}</div>
            </body>
        </html>`;
    }

    static getGallery(imgs) {
        var gallery = '';

        imgs.forEach(img => {
            gallery += `<a href="${img.location}"><img height="25%" src="${img.location}" /></a>`;
        });

        return gallery;
    }

    static compileTS(ts) {
        ts.tcs.forEach(tc => tc.compile());

        return `<html>
            <head>
                <title>${ts.title}</title>
                <link href="https://fonts.googleapis.com/css?family=Ubuntu" rel="stylesheet">
                <style>
                    div, th, tr{
                        font-family :  'Ubuntu', sans-serif;
                    }
                    div{
                        text-align : center;
                    }
                    table,th,td{
                        border: 2px solid grey;
                        border-collapse: collapse;
                        text-align : left;
                    }
                    th{
                        background-color : black;
                        color : white;
                    }
                </style>
            </head>
            <body>
                <div style="font-size: 400%">${ts.title}</div><br/>
                <div style="font-size: 125%">${ts.description}</div><br/>
                <table align="center" width="100%">
                    <colgroup>
                        <col width="80%">
                        <col width="20%">
                    </colgroup>
                    <tbody>
                        <tr>
                            <th>Test Case Title</th>
                            <th>Success?</th>
                        </tr>
                        ${ReportToHTML.getTCRows(ts.tcs)}
                    </tbody>
                </table>
            </body>
        </html>`;
    }

    static getTCRows(tcs) {
        var rows = '';

        tcs.forEach(tc => {
            rows += `<tr>
                <td><a href=${tc.location}>${tc.title}</a></td>
                <td style="background-color : ${tc.success ? 'green' : 'red'}; color : white;">${tc.success}</td>
            </tr>`;
        });

        return rows;
    }

    static compileReport(report) {
        report.tss.forEach(ts => ts.compile());

        return `<html>
            <head>
                <title>
                    ${report.title}
                </title>
                <link href="https://fonts.googleapis.com/css?family=Ubuntu" rel="stylesheet">
                <style>
                    div, th, tr{
                        font-family :  'Ubuntu', sans-serif;
                    }
                    div{
                        text-align : center;
                    }
                    table,th,td{
                        border: 2px solid grey;
                        border-collapse: collapse;
                        text-align : left;
                    }
                    th{
                        background-color : black;
                        color : white;
                    }
                </style>
            </head>
            <body>
                <div style="font-size: 400%">${report.title}</div><br/>
                <div style="font-size: 125%">${report.description}</div><br/>
                <table align="center" width="100%">
                    <colgroup>
                        <col width="100%">
                    </colgroup>
                    <tbody>
                        <tr>
                            <th>Test Suite Title</th>
                        </tr>
                        ${ReportToHTML.getTSRows(report.tss)}
                    </tbody>
                </table>
            </body>
        </html>`;
    }

    static getTSRows(tss) {
        var rows = '';

        tss.forEach(ts => {
            rows += `<tr>
                <td><a href=${ts.location}>${ts.title}</a></td>
            </tr>`;
        });

        return rows;
    }
}