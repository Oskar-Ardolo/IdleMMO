class ScrapReporter {
    static Logs = [];
    static ErrorsCount = 0;

    static Log(message) {
        this.Logs.push({
            Type: "log",
            Message: message
        });
    }

    static SignalWarning(message) {
        this.Logs.push({
            Type: "warning",
            Message: message
        });
    }

    static SignalError(message) {
        this.Logs.push({
            Type: "error",
            Message: message
        });
        this.ErrorsCount++;
    }
}