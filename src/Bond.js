
"use strict";

var wm = new WeakMap();

function Bond(ack) {

    wm.set(this, {success: undefined, failure: undefined, always: undefined, results: [], error: undefined, next: undefined});

    ack.call(this, this.resolve.bind(this), this.reject.bind(this));

};

module.exports = Bond;

/**
 * Instance methods {{{
 */

/**
 * @param ack Callback on successfull resolution.
 * @return Bond New Bond.
 */
Bond.prototype.then = function (ack) {
    wm.get(this).success = ack;
    wm.get(this).next = chain.call(this);
    processQueue.call(this);
    return wm.get(this).next;
}

/**
 * @param ack Callback on rejection.
 * @return Bond New Bond.
 */
Bond.prototype.catch = function (ack) {
    wm.get(this).failure = ack;
    wm.get(this).next = chain.call(this);
    processQueue.call(this);
    return wm.get(this).next;
}

/**
 * @param ack Callback that is always executed.
 * @return Bond New Bond.
 */
Bond.prototype.finally = function (ack) {
    wm.get(this).always = ack;
    wm.get(this).next = chain.call(this);
    processQueue.call(this);
    return wm.get(this).next;
}

/**
 * Resolve this Bond with a certain result.
 *
 * @param mixed result
 * @return void
 */
Bond.prototype.resolve = function (result) {
    if (isThenable(result)) {
        result.then(this.resolve);
        return;
    }
    wm.get(this).results.push(result);
    processQueue.call(this);
}

/**
 * Reject this bond with a certain reason.
 *
 * @param string err
 * @return void
 */
Bond.prototype.reject = function (err) {
    wm.get(this).error = err;
    processQueue.call(this);
}

/** }}} */

/**
 * Static methods {{{
 */

/**
 * Create a new bond and fulfill it with the given value.
 *
 * @param mixed value
 * @return Bond
 */
Bond.resolve = function (value) {
    return new Bond(function (resolve, reject) {
        resolve(reason);
    });
}

/**
 * Create a new bond and reject it with the given reason.
 *
 * @param string reason
 * @return Bond
 */
Bond.reject = function (reason) {
    return new Bond(function (resolve, reject) {
        reject(reason);
    });
}

/** }}} */

/**
 * Private methods {{{
 */

/**
 * Create a new Bond to chain to.
 */
function chain() {
    return new Bond(function (resolve, reject) {
        processQueue.call(this);
    });
}

/**
 * Process the queue of outstanding resolves. If succesfull (either because a
 * `then` or `finally` handler was registered), delegates to the
 * next promise (if available), otherwise calls the failure handler.
 */
function processQueue() {
    var current = undefined;
    if (wm.get(this).error && wm.get(this).failure) {
        wm.get(this).failure.call(this, wm.get(this).error);
        wm.get(this).error = undefined;
        wm.get(this).results = [];
        if (wm.get(this).always) {
            wm.get(this).always();
        }
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

/**
 * Check to see whether a value is "thenable".
 *
 * @param mixed value
 * @return bool
 */
function isThenable(value) {
    return (typeof value.then).toLowerCase() == 'function';
}

/** }}} */

