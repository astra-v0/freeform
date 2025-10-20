export interface Theme {
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}

export class ThemeUtils {
  static lightenColor(color: string, amount: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const r = (num >> 16) + amount;
    const b = ((num >> 8) & 0x00ff) + amount;
    const g = (num & 0x0000ff) + amount;
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  static getDefaultTheme(): Theme {
    return {
      backgroundColor: '#1d1d1d',
      textColor: '#ffffff',
      accentColor: '#4A9EFF',
    };
  }

  static mergeThemes(baseTheme: Theme, customTheme?: Partial<Theme>): Theme {
    return {
      ...baseTheme,
      ...customTheme,
    };
  }
}
