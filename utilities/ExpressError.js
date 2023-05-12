class ExpressError extends Error {
    constructor(errCode, msg) {
        super();
        this.errCode = errCode;
        this.msg = msg;
    }
}

module.exports = ExpressError;
