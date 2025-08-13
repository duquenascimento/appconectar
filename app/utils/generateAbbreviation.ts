export function generateAbbreviation(name: string): string {
    const words = name.replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/);
    
    const abbreviation = words
      .filter(word => word.length > 0)
      .map(word => word.charAt(0))
      .join('');

    return abbreviation.substring(0, 2).toUpperCase();
  }