
"use strict";

var wm = new WeakMap();

function Bond(ack) {

    wm.set(this, {success: undefined, failure: undefined, always: undefined, results: [], error: undefined, next: undefined});

    ack.call(this, this.resolve.bind(this), this.reject.bind(this));

};

module.exports = Bond;

Bond.prototype.then = function (ack) {
    wm.get(this).success = ack;
    wm.get(this).next = chain.call(this);
    processQueue.call(this);
    return wm.get(this).next;
}

Bond.prototype.catch = function (ack) {
    wm.get(this).failure = ack;
    processQueue.call(this);
    return this;
}

Bond.prototype.finally = function (ack) {
    wm.get(this).always = ack;
    wm.get(this).next = chain.call(this);
    processQueue.call(this);
    return wm.get(this).next;
}

Bond.prototype.resolve = function (result) {
    wm.get(this).results.push(result);
    processQueue.call(this);
}

Bond.prototype.reject = function (err) {
    wm.get(this).error = err;
    processQueue.call(this);
}

function chain() {
    return new Bond(function (resolve, reject) {
        processQueue.call(this);
    });
}

function processQueue() {
    var current = undefined;
    if (wm.get(this).error && wm.get(this).failure) {
        wm.get(this).failure.call(this, wm.get(this).error);
        wm.get(this).error = undefined;
        wm.get(this).results = [];
    } else if (wm.get(this).results.length && (wm.get(this).success || wm.get(this).always)) {
        var resolver = wm.get(this).success || wm.get(this).always;
        while (wm.get(this).results.length) {
            current = resolver(wm.get(this).results.shift());
            if (wm.get(this).next && current !== undefined) {
                wm.get(this).next.resolve(current);
            }
        }
    }
}

