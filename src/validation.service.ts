export function isValidDomain(domain: string): boolean {
    const domainRegex = new RegExp(
        /^((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,6}$/
    );

    return domainRegex.test(domain);
}