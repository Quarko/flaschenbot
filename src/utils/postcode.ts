export function validatePostcode(postcode: string): boolean {
    const regExp = new RegExp(/^(?!01000|99999)(0[1-9]\d{3}|[1-9]\d{4})$/);
    return regExp.test(postcode);
}
