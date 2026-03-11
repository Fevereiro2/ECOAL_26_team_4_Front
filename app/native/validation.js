export function validateEmail(email) {
    const trimmed = email.trim();
    if (!trimmed)
        return "Email is required.";
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(trimmed) ? null : "Enter a valid email address.";
}
export function validatePassword(password) {
    if (!password)
        return "Password is required.";
    if (password.length < 8)
        return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(password))
        return "Password must include an uppercase letter.";
    if (!/[0-9]/.test(password))
        return "Password must include a number.";
    if (!/[^A-Za-z0-9]/.test(password))
        return "Password must include a special character.";
    return null;
}
export function requiredText(value, label) {
    return value.trim() ? null : `${label} is required.`;
}
export function validateYear(value) {
    if (!value.trim())
        return "Year is required.";
    const year = Number(value);
    if (Number.isNaN(year))
        return "Year must be a valid number.";
    if (year < 1800 || year > new Date().getFullYear() + 1) {
        return `Year must be between 1800 and ${new Date().getFullYear() + 1}.`;
    }
    return null;
}
export function validateLighterForm(data) {
    const errors = {};
    const nameError = requiredText(data.name, "Name");
    const brandError = requiredText(data.brand, "Brand");
    const yearError = validateYear(data.year);
    const countryError = requiredText(data.country, "Country");
    const mechanismError = requiredText(data.mechanism, "Mechanism");
    const periodError = requiredText(data.period, "Period");
    const imageError = requiredText(data.image, "Image URL");
    const descriptionError = requiredText(data.description, "Description");
    if (nameError)
        errors.name = nameError;
    if (brandError)
        errors.brand = brandError;
    if (yearError)
        errors.year = yearError;
    if (countryError)
        errors.country = countryError;
    if (mechanismError)
        errors.mechanism = mechanismError;
    if (periodError)
        errors.period = periodError;
    if (imageError)
        errors.image = imageError;
    if (descriptionError)
        errors.description = descriptionError;
    return errors;
}
export function toSafeLighterPatch(data) {
    return {
        name: data.name.trim(),
        brand: data.brand.trim(),
        year: Number(data.year),
        country: data.country.trim(),
        mechanism: data.mechanism.trim(),
        period: data.period.trim(),
        image: data.image.trim(),
        description: data.description.trim(),
        visibility: data.visibility,
    };
}
