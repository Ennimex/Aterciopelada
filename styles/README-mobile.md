# Guía de Estilos Globales para Móvil - React Native

## 🎯 Visión General

Este sistema de estilos ha sido completamente optimizado para aplicaciones móviles React Native, eliminando conceptos web innecesarios y enfocándose en patrones de diseño móvil.

## 📱 Componentes Móviles Disponibles

### Header (Navegación Superior)
```tsx
import { globalStyles } from '../styles/stylesGlobal';

// Header básico
<View style={globalStyles.headerBase}>
  <TouchableOpacity style={globalStyles.headerBackButton}>
    <Icon name="back" />
  </TouchableOpacity>
  <Text style={globalStyles.headerTitle}>Título</Text>
  <TouchableOpacity style={globalStyles.headerRightAction}>
    <Icon name="menu" />
  </TouchableOpacity>
</View>

// Header transparente
<View style={[globalStyles.headerBase, globalStyles.headerTransparent]}>
  // contenido
</View>
```

### Tab Bar (Navegación Inferior)
```tsx
<View style={globalStyles.tabBarBase}>
  <TouchableOpacity style={globalStyles.tabBarTab}>
    <Icon style={globalStyles.tabBarTabIcon} name="home" />
    <Text style={[globalStyles.tabBarTabLabel, globalStyles.tabBarTabActive]}>
      Inicio
    </Text>
  </TouchableOpacity>
</View>
```

### Screen Container
```tsx
// Pantalla básica
<View style={globalStyles.screenBase}>
  <View style={globalStyles.screenContent}>
    // contenido
  </View>
</View>

// Pantalla centrada
<View style={globalStyles.screenCentered}>
  // contenido centrado
</View>
```

### Modal
```tsx
<Modal visible={modalVisible}>
  <View style={globalStyles.modalBase}>
    <View style={globalStyles.modalContent}>
      <TouchableOpacity style={globalStyles.modalCloseButton}>
        <Icon name="close" />
      </TouchableOpacity>
      <View style={globalStyles.modalHeader}>
        <Text style={globalStyles.modalTitle}>Título del Modal</Text>
      </View>
      // contenido del modal
    </View>
  </View>
</Modal>
```

### Listas
```tsx
<View style={globalStyles.listContainer}>
  <TouchableOpacity style={globalStyles.listItem}>
    <View style={globalStyles.listItemIcon}>
      <Icon name="user" />
    </View>
    <View style={globalStyles.listItemContent}>
      <Text style={globalStyles.listItemTitle}>Título</Text>
      <Text style={globalStyles.listItemSubtitle}>Subtítulo</Text>
    </View>
    <Icon style={globalStyles.listItemArrow} name="chevron-right" />
  </TouchableOpacity>
</View>
```

## 🎨 Sistema de Colores

```tsx
import { stylesGlobal } from '../styles/stylesGlobal';

// Colores primarios
stylesGlobal.colors.primary[500] // '#d63384'
stylesGlobal.colors.secondary[500] // '#6b9b6b'
stylesGlobal.colors.accent[500] // '#e6a756'

// Colores neutros
stylesGlobal.colors.neutral[0] // '#ffffff'
stylesGlobal.colors.neutral[900] // '#2a241f'

// Colores de superficie
stylesGlobal.colors.surface.primary // '#ffffff'
stylesGlobal.colors.surface.secondary // '#fafaf9'

// Colores de texto
stylesGlobal.colors.text.primary // '#2a241f'
stylesGlobal.colors.text.secondary // '#524842'
```

## 📏 Sistema de Espaciado

```tsx
// Espaciado en números (px)
stylesGlobal.spacing.scale[4] // 16
stylesGlobal.spacing.scale[8] // 32

// Espaciado específico para móvil
stylesGlobal.spacing.mobile.header // 60
stylesGlobal.spacing.mobile.content // 16
stylesGlobal.spacing.mobile.bottom // 80
stylesGlobal.spacing.mobile.safeArea // 44
```

## 🔤 Tipografía

```tsx
// Fuentes del sistema (iOS/Android)
stylesGlobal.typography.families.body // 'System'

// Escalas de tamaño
stylesGlobal.typography.scale.base // 16
stylesGlobal.typography.scale['2xl'] // 24

// Estilos predefinidos
stylesGlobal.typography.headings.h1.fontSize // 72
stylesGlobal.typography.body.base.fontSize // 16
```

## 📱 Helpers Móviles

```tsx
import { mobileHelpers } from '../styles/stylesGlobal';

// Información de pantalla
mobileHelpers.screen.width
mobileHelpers.screen.height
mobileHelpers.screen.isSmallScreen
mobileHelpers.screen.isPortrait

// Estilos responsivos
const buttonStyle = mobileHelpers.getResponsiveStyle({
  small: { padding: 8 },
  medium: { padding: 12 },
  large: { padding: 16 }
});

// Safe Area
const safeArea = mobileHelpers.getSafeAreaInsets();

// Espaciado dinámico
const dynamicPadding = mobileHelpers.getDynamicSpacing(16);

// Tamaño de fuente dinámico
const dynamicFontSize = mobileHelpers.getDynamicFontSize(16);
```

## 🎯 Breakpoints para Móvil

```tsx
stylesGlobal.breakpoints.mobile.small // 320 (iPhone SE)
stylesGlobal.breakpoints.mobile.medium // 375 (iPhone estándar)
stylesGlobal.breakpoints.mobile.large // 414 (iPhone Plus)
stylesGlobal.breakpoints.mobile.tablet // 768 (iPad)
```

## 🛠️ Status Bar

```tsx
import { StatusBar } from 'react-native';

// Configuraciones predefinidas
const statusBarConfig = stylesGlobal.components.statusBar.light;
<StatusBar 
  backgroundColor={statusBarConfig.backgroundColor}
  barStyle={statusBarConfig.barStyle}
/>
```

## 🔧 Migración desde Web

Si estás migrando desde un diseño web:

1. **Navbar → Header**: Usa `globalStyles.header*` en lugar de navbar
2. **Sidebar → Tab Navigation**: Implementa navegación por tabs
3. **Footer → Tab Bar**: Usa tab bar para navegación principal
4. **Position fixed → Absolute**: Todos los positions son absolute
5. **Fuentes web → Sistema**: Usa fuentes del sistema para mejor rendimiento

## 📝 Mejores Prácticas

1. **Área táctil mínima**: Usa mínimo 44px para elementos táctiles
2. **Safe Area**: Siempre considera las safe areas en dispositivos modernos
3. **Responsive**: Usa los helpers para adaptar a diferentes tamaños
4. **Performance**: Usa StyleSheet.create() para mejor rendimiento
5. **Accesibilidad**: Considera colores de contraste y tamaños de fuente

## 🎨 Ejemplos de Pantallas Completas

### Pantalla de Lista
```tsx
export const ListScreen = () => (
  <View style={globalStyles.screenBase}>
    <View style={[globalStyles.headerBase, globalStyles.headerPrimary]}>
      <Text style={globalStyles.headerTitle}>Mi Lista</Text>
    </View>
    
    <ScrollView style={globalStyles.screenContent}>
      <View style={globalStyles.listContainer}>
        {items.map(item => (
          <TouchableOpacity key={item.id} style={globalStyles.listItem}>
            <View style={globalStyles.listItemContent}>
              <Text style={globalStyles.listItemTitle}>{item.title}</Text>
              <Text style={globalStyles.listItemSubtitle}>{item.subtitle}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  </View>
);
```

### Pantalla de Formulario
```tsx
export const FormScreen = () => (
  <View style={globalStyles.screenBase}>
    <KeyboardAvoidingView style={globalStyles.screenContent}>
      <TextInput 
        style={globalStyles.inputBase}
        placeholder="Nombre"
      />
      <TextInput 
        style={[globalStyles.inputBase, globalStyles.inputError]}
        placeholder="Email"
      />
      <TouchableOpacity 
        style={[globalStyles.buttonBase, globalStyles.buttonPrimary]}
      >
        <Text>Enviar</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  </View>
);
```
