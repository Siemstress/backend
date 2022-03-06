export class CallbackManager {

    static callbacks = {};

    static registerCallback(flag: string, callback: Function) {
        this.callbacks[flag] = callback;
    }

    static executeCallback(flag: string, data: any) {
        try {
            this.callbacks[flag](data);
            this.callbacks[flag] = undefined;
        } catch (ignored) {
        }
    }
}
