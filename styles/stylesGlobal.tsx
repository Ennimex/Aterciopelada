import { Dimensions, StyleSheet } from 'react-native';

// Get screen dimensions for responsive calculations
const { width, height } = Dimensions.get('window');

// Mobile screen size categories
const isSmallScreen = width < 375;
const isMediumScreen = width >= 375 && width < 414;
const isLargeScreen = width >= 414;

// Define TypeScript interfaces for the style system
interface ColorPalette {
  [key: string]: string | { [key: string]: string };
}

interface Typography {
  families: {
    display: string;
    body: string;
    script: string;
    mono: string;
  };
  scale: { [key: string]: number };
  headings: { [key: string]: any };
  body: { [key: string]: any };
  weights: { [key: string]: number };
  leading: { [key: string]: number };
  tracking: { [key: string]: number };
}

interface Spacing {
  unit: number;
  scale: { [key: string]: number };
  sections: { [key: string]: number };
  margins: { [key: string]: number };
  gaps: { [key: string]: number };
  mobile: {
    header: number;
    content: number;
    bottom: number;
    safeArea: number;
  };
}

interface Borders {
  radius: { [key: string]: string };
  width: { [key: string]: string };
  colors: { [key: string]: string };
}

interface Shadows {
  [key: string]: any;
}

interface Breakpoints {
  mobile: {
    small: number;  // iPhone SE, etc.
    medium: number; // iPhone standard
    large: number;  // iPhone Plus, Android large
    tablet: number; // iPad, Android tablet
  };
  orientation: {
    portrait: boolean;
    landscape: boolean;
  };
}

interface Animations {
  duration: { [key: string]: string };
  easing: { [key: string]: string };
  transitions: { [key: string]: string };
}

interface Components {
  // Componentes móviles específicos
  header: any;
  tabBar: any;
  screen: any;
  modal: any;
  button: any;
  card: any;
  input: any;
  list: any;
  statusBar: any;
}

interface Utils {
  container: any;
  zIndex: { [key: string]: number | string };
  overlay: any;
  mobile: {
    safeArea: any;
    orientation: any;
    screen: any;
    touch: any;
    keyboardAware: any;
  };
  migration: any;
  legacy: any;
}

interface StylesGlobal {
  colors: {
    primary: ColorPalette;
    secondary: ColorPalette;
    accent: ColorPalette;
    neutral: ColorPalette;
    semantic: { [key: string]: ColorPalette };
    surface: ColorPalette;
    text: ColorPalette;
    gradients: { [key: string]: string };
  };
  typography: Typography;
  spacing: Spacing;
  borders: Borders;
  shadows: Shadows;
  breakpoints: Breakpoints;
  animations: Animations;
  components: Components;
  utils: Utils;
}

// Convert CSS pixel values to React Native compatible units
const pixelToRN = (px: string | number): number => {
  if (typeof px === 'number') return px;
  
  const value = typeof px === 'string' ? px.trim() : String(px);
  
  // Handle rem units (1rem = 16px)
  if (value.includes('rem')) {
    const numValue = parseFloat(value);
    return isNaN(numValue) ? 0 : numValue * 16;
  }
  
  // Handle clamp() function - use middle value as fallback
  if (value.includes('clamp(')) {
    const clampMatch = value.match(/clamp\(([^,]+),([^,]+),([^)]+)\)/);
    if (clampMatch) {
      const middleValue = clampMatch[2].trim();
      // For responsive text, use a reasonable fallback
      if (middleValue.includes('vw')) {
        return parseFloat(middleValue) * 4; // Approximation for vw
      }
      return pixelToRN(middleValue);
    }
  }
  
  // Handle regular pixel values
  const numValue = parseFloat(value);
  return isNaN(numValue) ? 0 : numValue;
};

// Convert CSS properties to React Native compatible styles
const convertStyle = (style: any): any => {
  const rnStyle: any = { ...style };

  // Convert CSS properties to React Native equivalents
  if (rnStyle.borderRadius) {
    rnStyle.borderRadius = pixelToRN(rnStyle.borderRadius);
  }
  if (rnStyle.padding) {
    rnStyle.padding = pixelToRN(rnStyle.padding);
  }
  if (rnStyle.margin) {
    rnStyle.margin = pixelToRN(rnStyle.margin);
  }
  if (rnStyle.fontSize) {
    rnStyle.fontSize = pixelToRN(rnStyle.fontSize);
  }
  if (rnStyle.lineHeight) {
    rnStyle.lineHeight = pixelToRN(rnStyle.lineHeight);
  }
  if (rnStyle.letterSpacing) {
    rnStyle.letterSpacing = pixelToRN(rnStyle.letterSpacing);
  }
  if (rnStyle.width && rnStyle.width !== '100%') {
    rnStyle.width = pixelToRN(rnStyle.width);
  }
  if (rnStyle.height && typeof rnStyle.height === 'string') {
    rnStyle.height = pixelToRN(rnStyle.height);
  }
  // gap no es soportado en RN, ignóralo
  delete rnStyle.gap;
  if (rnStyle.paddingHorizontal) {
    rnStyle.paddingHorizontal = pixelToRN(rnStyle.paddingHorizontal);
  }
  if (rnStyle.paddingVertical) {
    rnStyle.paddingVertical = pixelToRN(rnStyle.paddingVertical);
  }
  if (rnStyle.marginTop && rnStyle.marginTop !== 'auto') {
    rnStyle.marginTop = pixelToRN(rnStyle.marginTop);
  }
  if (rnStyle.marginBottom) {
    rnStyle.marginBottom = pixelToRN(rnStyle.marginBottom);
  }
  if (rnStyle.marginHorizontal && rnStyle.marginHorizontal !== 'auto') {
    rnStyle.marginHorizontal = pixelToRN(rnStyle.marginHorizontal);
  }
  if (rnStyle.maxWidth) {
    rnStyle.maxWidth = pixelToRN(rnStyle.maxWidth);
  }
  if (rnStyle.minHeight) {
    rnStyle.minHeight = pixelToRN(rnStyle.minHeight);
  }
  if (rnStyle.top && rnStyle.top !== 0) {
    rnStyle.top = pixelToRN(rnStyle.top);
  }
  if (rnStyle.right && rnStyle.right !== 0) {
    rnStyle.right = pixelToRN(rnStyle.right);
  }
  if (rnStyle.left && rnStyle.left !== 0) {
    rnStyle.left = pixelToRN(rnStyle.left);
  }
  if (rnStyle.bottom && rnStyle.bottom !== 0) {
    rnStyle.bottom = pixelToRN(rnStyle.bottom);
  }
  // Convert position fixed to absolute (React Native doesn't support fixed)
  if (rnStyle.position === 'fixed') {
    rnStyle.position = 'absolute';
  }
  // Convert fontWeight strings to numbers
  if (rnStyle.fontWeight && typeof rnStyle.fontWeight === 'string') {
    const weightMap: { [key: string]: number } = {
      '100': 100, '200': 200, '300': 300, '400': 400, '500': 500,
      '600': 600, '700': 700, '800': 800, '900': 900,
      'normal': 400, 'bold': 700
    };
    rnStyle.fontWeight = weightMap[rnStyle.fontWeight] || 400;
  }
  // Eliminar propiedades no soportadas en RN
  delete rnStyle.backdropFilter;
  delete rnStyle.transition;
  delete rnStyle.transform;
  delete rnStyle['&:hover'];
  delete rnStyle['&.active'];
  delete rnStyle['&::before'];
  delete rnStyle['@media'];
  delete rnStyle.textAlign;
  delete rnStyle.textTransform;
  // textDecorationLine sí es soportado en RN, no lo elimines
  delete rnStyle.display;
  delete rnStyle.cursor;
  delete rnStyle.outline;
  delete rnStyle.userSelect;
  delete rnStyle.boxShadow;
  delete rnStyle.flexWrap;
  // marginTop: 'auto' no es soportado
  if (rnStyle.marginTop === 'auto') {
    delete rnStyle.marginTop;
  }
  if (rnStyle.marginHorizontal === 'auto') {
    delete rnStyle.marginHorizontal;
  }
  // Gradientes: solo dejar comentario
  if (rnStyle.backgroundImage && typeof rnStyle.backgroundImage === 'string' && rnStyle.backgroundImage.includes('gradient')) {
    // Usa react-native-linear-gradient para gradientes
    delete rnStyle.backgroundImage;
  }
  return rnStyle;
};

// Global styles object
const stylesGlobal: StylesGlobal = {
  // ===============================
  // TOKENS DE DISEÑO - COLORES
  // ===============================
  colors: {
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
    },
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
    },
    accent: {
      50: '#fefcf3',
      100: '#fef7e0',
      200: '#fdecc0',
      300: '#fbdb95',
      400: '#f7c668',
      500: '#e6a756',
      600: '#d4924a',
      700: '#b17c3e',
      800: '#8f6538',
      900: '#755432',
      contrast: '#000000',
    },
    neutral: {
      0: '#ffffff',
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
      950: '#1a1612',
    },
    semantic: {
      error: {
        light: '#fef2f2',
        main: '#e11d48',
        dark: '#be123c',
        contrast: '#ffffff',
      },
      warning: {
        light: '#fffbeb',
        main: '#f59e0b',
        dark: '#d97706',
        contrast: '#000000',
      },
      success: {
        light: '#f0fdf4',
        main: '#22c55e',
        dark: '#16a34a',
        contrast: '#ffffff',
      },
      info: {
        light: '#f0f9ff',
        main: '#0ea5e9',
        dark: '#0284c7',
        contrast: '#ffffff',
      },
    },
    surface: {
      primary: '#ffffff',
      secondary: '#fafaf9',
      tertiary: '#f7f6f4',
      elevated: '#ffffff',
      overlay: 'rgba(42, 36, 31, 0.75)',
      glass: 'rgba(247, 246, 244, 0.9)',
      accent: '#fefcf3',
    },
    text: {
      primary: '#2a241f',
      secondary: '#524842',
      tertiary: '#8b7d74',
      inverse: '#ffffff',
      accent: '#d63384',
      muted: '#b8aca4',
      luxury: '#e6a756',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #d63384 0%, #ed7590 100%)',
      secondary: 'linear-gradient(135deg, #6b9b6b 0%, #85b085 100%)',
      luxury: 'linear-gradient(135deg, #e6a756 0%, #f7c668 100%)',
      hero: 'linear-gradient(135deg, #fafaf9 0%, #fdf2f4 30%, #f6f8f6 60%, #fefcf3 100%)',
      warm: 'linear-gradient(to bottom, #fafaf9 0%, #f7f6f4 50%, #fefcf3 100%)',
      elegant: 'linear-gradient(135deg, #d63384 0%, #6b9b6b 50%, #e6a756 100%)',
      glass: 'linear-gradient(135deg, rgba(247, 246, 244, 0.95) 0%, rgba(254, 252, 243, 0.8) 100%)',
      sunset: 'linear-gradient(135deg, #fdf2f4 0%, #fef7e0 50%, #f6f8f6 100%)',
    },
  },

  // ===============================
  // SISTEMA TIPOGRÁFICO
  // ===============================
  typography: {
    families: {
      display: 'System', // iOS: San Francisco, Android: Roboto
      body: 'System',
      script: 'System', 
      mono: 'Courier New', // Monospace disponible en ambas plataformas
    },
    scale: {
      xs: 12, // 0.75rem
      sm: 14, // 0.875rem
      base: 16, // 1rem
      lg: 18, // 1.125rem
      xl: 20, // 1.25rem
      '2xl': 24, // 1.5rem
      '3xl': 30, // 1.875rem
      '4xl': 36, // 2.25rem
      '5xl': 48, // 3rem
      '6xl': 60, // 3.75rem
      '7xl': 72, // 4.5rem
      '8xl': 96, // 6rem
    },
    headings: {
      h1: {
        fontSize: 72, // clamp fallback to 4.5rem
        fontFamily: 'Playfair Display,serif',
        fontWeight: 700,
        lineHeight: 1.1,
        letterSpacing: -0.4,
        color: '#2a241f',
      },
      h2: {
        fontSize: 48, // clamp fallback to 3rem
        fontFamily: 'Playfair Display,serif',
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: -0.32,
        color: '#2a241f',
      },
      h3: {
        fontSize: 36, // clamp fallback to 2.25rem
        fontFamily: 'Inter,sans-serif',
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: -0.16,
        color: '#524842',
      },
      h4: {
        fontSize: 30, // clamp fallback to 1.875rem
        fontFamily: 'Inter,sans-serif',
        fontWeight: 600,
        lineHeight: 1.4,
        color: '#524842',
      },
      h5: {
        fontSize: 24, // clamp fallback to 1.5rem
        fontFamily: 'Inter,sans-serif',
        fontWeight: 500,
        lineHeight: 1.4,
        color: '#524842',
      },
      h6: {
        fontSize: 20, // clamp fallback to 1.25rem
        fontFamily: 'Inter,sans-serif',
        fontWeight: 500,
        lineHeight: 1.5,
        color: '#8b7d74',
      },
    },
    body: {
      large: {
        fontSize: 18, // 1.125rem
        lineHeight: 1.7,
        fontFamily: 'Inter,sans-serif',
        color: '#524842',
      },
      base: {
        fontSize: 16, // 1rem
        lineHeight: 1.6,
        fontFamily: 'Inter,sans-serif',
        color: '#2a241f',
      },
      small: {
        fontSize: 14, // 0.875rem
        lineHeight: 1.5,
        fontFamily: 'Inter,sans-serif',
        color: '#8b7d74',
      },
      caption: {
        fontSize: 12, // 0.75rem
        lineHeight: 1.4,
        fontFamily: 'Inter,sans-serif',
        fontWeight: 500,
        color: '#b8aca4',
      },
    },
    weights: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    leading: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
    tracking: {
      tighter: -0.8, // -0.05em
      tight: -0.4, // -0.025em
      normal: 0, // 0em
      wide: 0.4, // 0.025em
      wider: 0.8, // 0.05em
      widest: 1.6, // 0.1em
    },
  },

  // ===============================
  // SISTEMA DE ESPACIADO
  // ===============================
  spacing: {
    unit: 8,
    scale: {
      0: 0,
      1: 4,
      2: 8,
      3: 12,
      4: 16,
      5: 20,
      6: 24,
      7: 28,
      8: 32,
      9: 36,
      10: 40,
      11: 44,
      12: 48,
      14: 56,
      15: 60,
      16: 64,
      18: 72,
      19: 76,
      20: 80,
      24: 96,
      28: 112,
      30: 120,
      32: 128,
      36: 144,
      40: 160,
      42: 168,
      44: 176,
      45: 180,
      48: 192,
      50: 200,
      52: 208,
      55: 220,
      56: 224,
      60: 240,
      62: 248,
      64: 256,
      70: 280,
      72: 288,
      75: 300,
      80: 320,
      88: 352,
      96: 384,
      100: 400,
      113: 452,
      200: 800,
    },
    sections: {
      xs: 32, // 2rem = 32px
      sm: 48, // 3rem = 48px
      md: 64, // 4rem = 64px
      lg: 96, // 6rem = 96px
      xl: 128, // 8rem = 128px
      xxl: 192, // 12rem = 192px
    },
    margins: {
      section: 64, // 4rem
      element: 24, // 1.5rem
    },
    gaps: {
      xs: 8, // 0.5rem
      sm: 16, // 1rem
      md: 24, // 1.5rem
      lg: 32, // 2rem
      xl: 48, // 3rem
    },
    mobile: {
      header: 60, // Altura típica de header móvil
      content: 16, // Padding de contenido
      bottom: 80, // Altura de tab bar
      safeArea: 44, // Safe area típica en iOS
    },
  },

  // ===============================
  // BORDES Y RADIOS
  // ===============================
  borders: {
    radius: {
      none: '0px',
      xs: '2px',
      sm: '4px',
      base: '6px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      '2xl': '24px',
      '3xl': '32px',
      full: '9999px',
    },
    width: {
      0: '0px',
      1: '1px',
      2: '2px',
      4: '4px',
      8: '8px',
    },
    colors: {
      default: '#ede9e6',
      muted: '#ddd6d1',
      strong: '#8b7d74',
      accent: '#d63384',
      luxury: '#e6a756',
      success: '#22c55e',
      error: '#e11d48',
      warning: '#f59e0b',
    },
  },

  // ===============================
  // SISTEMA DE SOMBRAS
  // ===============================
  shadows: {
    none: 'none',
    xs: {
      shadowColor: '#2a241f',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    sm: {
      shadowColor: '#2a241f',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    base: {
      shadowColor: '#2a241f',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    md: {
      shadowColor: '#2a241f',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
    },
    lg: {
      shadowColor: '#2a241f',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
    },
    xl: {
      shadowColor: '#2a241f',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 50,
    },
    '2xl': {
      shadowColor: '#2a241f',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.25,
      shadowRadius: 100,
    },
    brand: {
      primary: {
        shadowColor: '#d63384',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 32,
      },
      secondary: {
        shadowColor: '#6b9b6b',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 32,
      },
      luxury: {
        shadowColor: '#e6a756',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 32,
      },
      glow: {
        shadowColor: '#d63384',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 32,
      },
      elegant: {
        shadowColor: '#d63384',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 40,
      },
    },
    inner: 'none', // Inner shadows not supported in React Native
  },

  // ===============================
  // BREAKPOINTS PARA MÓVIL
  // ===============================
  breakpoints: {
    mobile: {
      small: 320,  // iPhone SE y similares
      medium: 375, // iPhone estándar
      large: 414,  // iPhone Plus, Android large
      tablet: 768, // iPad, tablets Android
    },
    orientation: {
      portrait: height > width,
      landscape: width > height,
    },
  },

  // ===============================
  // SISTEMA DE ANIMACIONES
  // ===============================
  animations: {
    duration: {
      instant: '0ms',
      fast: '150ms',
      base: '200ms',
      slow: '300ms',
      slower: '500ms',
      slowest: '1000ms',
      elegant: '400ms',
    },
    easing: {
      linear: 'linear',
      ease: 'ease',
      'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
      'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
      'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      elegant: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    },
    transitions: {
      base: 'all 200ms cubic-bezier(0, 0, 0.2, 1)',
      fast: 'all 150ms cubic-bezier(0, 0, 0.2, 1)',
      slow: 'all 300ms cubic-bezier(0, 0, 0.2, 1)',
      elegant: 'all 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      colors: 'color 200ms cubic-bezier(0, 0, 0.2, 1), background-color 200ms cubic-bezier(0, 0, 0.2, 1)',
      opacity: 'opacity 200ms cubic-bezier(0, 0, 0.2, 1)',
      transform: 'transform 200ms cubic-bezier(0, 0, 0.2, 1)',
    },
  },

  // ===============================
  // COMPONENTES MÓVILES
  // ===============================
  components: {
    // Header para navegación superior
    header: {
      base: convertStyle({
        height: 60,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#ede9e6',
        shadowColor: '#2a241f',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 0, // Ajustar según safe area
      }),
      variants: {
        transparent: convertStyle({
          backgroundColor: 'transparent',
          borderBottomWidth: 0,
          shadowOpacity: 0,
        }),
        primary: convertStyle({
          backgroundColor: '#d63384',
        }),
        dark: convertStyle({
          backgroundColor: '#2a241f',
        }),
      },
      title: convertStyle({
        fontSize: 18,
        fontWeight: '600',
        color: '#2a241f',
        textAlign: 'center',
        flex: 1,
      }),
      backButton: convertStyle({
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 22,
      }),
      rightAction: convertStyle({
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 22,
      }),
    },

    // Tab Bar inferior
    tabBar: {
      base: convertStyle({
        height: 80,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#ede9e6',
        flexDirection: 'row',
        paddingBottom: 0, // Ajustar según safe area
        shadowColor: '#2a241f',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }),
      tab: convertStyle({
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
      }),
      tabIcon: convertStyle({
        width: 24,
        height: 24,
        marginBottom: 4,
      }),
      tabLabel: convertStyle({
        fontSize: 12,
        fontWeight: '500',
        color: '#8b7d74',
      }),
      tabActive: convertStyle({
        color: '#d63384',
      }),
    },

    // Contenedor de pantalla
    screen: {
      base: convertStyle({
        flex: 1,
        backgroundColor: '#fafaf9',
      }),
      content: convertStyle({
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
      }),
      centered: convertStyle({
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
      }),
    },

    // Modal
    modal: {
      base: convertStyle({
        flex: 1,
        backgroundColor: 'rgba(42, 36, 31, 0.75)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }),
      content: convertStyle({
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#2a241f',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 32,
      }),
      header: convertStyle({
        marginBottom: 16,
      }),
      title: convertStyle({
        fontSize: 20,
        fontWeight: '600',
        color: '#2a241f',
        textAlign: 'center',
      }),
      closeButton: convertStyle({
        position: 'absolute',
        top: 16,
        right: 16,
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        backgroundColor: '#f7f6f4',
      }),
    },

    // Status Bar
    statusBar: {
      light: {
        backgroundColor: '#fafaf9',
        barStyle: 'dark-content',
      },
      dark: {
        backgroundColor: '#2a241f',
        barStyle: 'light-content',
      },
      primary: {
        backgroundColor: '#d63384',
        barStyle: 'light-content',
      },
    },

    // Lista
    list: {
      container: convertStyle({
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginVertical: 8,
        shadowColor: '#2a241f',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }),
      item: convertStyle({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f7f6f4',
      }),
      itemLast: convertStyle({
        borderBottomWidth: 0,
      }),
      itemContent: convertStyle({
        flex: 1,
        marginLeft: 12,
      }),
      itemTitle: convertStyle({
        fontSize: 16,
        fontWeight: '500',
        color: '#2a241f',
        marginBottom: 2,
      }),
      itemSubtitle: convertStyle({
        fontSize: 14,
        color: '#8b7d74',
      }),
      itemIcon: convertStyle({
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#f7f6f4',
        alignItems: 'center',
        justifyContent: 'center',
      }),
      itemArrow: convertStyle({
        width: 20,
        height: 20,
        color: '#b8aca4',
      }),
    },
    button: {
      sizes: {
        xs: convertStyle({
          paddingVertical: pixelToRN('6px'),
          paddingHorizontal: pixelToRN('12px'),
          fontSize: pixelToRN('0.75rem'),
          borderRadius: pixelToRN('6px'),
        }),
        sm: convertStyle({
          paddingVertical: pixelToRN('8px'),
          paddingHorizontal: pixelToRN('16px'),
          fontSize: pixelToRN('0.875rem'),
          borderRadius: pixelToRN('8px'),
        }),
        base: convertStyle({
          paddingVertical: pixelToRN('12px'),
          paddingHorizontal: pixelToRN('24px'),
          fontSize: pixelToRN('1rem'),
          borderRadius: pixelToRN('10px'),
        }),
        lg: convertStyle({
          paddingVertical: pixelToRN('16px'),
          paddingHorizontal: pixelToRN('32px'),
          fontSize: pixelToRN('1.125rem'),
          borderRadius: pixelToRN('12px'),
        }),
        xl: convertStyle({
          paddingVertical: pixelToRN('20px'),
          paddingHorizontal: pixelToRN('40px'),
          fontSize: pixelToRN('1.25rem'),
          borderRadius: pixelToRN('16px'),
        }),
      },
      variants: {
        primary: convertStyle({
          backgroundColor: '#d63384',
          color: '#ffffff',
          borderWidth: 1,
          borderColor: '#d63384',
          shadowColor: '#d63384',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 32,
        }),
        secondary: convertStyle({
          backgroundColor: 'transparent',
          color: '#6b9b6b',
          borderWidth: 1,
          borderColor: '#6b9b6b',
        }),
        luxury: convertStyle({
          backgroundColor: '#e6a756',
          color: '#2a241f',
          borderWidth: 1,
          borderColor: '#e6a756',
          shadowColor: '#e6a756',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 32,
        }),
        ghost: convertStyle({
          backgroundColor: 'transparent',
          color: '#524842',
          borderWidth: 1,
          borderColor: 'transparent',
        }),
      },
    },
    card: {
      base: convertStyle({
        backgroundColor: '#ffffff',
        borderRadius: pixelToRN('16px'),
        borderWidth: 1,
        borderColor: '#ede9e6',
        shadowColor: '#2a241f',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }),
      elevated: convertStyle({
        shadowColor: '#2a241f',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      }),
      luxury: convertStyle({
        backgroundColor: '#ffffff', // Gradients not supported
        borderWidth: 1,
        borderColor: '#e6a756',
        shadowColor: '#e6a756',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 32,
      }),
      interactive: convertStyle({
      }),
    },
    input: {
      base: convertStyle({
        width: '100%',
        paddingVertical: pixelToRN('12px'),
        paddingHorizontal: pixelToRN('16px'),
        fontSize: pixelToRN('1rem'),
        lineHeight: 1.5,
        color: '#2a241f',
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#ddd6d1',
        borderRadius: pixelToRN('10px'),
      }),
      luxury: convertStyle({
        borderWidth: 1,
        borderColor: '#e6a756',
      }),
      error: convertStyle({
        borderColor: '#e11d48',
      }),
    },
  },

  // ===============================
  // UTILIDADES Y HELPERS
  // ===============================
  utils: {
    container: {
      center: true,
      padding: 16,
      maxWidth: {
        sm: 375,  // iPhone estándar
        md: 414,  // iPhone Plus
        lg: 768,  // iPad portrait
        xl: 1024, // iPad landscape
      },
    },
    zIndex: {
      hide: -1,
      auto: 'auto',
      base: 0,
      docked: 10,
      dropdown: 1000,
      sticky: 1100,
      banner: 1200,
      overlay: 1300,
      modal: 1400,
      popover: 1500,
      skipLink: 1600,
      toast: 1700,
      tooltip: 1800,
    },
    overlay: {
      base: convertStyle({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(42, 36, 31, 0.75)',
        zIndex: 1300,
      }),
      elegant: convertStyle({
        backgroundColor: 'rgba(42, 36, 31, 0.8)',
      }),
    },
    // Utilidades específicas para móvil
    mobile: {
      safeArea: {
        // Safe areas típicas para diferentes dispositivos
        iPhoneX: { top: 44, bottom: 34 },
        iPhone: { top: 20, bottom: 0 },
        android: { top: 24, bottom: 0 },
      },
      orientation: {
        isPortrait: height > width,
        isLandscape: width > height,
      },
      screen: {
        width,
        height,
        isSmall: width < 375,
        isMedium: width >= 375 && width < 414,
        isLarge: width >= 414,
        isTablet: width >= 768,
      },
      touch: {
        // Tamaños mínimos para elementos táctiles
        minSize: 44,
        comfortable: 48,
        large: 56,
      },
      keyboardAware: {
        // Espacios para teclado
        bottomPadding: 20,
        inputMargin: 16,
      },
    },
    migration: {
      colorMapping: {
        '#0D1B2A': '#2a241f',
        '#1B263B': '#524842',
        '#3498db': '#6b9b6b',
        '#2c3e50': '#8b7d74',
        '#090E15': '#1a1612',
        '#233044': '#3a332e',
        '#FFFFFF': '#ffffff',
        '#F8F9FA': '#fafaf9',
        '#F5F6F8': '#f7f6f4',
        '#E2E8F0': '#ede9e6',
        '#F1F5F9': '#ddd6d1',
        '#64748B': '#b8aca4',
      },
      componentMapping: {
        oldNavbar: 'stylesGlobal.components.header',
        oldSidebar: 'deprecated - use drawer navigation',
        oldFooter: 'deprecated - not used in mobile',
        oldButton: 'stylesGlobal.components.button',
        oldCard: 'stylesGlobal.components.card',
        oldInput: 'stylesGlobal.components.input',
      },
      transitionGuide: {
        step1: 'Reemplazar componentes web con componentes móviles',
        step2: 'Usar header en lugar de navbar',
        step3: 'Implementar tab navigation en lugar de sidebar',
        step4: 'Ajustar espaciado para pantallas táctiles',
        step5: 'Agregar safe area handling',
        step6: 'Implementar responsive design para móvil',
      },
    },
    legacy: {
      getOldColor: (oldColor: string): string => {
        const mapping: { [key: string]: string } = {
          '#0D1B2A': stylesGlobal.colors.neutral[900] as string,
          '#1B263B': stylesGlobal.colors.neutral[700] as string,
          '#3498db': stylesGlobal.colors.secondary[500] as string,
        };
        return mapping[oldColor] || oldColor;
      },
      convertStyle: (oldStyleObject: any): any => {
        const newStyle = { ...oldStyleObject };
        Object.keys(newStyle).forEach((key) => {
          if (typeof newStyle[key] === 'string' && newStyle[key].startsWith('#')) {
            const newColor = stylesGlobal.utils.legacy.getOldColor(newStyle[key]);
            if (newColor !== newStyle[key]) {
              newStyle[key] = newColor;
            }
          }
        });
        return newStyle; // Removed circular reference
      },
    },
  },
};

// Create React Native StyleSheet optimizado para móvil
const globalStyles = StyleSheet.create({
  // Header móvil
  headerBase: stylesGlobal.components.header.base,
  headerTransparent: stylesGlobal.components.header.variants.transparent,
  headerPrimary: stylesGlobal.components.header.variants.primary,
  headerDark: stylesGlobal.components.header.variants.dark,
  headerTitle: stylesGlobal.components.header.title,
  headerBackButton: stylesGlobal.components.header.backButton,
  headerRightAction: stylesGlobal.components.header.rightAction,

  // Tab Bar
  tabBarBase: stylesGlobal.components.tabBar.base,
  tabBarTab: stylesGlobal.components.tabBar.tab,
  tabBarTabIcon: stylesGlobal.components.tabBar.tabIcon,
  tabBarTabLabel: stylesGlobal.components.tabBar.tabLabel,
  tabBarTabActive: stylesGlobal.components.tabBar.tabActive,

  // Screen
  screenBase: stylesGlobal.components.screen.base,
  screenContent: stylesGlobal.components.screen.content,
  screenCentered: stylesGlobal.components.screen.centered,

  // Modal
  modalBase: stylesGlobal.components.modal.base,
  modalContent: stylesGlobal.components.modal.content,
  modalHeader: stylesGlobal.components.modal.header,
  modalTitle: stylesGlobal.components.modal.title,
  modalCloseButton: stylesGlobal.components.modal.closeButton,

  // Lista
  listContainer: stylesGlobal.components.list.container,
  listItem: stylesGlobal.components.list.item,
  listItemLast: stylesGlobal.components.list.itemLast,
  listItemContent: stylesGlobal.components.list.itemContent,
  listItemTitle: stylesGlobal.components.list.itemTitle,
  listItemSubtitle: stylesGlobal.components.list.itemSubtitle,
  listItemIcon: stylesGlobal.components.list.itemIcon,
  listItemArrow: stylesGlobal.components.list.itemArrow,

  // Botones
  buttonXs: stylesGlobal.components.button.sizes.xs,
  buttonSm: stylesGlobal.components.button.sizes.sm,
  buttonBase: stylesGlobal.components.button.sizes.base,
  buttonLg: stylesGlobal.components.button.sizes.lg,
  buttonXl: stylesGlobal.components.button.sizes.xl,
  buttonPrimary: stylesGlobal.components.button.variants.primary,
  buttonSecondary: stylesGlobal.components.button.variants.secondary,
  buttonLuxury: stylesGlobal.components.button.variants.luxury,
  buttonGhost: stylesGlobal.components.button.variants.ghost,

  // Cards
  cardBase: stylesGlobal.components.card.base,
  cardElevated: stylesGlobal.components.card.elevated,
  cardLuxury: stylesGlobal.components.card.luxury,
  cardInteractive: stylesGlobal.components.card.interactive,

  // Inputs
  inputBase: stylesGlobal.components.input.base,
  inputLuxury: stylesGlobal.components.input.luxury,
  inputError: stylesGlobal.components.input.error,
});

// ===============================
// HELPERS ESPECÍFICOS PARA MÓVIL
// ===============================

// Helper para obtener estilos responsivos basados en el tamaño de pantalla
const getResponsiveStyle = (styles: { small?: any; medium?: any; large?: any; tablet?: any }) => {
  if (isLargeScreen || width >= 768) return styles.tablet || styles.large || styles.medium || styles.small;
  if (isMediumScreen) return styles.large || styles.medium || styles.small;
  return styles.small || styles.medium;
};

// Helper para safe area
const getSafeAreaInsets = () => {
  // En una implementación real, esto vendría de react-native-safe-area-context
  if (height >= 812) { // iPhone X y posteriores
    return { top: 44, bottom: 34, left: 0, right: 0 };
  }
  return { top: 20, bottom: 0, left: 0, right: 0 };
};

// Helper para espaciado dinámico
const getDynamicSpacing = (baseSpacing: number) => {
  const scale = isSmallScreen ? 0.8 : isLargeScreen ? 1.2 : 1;
  return Math.round(baseSpacing * scale);
};

// Helper para tamaños de fuente dinámicos
const getDynamicFontSize = (baseFontSize: number) => {
  const scale = isSmallScreen ? 0.9 : isLargeScreen ? 1.1 : 1;
  return Math.round(baseFontSize * scale);
};

// Export helpers
const mobileHelpers = {
  getResponsiveStyle,
  getSafeAreaInsets,
  getDynamicSpacing,
  getDynamicFontSize,
  screen: {
    width,
    height,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    isPortrait: height > width,
    isLandscape: width > height,
  },
};

export { globalStyles, mobileHelpers, stylesGlobal };

