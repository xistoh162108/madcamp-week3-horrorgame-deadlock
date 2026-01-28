export function corruptText(text: string, intensity: number, seed: number = 0): string {
  if (intensity <= 0) return text;

  // Reduce intensity effect for readability unless extremely high
  const corruptionChance = Math.min(0.5, intensity * 0.4);
  const chars = text.split('');
  
  // Zalgo-like or garbage chars
  const garbage = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '{', '}', '[', ']', '|', '\\', ';', ':', '"', '<', '>', '?', '/'];
  
  // Substitution rules based on visual similarity or pure chaos
  const substitutions: Record<string, string[]> = {
    'a': ['@', '4', 'A', 'a'],
    'e': ['3', 'E', 'e'],
    'i': ['1', '!', '|', 'i'],
    'o': ['0', 'O', 'o'],
    's': ['$', '5', 'S', 's'],
    't': ['7', '+', 'T', 't'],
  };

  return chars.map((char, index) => {
    // Only corrupt alphanumeric characters
    if (!char.match(/[a-z0-9]/i)) return char;

    const noise = Math.sin(index * 1337 + seed * 42) * 0.5 + 0.5; // Pseudo-random based on seed and position

    if (noise < corruptionChance) {
      // Apply substitution
      const sub = substitutions[char.toLowerCase()];
      if (sub) {
        return sub[Math.floor(Math.random() * sub.length)];
      }
      // Or random garbage
      return garbage[Math.floor(Math.random() * garbage.length)];
    }
    
    // Insert "HELP ME" at very high intensity
    if (intensity > 0.8 && Math.random() < 0.005) {
        return "HELP ME";
    }

    return char;
  }).join('');
}
