'use strict';

/** Every error thrown by ytdl-lite is a YTDLError with a stable `code`. */
class YTDLError extends Error {
    constructor(message, { code = 'YTDL_ERROR', status, cause } = {}) {
        super(message);
        this.name = 'YTDLError';
        this.code = code;
        if (status !== undefined) this.status = status;
        if (cause) this.cause = cause;
    }
}

module.exports = { YTDLError };
