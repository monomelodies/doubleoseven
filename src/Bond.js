
"use strict";

module.exports = function Bond(ack) {

    var success = undefined;
    var failure = undefined;
    var always = undefined;
    var results = [];
    var error = undefined;
    var next = undefined;
    var instances = 0;

    this.then = function (ack) {
        success = ack;
        next = chain.call(this);
        processQueue.call(this);
        return next;
    }

    this['catch'] = function (ack) {
        failure = ack;
        processQueue.call(this);
        return this;
    }

    this['finally'] = function (ack) {
        always = ack;
        next = chain.call(this);
        processQueue.call(this);
        return next;
    }

    this.resolve = function (result) {
        results.push(result);
        processQueue.call(this);
    }

    this.reject = function (err) {
        error = err;
        processQueue.call(this);
    }

    function chain() {
        return new Bond(function (resolve, reject) {
            processQueue.call(this);
        });
    }

    function processQueue() {
        var current = undefined;
        if (error && failure) {
            failure.call(this, error);
            error = undefined;
            results = [];
        } else if (results.length && (success || always)) {
            var resolver = success || always;
            while (results.length) {
                current = resolver(results.shift());
                if (next && current !== undefined) {
                    next.resolve(current);
                }
            }
        }
    }

    ack.call(this, this.resolve.bind(this), this.reject.bind(this));

};

