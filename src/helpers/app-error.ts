export class AppError extends Error {
    public status: 'fail' | 'error';
    public httpCode: number;
    public isOperational?: boolean;

    constructor(
        message: string,
        httpCode: number,
        isOperational: boolean = true
    ) {
        super(message);

        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain

        this.status = httpCode.toString().startsWith('4') ? 'fail' : 'error';
        this.httpCode = httpCode;
        this.isOperational = isOperational;

        Error.captureStackTrace(this, this.constructor);
    }
}
