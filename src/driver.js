const { Builder, By, until } = require('selenium-webdriver');

module.exports = class Driver {
    constructor() {
        this.driver = null;
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

    async click(xpath) {
        let element = await this.getElement(xpath);
        return element.click();
    }

    async type(xpath, whatToType) {
        let element = await this.getElement(xpath);
        return element.sendKeys(whatToType);
    }

    wait(xpath) {
        return this.driver.wait(until.elementIsVisible(this.getElement(xpath)));
    }

    async wait_click(xpath) {
        await this.wait(xpath);
        return this.click(xpath);
    }

    async wait_type(xpath, whatToType) {
        await this.wait(xpath);
        return this.type(xpath, whatToType);
    }

    screenshot() {
        return this.driver.takeScreenshot();
    }
};