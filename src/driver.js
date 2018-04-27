const { Builder, By, until } = require('selenium-webdriver');

const loaderTimeCheckIntervalInSeconds = 2, _loaderTimeOutInSeconds = 1800;
const defaultWaitTimeOutInSeconds = 1200;

module.exports = class Driver {
    constructor(waitTimeOutInSeconds) {
        this.driver = null;
        this.waitTimeOutInSeconds = waitTimeOutInSeconds ? waitTimeOutInSeconds : defaultWaitTimeOutInSeconds;
        this.timer = 0;
    }

    open(browser = 'chrome') {
        return this.driver = new Builder().forBrowser(browser).build();
    }

    close() {
        return this.driver.close();
    }

    goto(link) {
        return this.driver.get(link);
    }

    maximize() {
        return this.driver.manage().window().maximize();
    }

    getElement(xpath) {
        return this.driver.findElement(By.xpath(xpath));
    }

    click(xpath) {
        return this.getElement(xpath).then(_ => _.click());
    }

    click_JS(xpath){
        return this.getElement(xpath).then(_ => {
            return this.driver.executeAsyncScript((element, callback) => {
                element.click();
                callback();
            }, _);
        });
    }

    doubleClick(xpath){
        return this.getElement(xpath).then(_ => {
            return this.driver.executeAsyncScript((element, callback) => {
                let doubleClickEvent = document.createEvent('MouseEvents');
                doubleClickEvent.initEvent ('dblclick', true, true);
                element.dispatchEvent(doubleClickEvent);
                callback();
            }, _);
        });
    }

    type(xpath, whatToType) {
        return this.getElement(xpath).then(element => element.sendKeys(whatToType));
    }

    wait(xpath) {
        return this.driver.wait(until.elementLocated(By.xpath(xpath)), this.waitTimeOutInSeconds * 1000);
    }

    wait_until_enabled(xpath){
        return this.wait(xpath)
        .then(_ => this.driver.wait(() => {
            return this.getElement(xpath)
            .then(_ => this.driver.executeScript(el => !el.disabled, _));
        }, this.waitTimeOutInSeconds * 1000));
    }

    screenshot() {
        return this.driver.takeScreenshot();
    }

    switchFrame(index){
        //null index leads to parent frame
        return this.driver.switchTo().frame(index);
    }

    refresh(){
        return this.driver.navigate().refresh();
    }

    back(){
        return this.driver.navigate().back();
    }

    forward(){
        return this.driver.navigate().forward();
    }

    getWindowCount(){
        return this.driver.getAllWindowHandles()
        .then(_ => _.length);
    }
};
