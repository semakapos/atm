
/**
 * Service to handle safe arithmetic operations and avoid floating point errors.
 * All monetary values are handled with 2 decimal precision.
 */

export const roundToTwo = (num: number): number => {
    return Math.round((num + Number.EPSILON) * 100) / 100;
};

export const safeAdd = (...nums: number[]): number => {
    const sum = nums.reduce((acc, curr) => acc + curr, 0);
    return roundToTwo(sum);
};

export const safeSub = (a: number, b: number): number => {
    return roundToTwo(a - b);
};

export const safeMult = (a: number, b: number): number => {
    return roundToTwo(a * b);
};

export const safeDiv = (a: number, b: number): number => {
    if (b === 0) return 0;
    return roundToTwo(a / b);
};

export const parseAmount = (value: string | number | undefined | null): number => {
    if (value === undefined || value === null || value === '') return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
};
