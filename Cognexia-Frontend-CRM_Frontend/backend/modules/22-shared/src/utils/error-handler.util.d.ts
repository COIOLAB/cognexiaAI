export declare class ErrorHandler {
    /**
     * Safely extracts error message from unknown error
     */
    static getErrorMessage(error: unknown): string;
    /**
     * Safely extracts error stack from unknown error
     */
    static getErrorStack(error: unknown): string | undefined;
    /**
     * Creates a formatted error object from unknown error
     */
    static formatError(error: unknown): {
        message: string;
        stack?: string;
        type: string;
    };
    /**
     * Handles async operation errors consistently
     */
    static handleAsyncError<T>(operation: () => Promise<T>, context: string, logger?: {
        error: (message: string, ...args: any[]) => void;
    }): Promise<T>;
}
//# sourceMappingURL=error-handler.util.d.ts.map