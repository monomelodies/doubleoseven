
const Bond = require('../src/Bond');

describe("Bonds", () => {
    it("can be resolved", () => {
        const promise = new Bond((resolve, reject) => {
            resolve(1);
        });
        promise.then(result => {
            expect(result).toEqual(1);
        });
    });
    it("can be resolved multiple times", () => {
        var i = 0, j = 0;
        const promise = new Bond((resolve, reject) => {
            resolve(++i);
            resolve(++i);
        });
        promise.then(result => {
            expect(result).toEqual(++j);
        });
    });
    it("can be changed and change values", () => {
        const promise = new Bond((resolve, reject) => {
            resolve(1);
        });
        promise.then(result => ++result).then(result => {
            expert(result).toEqual(2);
        });
    });
    it("can catch errors if they occur", () => {
        const promise = new Bond((resolve, reject) => {
            reject("demo error");
        });
        promise.catch(error => expect(error).toEqual("demo error"));
    });
    it("support finally handlers which are always called", () => {
        const promise = new Bond((resolve, reject) => {
            resolve(1);
        });
        promise.then(res => ++res).finally(res => {
            expect(res).toEqual(2);
        });
        const promise2 = new Bond((resolve, reject) => {
            reject("demo error");
        });
        promise2.catch(error => error).finally(res => expect(res).toEqual(undefined));
    });
});

