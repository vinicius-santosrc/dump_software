import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../models/api-error.model';

export class ErrorUtils {

    static parse(error: unknown): ApiError {

        if (error instanceof HttpErrorResponse) {

            if (!navigator.onLine) {
                return {
                    code: 'OFFLINE',
                    message: 'ERRORS.OFFLINE',
                    statusCode: 0
                };
            }

            switch (error.status) {

                case 0:
                    return {
                        code: 'NETWORK_ERROR',
                        message: 'ERRORS.NETWORK',
                        statusCode: 0
                    };

                case 400:
                    return {
                        code: 'BAD_REQUEST',
                        message: error.error?.message || 'ERRORS.BAD_REQUEST',
                        statusCode: 400
                    };

                case 401:
                    return {
                        code: 'UNAUTHORIZED',
                        message: 'AUTH.ERRORS.INVALID_CREDENTIALS',
                        statusCode: 401
                    };

                case 403:
                    return {
                        code: 'FORBIDDEN',
                        message: 'ERRORS.FORBIDDEN',
                        statusCode: 403
                    };

                case 404:
                    return {
                        code: 'NOT_FOUND',
                        message: 'ERRORS.NOT_FOUND',
                        statusCode: 404
                    };

                case 409:
                    return {
                        code: error.error?.code || 'CONFLICT',
                        message: error.error?.message || 'ERRORS.CONFLICT',
                        statusCode: 409
                    };

                case 500:
                    return {
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'ERRORS.SERVER_ERROR',
                        statusCode: 500
                    };

                default:
                    return {
                        code: 'UNKNOWN_ERROR',
                        message: 'ERRORS.DEFAULT',
                        statusCode: error.status
                    };
            }
        }

        return {
            code: 'UNKNOWN_ERROR',
            message: 'ERRORS.DEFAULT'
        };
    }
}