"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coerceSandbox = coerceSandbox;
function coerceSandbox(value) {
    if (typeof value === "boolean") {
        return value;
    }
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        return (normalized === "true" ||
            normalized === "1" ||
            normalized === "yes");
    }
    if (typeof value === "number") {
        return value === 1;
    }
    return false;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29lcmNlLXNhbmRib3guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvdXRpbHMvY29lcmNlLXNhbmRib3gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxzQ0FtQkM7QUFuQkQsU0FBZ0IsYUFBYSxDQUFDLEtBQWM7SUFDMUMsSUFBSSxPQUFPLEtBQUssS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUMvQixPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRCxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRSxDQUFDO1FBQzlCLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUM5QyxPQUFPLENBQ0wsVUFBVSxLQUFLLE1BQU07WUFDckIsVUFBVSxLQUFLLEdBQUc7WUFDbEIsVUFBVSxLQUFLLEtBQUssQ0FDckIsQ0FBQztJQUNKLENBQUM7SUFFRCxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRSxDQUFDO1FBQzlCLE9BQU8sS0FBSyxLQUFLLENBQUMsQ0FBQztJQUNyQixDQUFDO0lBRUQsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDIn0=