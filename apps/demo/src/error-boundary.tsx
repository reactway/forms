import React, { ErrorInfo } from "react";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ErrorBoundaryProps {}

export interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    // public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    //     // Update state so the next render will show the fallback UI.
    //     return {
    //         hasError: true,
    //         error: error
    //     };
    // }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.setState({
            hasError: true,
            error: error,
            errorInfo: errorInfo
        });
    }

    public render(): React.ReactNode {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div>
                    <h1>Oh-oh.</h1>
                    <pre>{this.state.error?.name}</pre>
                    <pre>{this.state.error?.message}</pre>
                    <pre>'{this.state.errorInfo?.componentStack}'</pre>
                    <pre>{this.state.error?.stack}</pre>
                </div>
            );
        }

        return this.props.children;
    }
}
