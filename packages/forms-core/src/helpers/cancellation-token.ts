import { CancellationToken } from "../contracts";

export type CancellationCallback = () => void;

export class CancellationTokenImpl implements CancellationToken {
    constructor(cancellationCallback?: CancellationCallback, protected tokenName?: string) {
        this.cancellationCallback = cancellationCallback;
    }

    protected cancelled = false;
    protected cancellationCallback?: CancellationCallback;

    public get cancellationRequested(): boolean {
        return this.cancelled;
    }

    public cancel(): void {
        if (this.cancelled) {
            return;
        }
        this.cancelled = true;
        this.cancellationCallback?.();
    }
}
