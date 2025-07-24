import { Dimensions, PixelRatio, StyleSheet } from 'react-native';

// Get screen dimensions for responsive calculations
const { width, height } = Dimensions.get('window');
const scale = PixelRatio.get();

// Mobile screen size categories with better breakpoints
const BREAKPOINTS = {
  small: 320,
  medium: 375,
  large: 414,
  xlarge: 480,
  tablet: 768,
} as const;

const isSmallScreen = width < BREAKPOINTS.medium;
const isMediumScreen = width >= BREAKPOINTS.medium && width < BREAKPOINTS.large;
const isLargeScreen = width >= BREAKPOINTS.large && width < BREAKPOINTS.tablet;
const isTablet = width >= BREAKPOINTS.tablet;

// Improved TypeScript interfaces
interface ColorToken {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  contrast: string;
}

interface SemanticColor {
  light: string;
  main: string;
  dark: string;
  contrast: string;
}

interface Typography {
  families: {
    display: string;
    body: string;
    mono: string;
  };
  scale: Record<string, number>;
  weights: Record<string, number>;
  lineHeights: Record<string, number>;
  letterSpacing: Record<string, number>;
}

interface ComponentStyles {
  [key: string]: any;
}

// Enhanced pixel conversion with better error handling
const pixelToRN = (value: string | number): number => {
  if (typeof value === 'number') return value;
  
  const stringValue = String(value).trim();
  
  // Handle rem units (1rem = 16px)
  if (stringValue.includes('rem')) {
    const numValue = parseFloat(stringValue);
    return isNaN(numValue) ? 0 : Math.round(numValue * 16);
  }
  
  // Handle clamp() function - use middle value as fallback
  if (stringValue.includes('clamp(')) {
    const clampMatch = stringValue.match(/clamp$$([^,]+),([^,]+),([^)]+)$$/);
    if (clampMatch) {
      const middleValue = clampMatch[2].trim();
      if (middleValue.includes('vw')) {
        // Better vw approximation based on screen width
        const vwValue = parseFloat(middleValue);
        return Math.round((vwValue * width) / 100);
      }
      return pixelToRN(middleValue);
    }
  }
  
  // Handle percentage values
  if (stringValue.includes('%')) {
    const percentage = parseFloat(stringValue);
    return isNaN(percentage) ? 0 : percentage;
  }
  
  // Handle regular pixel values
  const numValue = parseFloat(stringValue);
  return isNaN(numValue) ? 0 : Math.round(numValue);
};

// Improved style conversion with better property handling
const convertStyle = (style: any): any => {
  if (!style || typeof style !== 'object') return {};
  
  const rnStyle: any = { ...style };
  
  // Convert dimensional properties
  const dimensionalProps = [
    'borderRadius', 'padding', 'paddingHorizontal', 'paddingVertical',
    'margin', 'marginTop', 'marginBottom', 'marginHorizontal',
    'fontSize', 'lineHeight', 'letterSpacing', 'width', 'height',
    'maxWidth', 'minHeight', 'top', 'right', 'left', 'bottom'
  ];
  
  dimensionalProps.forEach(prop => {
    if (rnStyle[prop] !== undefined && rnStyle[prop] !== 'auto' && rnStyle[prop] !== '100%') {
      rnStyle[prop] = pixelToRN(rnStyle[prop]);
    }
  });
  
  // Handle special cases
  if (rnStyle.position === 'fixed') {
    rnStyle.position = 'absolute';
  }
  
  // Convert fontWeight to numbers
  if (rnStyle.fontWeight && typeof rnStyle.fontWeight === 'string') {
    const weightMap: Record<string, number> = {
      '100': 100, '200': 200, '300': 300, '400': 400, '500': 500,
      '600': 600, '700': 700, '800': 800, '900': 900,
      'normal': 400, 'bold': 700, 'lighter': 300, 'bolder': 600
    };
    rnStyle.fontWeight = weightMap[rnStyle.fontWeight] || 400;
  }
  
  // Remove unsupported properties
  const unsupportedProps = [
    'gap', 'backdropFilter', 'transition', 'cursor', 'outline',
    'userSelect', 'boxShadow', 'display', 'textTransform'
  ];
  
  unsupportedProps.forEach(prop => {
    delete rnStyle[prop];
  });
  
  // Handle auto margins
  if (rnStyle.marginTop === 'auto' || rnStyle.marginHorizontal === 'auto') {
    delete rnStyle.marginTop;
    delete rnStyle.marginHorizontal;
  }
  
  // Remove gradient backgrounds (use react-native-linear-gradient instead)
  if (rnStyle.backgroundImage?.includes('gradient')) {
    delete rnStyle.backgroundImage;
  }
  
  return rnStyle;
};

// Enhanced color system with better semantic colors
const colors = {
  primary: {
    50: '#fdf2f4',
    100: '#fce7eb',
    200: '#f9d0d9',
    300: '#f4a6b7',
    400: '#ed7590',
    500: '#d63384',
    600: '#c02a74',
    700: '#a02464',
    800: '#85205a',
    900: '#6f1e52',
    contrast: '#ffffff',
  } as ColorToken,
  
  secondary: {
    50: '#f6f8f6',
    100: '#e8f0e8',
    200: '#d3e2d3',
    300: '#b0ccb0',
    400: '#85b085',
    500: '#6b9b6b',
    600: '#5a8a5a',
    700: '#4a734a',
    800: '#3d5e3d',
    900: '#344f34',
    contrast: '#ffffff',
  } as ColorToken,
  
  neutral: {
    50: '#fafaf9',
    100: '#f7f6f4',
    200: '#ede9e6',
    300: '#ddd6d1',
    400: '#b8aca4',
    500: '#8b7d74',
    600: '#6b5d54',
    700: '#524842',
    800: '#3a332e',
    900: '#2a241f',
    contrast: '#ffffff',
  } as ColorToken,
  
  semantic: {
    error: {
      light: '#fef2f2',
      main: '#e11d48',
      dark: '#be123c',
      contrast: '#ffffff',
    } as SemanticColor,
    warning: {
      light: '#fffbeb',
      main: '#f59e0b',
      dark: '#d97706',
      contrast: '#000000',
    } as SemanticColor,
    success: {
      light: '#f0fdf4',
      main: '#22c55e',
      dark: '#16a34a',
      contrast: '#ffffff',
    } as SemanticColor,
    info: {
      light: '#f0f9ff',
      main: '#0ea5e9',
      dark: '#0284c7',
      contrast: '#ffffff',
    } as SemanticColor,
  },
  
  surface: {
    primary: '#ffffff',
    secondary: '#fafaf9',
    tertiary: '#f7f6f4',
    elevated: '#ffffff',
    overlay: 'rgba(42, 36, 31, 0.75)',
    glass: 'rgba(247, 246, 244, 0.9)',
  },
  
  text: {
    primary: '#2a241f',
    secondary: '#524842',
    tertiary: '#8b7d74',
    inverse: '#ffffff',
    accent: '#d63384',
    muted: '#b8aca4',
  },
};

// Improved typography system
const typography: Typography = {
  families: {
    display: 'System',
    body: 'System',
    mono: 'Courier New',
  },
  
  scale: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },
  
  weights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  
  letterSpacing: {
    tighter: -0.8,
    tight: -0.4,
    normal: 0,
    wide: 0.4,
    wider: 0.8,
  },
};

// Enhanced spacing system with better mobile considerations
const spacing = {
  unit: 8,
  scale: {
    0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32,
    10: 40, 12: 48, 16: 64, 20: 80, 24: 96, 32: 128,
  },
  mobile: {
    header: 60,
    content: 16,
    tabBar: 80,
    safeArea: 44,
  },
};

// Enhanced shadow system for React Native
const shadows = {
  none: {},
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Enhanced component styles with better organization
const components: ComponentStyles = {
  header: {
    base: convertStyle({
      height: spacing.mobile.header,
      backgroundColor: colors.surface.primary,
      borderBottomWidth: 1,
      borderBottomColor: colors.neutral[200],
      ...shadows.sm,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.scale[4],
    }),
    
    title: convertStyle({
      fontSize: typography.scale.lg,
      fontWeight: typography.weights.semibold,
      color: colors.text.primary,
      textAlign: 'center',
      flex: 1,
    }),
  },
  
  button: {
    base: convertStyle({
      paddingVertical: spacing.scale[3],
      paddingHorizontal: spacing.scale[6],
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44, // Accessibility minimum
    }),
    
    variants: {
      primary: convertStyle({
        backgroundColor: colors.primary[500],
        ...shadows.base,
      }),
      secondary: convertStyle({
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.secondary[500],
      }),
      ghost: convertStyle({
        backgroundColor: 'transparent',
      }),
    },
    
    sizes: {
      sm: convertStyle({
        paddingVertical: spacing.scale[2],
        paddingHorizontal: spacing.scale[4],
        minHeight: 36,
      }),
      lg: convertStyle({
        paddingVertical: spacing.scale[4],
        paddingHorizontal: spacing.scale[8],
        minHeight: 52,
      }),
    },
  },
  
  card: {
    base: convertStyle({
      backgroundColor: colors.surface.primary,
      borderRadius: 12,
      padding: spacing.scale[4],
      ...shadows.base,
    }),
    
    elevated: convertStyle({
      ...shadows.lg,
    }),
  },
  
  input: {
    base: convertStyle({
      paddingVertical: spacing.scale[3],
      paddingHorizontal: spacing.scale[4],
      fontSize: typography.scale.base,
      color: colors.text.primary,
      backgroundColor: colors.surface.primary,
      borderWidth: 1,
      borderColor: colors.neutral[300],
      borderRadius: 8,
      minHeight: 44,
    }),
    
    error: convertStyle({
      borderColor: colors.semantic.error.main,
    }),
  },
};

// Enhanced mobile helpers with better performance
const createMobileHelpers = () => {
  const safeAreaInsets = { top: 0, bottom: 0, left: 0, right: 0 };
  
  return {
    screen: {
      width,
      height,
      scale,
      isSmallScreen,
      isMediumScreen,
      isLargeScreen,
      isTablet,
      isPortrait: height > width,
      isLandscape: width > height,
    },
    
    getResponsiveValue: (values: {
      small?: any;
      medium?: any;
      large?: any;
      tablet?: any;
    }): any | undefined => {
      if (isTablet && values.tablet) return values.tablet;
      if (isLargeScreen && values.large) return values.large;
      if (isMediumScreen && values.medium) return values.medium;
      return values.small;
    },
    
    getDynamicSpacing: (baseSpacing: number): number => {
      const multiplier = isSmallScreen ? 0.8 : isTablet ? 1.2 : 1;
      return Math.round(baseSpacing * multiplier);
    },
    
    getDynamicFontSize: (baseFontSize: number): number => {
      const multiplier = isSmallScreen ? 0.9 : isTablet ? 1.1 : 1;
      return Math.round(baseFontSize * multiplier);
    },
    
    getSafeAreaInsets: () => safeAreaInsets,
  };
};

// Create optimized StyleSheet
const createGlobalStyles = () => {
  return StyleSheet.create({
    // Lista de items
    listItemTitle: {
      fontSize: typography.scale.lg,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: spacing.scale[1],
    },
    listItemSubtitle: {
      fontSize: typography.scale.base,
      color: colors.text.secondary,
    },
    // Modal styles
    modalTitle: {
      fontSize: typography.scale['2xl'],
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: spacing.scale[2],
    },
    modalCloseButton: {
      padding: spacing.scale[2],
      borderRadius: 8,
    },
    // Screen layouts
    screenBase: {
      flex: 1,
      backgroundColor: colors.surface.secondary,
    },
    screenContent: {
      flex: 1,
      paddingHorizontal: spacing.scale[4],
    },
    screenCentered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.scale[4],
    },
    
    // Headers
    headerBase: components.header.base,
    headerTitle: components.header.title,
    
    // Buttons
    buttonBase: components.button.base,
    buttonPrimary: {
      ...components.button.base,
      ...components.button.variants.primary,
    },
    buttonSecondary: {
      ...components.button.base,
      ...components.button.variants.secondary,
    },
    buttonGhost: {
      ...components.button.base,
      ...components.button.variants.ghost,
    },
    buttonSm: {
      ...components.button.base,
      ...components.button.sizes.sm,
    },
    buttonLg: {
      ...components.button.base,
      ...components.button.sizes.lg,
    },
    
    // Cards
    cardBase: components.card.base,
    cardElevated: {
      ...components.card.base,
      ...components.card.elevated,
    },
    
    // Inputs
    inputBase: components.input.base,
    inputError: {
      ...components.input.base,
      ...components.input.error,
    },
    
    // Text styles
    textPrimary: {
      color: colors.text.primary,
      fontSize: typography.scale.base,
    },
    textSecondary: {
      color: colors.text.secondary,
      fontSize: typography.scale.sm,
    },
    textMuted: {
      color: colors.text.muted,
      fontSize: typography.scale.xs,
    },
    
    // Layout utilities
    flexRow: {
      flexDirection: 'row',
    },
    flexColumn: {
      flexDirection: 'column',
    },
    alignCenter: {
      alignItems: 'center',
    },
    justifyCenter: {
      justifyContent: 'center',
    },
    justifyBetween: {
      justifyContent: 'space-between',
    },
  });
};

// Export the improved system
export const stylesGlobal = {
  colors,
  typography,
  spacing,
  shadows,
  components,
  breakpoints: BREAKPOINTS,
};

export const globalStyles = createGlobalStyles();
export const mobileHelpers = createMobileHelpers();

// Theme context for dynamic theming
export const createTheme = (customColors?: Partial<typeof colors>) => ({
  ...stylesGlobal,
  colors: { ...colors, ...customColors },
});