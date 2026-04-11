export const generatePassword = (name: string): string => {
    const clean = (name.split(" ")[0] ?? name).toLowerCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${clean}@${random}`;
};