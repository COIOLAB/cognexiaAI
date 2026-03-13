// Global Error Handling Utility
// Centralized error handling for TypeScript error improvements
export class ErrorHandler {
    /**
     * Safely extracts error message from unknown error
     */
    static getErrorMessage(error) {
        if (error instanceof Error) {
            return error.message;
        }
        if (typeof error === 'string') {
            return error;
        }
        return 'An unknown error occurred';
    }
    /**
     * Safely extracts error stack from unknown error
     */
    static getErrorStack(error) {
        if (error instanceof Error) {
            return error.stack;
        }
        return undefined;
    }
    /**
     * Creates a formatted error object from unknown error
     */
    static formatError(error) {
        return {
            message: this.getErrorMessage(error),
            stack: this.getErrorStack(error),
            type: error instanceof Error ? error.constructor.name : typeof error
        };
    }
    /**
     * Handles async operation errors consistently
     */
    static async handleAsyncError(operation, context, logger) {
        try {
            return await operation();
        }
        catch (error) {
            const errorMessage = this.getErrorMessage(error);
            const errorStack = this.getErrorStack(error);
            if (logger) {
                logger.error(`${context}: ${errorMessage}`, errorStack);
            }
            throw error;
        }
    }
}
//# sourceMappingURL=error-handler.util.js.map