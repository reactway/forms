// eslint-disable-next-line @typescript-eslint/unbound-method
String.prototype.replaceAll = function(this: string, searchValue: string, replaceValue: string, ignore: boolean) {
    return this.replace(
        new RegExp(searchValue.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), ignore ? "gi" : "g"),
        typeof replaceValue === "string" ? replaceValue.replace(/\$/g, "$$$$") : replaceValue
    );
};
