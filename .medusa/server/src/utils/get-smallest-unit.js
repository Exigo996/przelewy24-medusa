"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSmallestUnit = getSmallestUnit;
exports.getAmountFromSmallestUnit = getAmountFromSmallestUnit;
const utils_1 = require("@medusajs/framework/utils");
function getCurrencyMultiplier(currency) {
    const currencyMultipliers = {
        0: [
            "BIF",
            "CLP",
            "DJF",
            "GNF",
            "JPY",
            "KMF",
            "KRW",
            "MGA",
            "PYG",
            "RWF",
            "UGX",
            "VND",
            "VUV",
            "XAF",
            "XOF",
            "XPF",
        ],
        3: ["BHD", "IQD", "JOD", "KWD", "OMR", "TND"],
    };
    currency = currency.toUpperCase();
    let power = 2;
    for (const [key, value] of Object.entries(currencyMultipliers)) {
        if (value.includes(currency)) {
            power = parseInt(key, 10);
            break;
        }
    }
    return Math.pow(10, power);
}
/**
 * Converts an amount to the format required by Stripe based on currency.
 * https://docs.stripe.com/currencies
 * @param {BigNumberInput} amount - The amount to be converted.
 * @param {string} currency - The currency code (e.g., 'USD', 'JOD').
 * @returns {number} - The converted amount in the smallest currency unit.
 */
function getSmallestUnit(amount, currency) {
    const multiplier = getCurrencyMultiplier(currency);
    let amount_ = Math.round(new utils_1.BigNumber(utils_1.MathBN.mult(amount, multiplier)).numeric) /
        multiplier;
    const smallestAmount = new utils_1.BigNumber(utils_1.MathBN.mult(amount_, multiplier));
    let numeric = smallestAmount.numeric;
    // Check if the currency requires rounding to the nearest ten
    if (multiplier === 1e3) {
        numeric = Math.ceil(numeric / 10) * 10;
    }
    return parseInt(numeric.toString().split(".").shift(), 10);
}
/**
 * Converts an amount from the smallest currency unit to the standard unit based on currency.
 * @param {BigNumberInput} amount - The amount in the smallest currency unit.
 * @param {string} currency - The currency code (e.g., 'USD', 'JOD').
 * @returns {number} - The converted amount in the standard currency unit.
 */
function getAmountFromSmallestUnit(amount, currency) {
    const multiplier = getCurrencyMultiplier(currency);
    const standardAmount = new utils_1.BigNumber(utils_1.MathBN.div(amount, multiplier));
    return standardAmount.numeric;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0LXNtYWxsZXN0LXVuaXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvdXRpbHMvZ2V0LXNtYWxsZXN0LXVuaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUE0Q0EsMENBbUJDO0FBUUQsOERBT0M7QUE3RUQscURBQThEO0FBRTlELFNBQVMscUJBQXFCLENBQUMsUUFBUTtJQUNyQyxNQUFNLG1CQUFtQixHQUFHO1FBQzFCLENBQUMsRUFBRTtZQUNELEtBQUs7WUFDTCxLQUFLO1lBQ0wsS0FBSztZQUNMLEtBQUs7WUFDTCxLQUFLO1lBQ0wsS0FBSztZQUNMLEtBQUs7WUFDTCxLQUFLO1lBQ0wsS0FBSztZQUNMLEtBQUs7WUFDTCxLQUFLO1lBQ0wsS0FBSztZQUNMLEtBQUs7WUFDTCxLQUFLO1lBQ0wsS0FBSztZQUNMLEtBQUs7U0FDTjtRQUNELENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDO0tBQzlDLENBQUM7SUFFRixRQUFRLEdBQUcsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ2xDLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztJQUNkLEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLEVBQUUsQ0FBQztRQUMvRCxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztZQUM3QixLQUFLLEdBQUcsUUFBUSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMxQixNQUFNO1FBQ1IsQ0FBQztJQUNILENBQUM7SUFDRCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQzdCLENBQUM7QUFFRDs7Ozs7O0dBTUc7QUFDSCxTQUFnQixlQUFlLENBQzdCLE1BQXNCLEVBQ3RCLFFBQWdCO0lBRWhCLE1BQU0sVUFBVSxHQUFHLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRW5ELElBQUksT0FBTyxHQUNULElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxpQkFBUyxDQUFDLGNBQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO1FBQ2xFLFVBQVUsQ0FBQztJQUViLE1BQU0sY0FBYyxHQUFHLElBQUksaUJBQVMsQ0FBQyxjQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO0lBRXZFLElBQUksT0FBTyxHQUFHLGNBQWMsQ0FBQyxPQUFPLENBQUM7SUFDckMsNkRBQTZEO0lBQzdELElBQUksVUFBVSxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ3ZCLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDekMsQ0FBQztJQUVELE9BQU8sUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDOUQsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0gsU0FBZ0IseUJBQXlCLENBQ3ZDLE1BQXNCLEVBQ3RCLFFBQWdCO0lBRWhCLE1BQU0sVUFBVSxHQUFHLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ25ELE1BQU0sY0FBYyxHQUFHLElBQUksaUJBQVMsQ0FBQyxjQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO0lBQ3JFLE9BQU8sY0FBYyxDQUFDLE9BQU8sQ0FBQztBQUNoQyxDQUFDIn0=