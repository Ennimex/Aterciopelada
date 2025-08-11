import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Image, Modal, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthProvider';
import { publicAPI } from '../../services/api';
import { globalStyles, mobileHelpers, stylesGlobal } from '../../styles/stylesGlobal';

// Types
interface Categoria {
  id: string;
  _id?: string;
  nombre: string;
  descripcion: string;
  imagenURL?: string;
  hasImage?: boolean;
}

interface Localidad {
  id: string;
  _id?: string;
  nombre: string;
  empresas: number;
}

interface Comentario {
  id: number;
  texto: string;
  usuario: string;
  fecha: string;
  rating: number;
}

type RootStackParamList = {
  ProductosScreen: { localidad: string };
  LoginScreen: undefined;
  ServiciosScreen: undefined;
  'auth/ScreenPerfil': undefined;
};

// Constants
const ICON_SETS = {
  localidades: ["🏛️", "🌆", "🏙️", "🌃", "🌉", "🌄", "🌅", "🌇", "🏰", "⛪"],
  categorias: {
    negocios: ["🏢", "🏣", "🏤", "🏥", "🏦", "🏪", "🏫", "🏬"],
    comida: ["🍽️", "🍴", "🍳", "🥘", "🥗", "🍕", "🌮", "🥪"],
    entretenimiento: ["🎭", "🎨", "🎪", "🎬", "🎮", "🎯", "🎲"],
    deportes: ["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉"],
    servicios: ["⚙️", "🔧", "🔨", "🛠️", "💻", "📱", "💡"],
    compras: ["🛍️", "🛒", "👕", "👗", "👔", "👠", "👜"],
    salud: ["⚕️", "💊", "🩺", "🔬", "🧬", "🦷"],
    belleza: ["💄", "💅", "💇", "💈", "👗", "👠"],
    educacion: ["📚", "✏️", "📝", "🎓", "🏫", "📖"],
    otros: ["🌟", "✨", "💫", "⭐", "🔆", "📍"],
  },
} as const;

// Utility functions
const getRandomIcon = (iconos: readonly string[]): string => {
  return iconos[Math.floor(Math.random() * iconos.length)];
};

const getCategoriaIcon = (nombre: string): string => {
  const nombreLower = nombre.toLowerCase();
  
  const categoryMap: Record<string, keyof typeof ICON_SETS.categorias> = {
    'restaurant|comida|aliment|café|bar|pizza': 'comida',
    'entreten|divers|espectác|teatro|cine': 'entretenimiento',
    'deport|fitness|gym|ejercicio|futbol': 'deportes',
    'servicio|profesional|técnico|reparación': 'servicios',
    'compra|tienda|ropa|calzado|mercado': 'compras',
    'salud|médico|hospital|clínica': 'salud',
    'belleza|estética|spa|peluquer': 'belleza',
    'educación|escuela|curso|academia': 'educacion',
    'negocio|empresa|corporativ|oficina': 'negocios',
  };
  
  for (const [pattern, category] of Object.entries(categoryMap)) {
    if (new RegExp(pattern).test(nombreLower)) {
      return getRandomIcon(ICON_SETS.categorias[category]);
    }
  }
  
  return getRandomIcon(ICON_SETS.categorias.otros);
};

const getLocalidadIcon = (): string => {
  return getRandomIcon(ICON_SETS.localidades);
};

// Custom hooks
const useHomeData = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load categories
      const categoriasResponse = await publicAPI.getCategorias();
      const categoriasProcessed = categoriasResponse.data.map((categoria: any) => ({
        ...categoria,
        id: categoria._id || categoria.id,
        hasImage: !!categoria.imagenURL,
      }));

      // Load locations
      let localidadesProcessed: Localidad[] = [];
      try {
        const localidadesResponse = await publicAPI.getLocalidades();
        if (Array.isArray(localidadesResponse)) {
          localidadesProcessed = localidadesResponse.map((localidad: any) => ({
            ...localidad,
            id: localidad._id || localidad.id,
          }));
        }
      } catch (localidadesError) {
        console.warn('Error loading localidades:', localidadesError);
      }

      setCategorias(categoriasProcessed);
      setLocalidades(localidadesProcessed);
      setComentarios([]); // Initialize empty comments
      
    } catch (err: any) {
      const errorMessage = err?.error || err?.message || 'Error desconocido';
      setError(errorMessage);
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    categorias,
    localidades,
    comentarios,
    isLoading,
    error,
    loadData,
    setComentarios,
  };
};

// Components
const LoadingScreen: React.FC = () => (
  <SafeAreaView style={globalStyles.screenBase}>
    <StatusBar barStyle="dark-content" backgroundColor={stylesGlobal.colors.surface.primary} />
    <View style={globalStyles.screenCentered}>
      <Text style={[globalStyles.textSecondary, { fontSize: stylesGlobal.typography.scale.lg }]}>
        Cargando...
      </Text>
    </View>
  </SafeAreaView>
);

const HeroSection: React.FC<{ onExplorarServicios: () => void }> = ({ onExplorarServicios }) => {
  const heroStyles = useMemo(() => ({
    container: {
      backgroundColor: stylesGlobal.colors.primary[50],
      paddingVertical: mobileHelpers.getDynamicSpacing(stylesGlobal.spacing.scale[16]),
      paddingHorizontal: stylesGlobal.spacing.scale[4],
      alignItems: 'center' as const,
    },
    title: {
      fontSize: mobileHelpers.getDynamicFontSize(stylesGlobal.typography.scale['3xl']),
      fontWeight: stylesGlobal.typography.weights.bold as any,
      color: stylesGlobal.colors.text.primary,
      textAlign: 'center' as const,
      marginBottom: stylesGlobal.spacing.scale[3],
    },
    subtitle: {
      fontSize: mobileHelpers.getDynamicFontSize(stylesGlobal.typography.scale.lg),
      color: stylesGlobal.colors.text.secondary,
      textAlign: 'center' as const,
      lineHeight: stylesGlobal.typography.scale.lg * stylesGlobal.typography.lineHeights.relaxed,
      marginBottom: stylesGlobal.spacing.scale[6],
    },
  }), []);

  return (
    <View style={heroStyles.container}>
      <Text style={heroStyles.title}>Descubre La Aterciopelada</Text>
      <Text style={heroStyles.subtitle}>
        Encuentra los mejores servicios y lugares de tu ciudad en un solo lugar
      </Text>
      <TouchableOpacity
        style={[globalStyles.buttonBase, globalStyles.buttonPrimary]}
        onPress={onExplorarServicios}
        activeOpacity={0.8}
      >
        <Text style={{ 
          color: stylesGlobal.colors.primary.contrast,
          fontWeight: stylesGlobal.typography.weights.semibold as any,
          fontSize: stylesGlobal.typography.scale.base,
        }}>
          Explorar Servicios
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const CategoriaCard: React.FC<{
  categoria: Categoria;
}> = React.memo(({ categoria }) => {
  const cardStyles = useMemo(() => ({
    container: {
      backgroundColor: stylesGlobal.colors.surface.primary,
      borderRadius: 12,
      padding: stylesGlobal.spacing.scale[4],
      marginRight: stylesGlobal.spacing.scale[3],
      width: mobileHelpers.screen.width * 0.4,
      alignItems: 'center' as const,
      ...stylesGlobal.shadows.base,
    },
    imageContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: stylesGlobal.colors.primary[100],
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginBottom: stylesGlobal.spacing.scale[2],
    },
    title: {
      fontSize: stylesGlobal.typography.scale.sm,
      fontWeight: stylesGlobal.typography.weights.semibold as any,
      color: stylesGlobal.colors.text.primary,
      textAlign: 'center' as const,
      marginBottom: stylesGlobal.spacing.scale[1],
    },
    description: {
      fontSize: stylesGlobal.typography.scale.xs,
      color: stylesGlobal.colors.text.tertiary,
      textAlign: 'center' as const,
    },
  }), []);

  return (
    <View style={cardStyles.container}>
      {categoria.imagenURL && categoria.hasImage ? (
        <Image
          source={{ uri: categoria.imagenURL }}
          style={[cardStyles.imageContainer, { backgroundColor: 'transparent' }]}
          resizeMode="cover"
        />
      ) : (
        <View style={cardStyles.imageContainer}>
          <Text style={{ 
            fontSize: stylesGlobal.typography.scale['2xl'],
            color: stylesGlobal.colors.primary[500],
          }}>
            {getCategoriaIcon(categoria.nombre)}
          </Text>
        </View>
      )}
      <Text style={cardStyles.title}>{categoria.nombre}</Text>
      <Text style={cardStyles.description} numberOfLines={2}>
        {categoria.descripcion}
      </Text>
    </View>
  );
});

const LocalidadItem: React.FC<{
  localidad: Localidad;
  onPress: (localidad: Localidad) => void;
}> = React.memo(({ localidad, onPress }) => {
  const itemStyles = useMemo(() => ({
    container: {
      backgroundColor: stylesGlobal.colors.surface.primary,
      borderRadius: 8,
      padding: stylesGlobal.spacing.scale[4],
      marginBottom: stylesGlobal.spacing.scale[3],
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      ...stylesGlobal.shadows.sm,
    },
    content: {
      flex: 1,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
    },
    title: {
      fontSize: stylesGlobal.typography.scale.base,
      fontWeight: stylesGlobal.typography.weights.semibold as any,
      color: stylesGlobal.colors.text.primary,
    },
    subtitle: {
      fontSize: stylesGlobal.typography.scale.sm,
      color: stylesGlobal.colors.text.secondary,
    },
  }), []);

  return (
    <TouchableOpacity
      style={itemStyles.container}
      onPress={() => onPress(localidad)}
      activeOpacity={0.8}
    >
      <Text style={{ 
        fontSize: stylesGlobal.typography.scale['2xl'],
        marginRight: stylesGlobal.spacing.scale[3],
      }}>
        {getLocalidadIcon()}
      </Text>
      <View style={itemStyles.content}>
        <Text style={itemStyles.title}>{localidad.nombre}</Text>
        <Text style={itemStyles.subtitle}>{localidad.empresas} </Text>
      </View>
      <Text style={{ color: stylesGlobal.colors.text.tertiary }}>›</Text>
    </TouchableOpacity>
  );
});

const CommentSection: React.FC<{
  comentarios: Comentario[];
  comentarioTexto: string;
  setComentarioTexto: (text: string) => void;
  onSubmitComentario: () => void;
  isAuthenticated: boolean;
  onLoginPress: () => void;
}> = ({
  comentarios,
  comentarioTexto,
  setComentarioTexto,
  onSubmitComentario,
  isAuthenticated,
  onLoginPress,
}) => {
  const sectionStyles = useMemo(() => ({
    title: {
      fontSize: mobileHelpers.getDynamicFontSize(stylesGlobal.typography.scale['2xl']),
      fontWeight: stylesGlobal.typography.weights.semibold as any,
      color: stylesGlobal.colors.text.primary,
      marginBottom: stylesGlobal.spacing.scale[4],
      marginTop: stylesGlobal.spacing.scale[8],
    },
    inputContainer: {
      backgroundColor: stylesGlobal.colors.surface.secondary,
      borderRadius: 8,
      padding: stylesGlobal.spacing.scale[4],
      marginBottom: stylesGlobal.spacing.scale[4],
    },
    loginPrompt: {
      backgroundColor: stylesGlobal.colors.primary[50],
      borderRadius: 8,
      padding: stylesGlobal.spacing.scale[4],
      alignItems: 'center' as const,
      marginTop: stylesGlobal.spacing.scale[4],
    },
  }), []);

  return (
    <>
      <Text style={sectionStyles.title}>Lo que dicen nuestros usuarios</Text>
      
      {isAuthenticated ? (
        <View style={sectionStyles.inputContainer}>
          <TextInput
            style={[globalStyles.inputBase, { marginBottom: stylesGlobal.spacing.scale[3] }]}
            placeholder="Comparte tu experiencia..."
            value={comentarioTexto}
            onChangeText={setComentarioTexto}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[globalStyles.buttonSm, globalStyles.buttonPrimary]}
            onPress={onSubmitComentario}
            activeOpacity={0.8}
          >
            <Text style={{
              color: stylesGlobal.colors.primary.contrast,
              fontWeight: stylesGlobal.typography.weights.semibold as any,
            }}>
              Enviar Comentario
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={sectionStyles.loginPrompt}>
          <Text style={{
            fontSize: stylesGlobal.typography.scale.base,
            color: stylesGlobal.colors.text.primary,
            fontWeight: stylesGlobal.typography.weights.semibold as any,
            marginBottom: stylesGlobal.spacing.scale[2],
          }}>
            ¡Únete a nuestra comunidad!
          </Text>
          <Text style={{
            fontSize: stylesGlobal.typography.scale.sm,
            color: stylesGlobal.colors.text.secondary,
            textAlign: 'center',
            marginBottom: stylesGlobal.spacing.scale[4],
          }}>
            Inicia sesión para dejar comentarios y acceder a funciones exclusivas
          </Text>
          <TouchableOpacity
            style={[globalStyles.buttonBase, globalStyles.buttonSecondary]}
            onPress={onLoginPress}
            activeOpacity={0.8}
          >
            <Text style={{
              color: stylesGlobal.colors.secondary[500],
              fontWeight: stylesGlobal.typography.weights.semibold as any,
            }}>
              Iniciar Sesión
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {comentarios.map((comentario) => (
        <View
          key={comentario.id}
          style={{
            backgroundColor: stylesGlobal.colors.surface.primary,
            borderRadius: 8,
            padding: stylesGlobal.spacing.scale[4],
            marginBottom: stylesGlobal.spacing.scale[3],
            borderLeftWidth: 3,
            borderLeftColor: stylesGlobal.colors.primary[500],
            ...stylesGlobal.shadows.sm,
          }}
        >
          <Text style={{
            fontSize: stylesGlobal.typography.scale.sm,
            color: stylesGlobal.colors.text.primary,
            lineHeight: stylesGlobal.typography.scale.sm * stylesGlobal.typography.lineHeights.normal,
            marginBottom: stylesGlobal.spacing.scale[2],
          }}>
            "{comentario.texto}"
          </Text>
          <View style={globalStyles.flexRow}>
            <Text style={{
              fontSize: stylesGlobal.typography.scale.xs,
              color: stylesGlobal.colors.text.secondary,
              fontWeight: stylesGlobal.typography.weights.semibold as any,
              flex: 1,
            }}>
              {comentario.usuario}
            </Text>
            <Text style={{
              fontSize: stylesGlobal.typography.scale.xs,
              color: stylesGlobal.colors.text.tertiary,
            }}>
              {comentario.fecha}
            </Text>
          </View>
        </View>
      ))}
    </>
  );
};

// Simple Menu Modal Component
const MenuModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
  onProfilePress: () => void;
}> = ({ visible, onClose, onLogout, onProfilePress }) => {
  const modalStyles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: stylesGlobal.colors.surface.primary,
      borderRadius: 12,
      padding: stylesGlobal.spacing.scale[6],
      margin: stylesGlobal.spacing.scale[4],
      minWidth: mobileHelpers.screen.width * 0.7,
      maxWidth: mobileHelpers.screen.width * 0.9,
      ...stylesGlobal.shadows.base,
    },
    title: {
      fontSize: stylesGlobal.typography.scale.xl,
      fontWeight: stylesGlobal.typography.weights.bold as any,
      color: stylesGlobal.colors.text.primary,
      textAlign: 'center',
      marginBottom: stylesGlobal.spacing.scale[6],
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: stylesGlobal.spacing.scale[4],
      paddingHorizontal: stylesGlobal.spacing.scale[3],
      borderRadius: 8,
      marginBottom: stylesGlobal.spacing.scale[2],
    },
    menuItemText: {
      fontSize: stylesGlobal.typography.scale.base,
      color: stylesGlobal.colors.text.primary,
      marginLeft: stylesGlobal.spacing.scale[3],
      fontWeight: stylesGlobal.typography.weights.medium as any,
    },
    closeButton: {
      backgroundColor: stylesGlobal.colors.surface.secondary,
      paddingVertical: stylesGlobal.spacing.scale[3],
      borderRadius: 8,
      alignItems: 'center',
      marginTop: stylesGlobal.spacing.scale[4],
    },
    closeButtonText: {
      fontSize: stylesGlobal.typography.scale.base,
      color: stylesGlobal.colors.text.secondary,
      fontWeight: stylesGlobal.typography.weights.medium as any,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={modalStyles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={modalStyles.modalContainer}
          activeOpacity={1}
          onPress={() => {}} // Prevent modal close when tapping inside
        >
          <Text style={modalStyles.title}>Mi Cuenta</Text>
          
          <TouchableOpacity
            style={modalStyles.menuItem}
            onPress={() => {
              onProfilePress();
              onClose();
            }}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: stylesGlobal.typography.scale.lg }}>👤</Text>
            <Text style={modalStyles.menuItemText}>Editar Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={modalStyles.menuItem}
            onPress={() => {
              onLogout();
              onClose();
            }}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: stylesGlobal.typography.scale.lg }}>🚪</Text>
            <Text style={modalStyles.menuItemText}>Cerrar Sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={modalStyles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={modalStyles.closeButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// Header with Menu Button
const Header: React.FC<{
  isAuthenticated: boolean;
  onMenuPress: () => void;
}> = ({ isAuthenticated, onMenuPress }) => {
  const headerStyles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: stylesGlobal.spacing.scale[4],
      paddingVertical: stylesGlobal.spacing.scale[3],
      backgroundColor: stylesGlobal.colors.surface.primary,
      borderBottomWidth: 1,
      borderBottomColor: stylesGlobal.colors.surface.secondary,
    },
    title: {
      fontSize: stylesGlobal.typography.scale.lg,
      fontWeight: stylesGlobal.typography.weights.semibold as any,
      color: stylesGlobal.colors.text.primary,
    },
    menuButton: {
      padding: stylesGlobal.spacing.scale[2],
      borderRadius: 8,
      backgroundColor: stylesGlobal.colors.primary[50],
    },
  });

  if (!isAuthenticated) {
    return (
      <View style={headerStyles.container}>
        <Text style={headerStyles.title}>La Aterciopelada</Text>
        <View style={{ width: 40 }} />
      </View>
    );
  }

  return (
    <View style={headerStyles.container}>
      <Text style={headerStyles.title}>La Aterciopelada</Text>
      <TouchableOpacity
        style={headerStyles.menuButton}
        onPress={onMenuPress}
        activeOpacity={0.7}
      >
        <Text style={{
          fontSize: stylesGlobal.typography.scale.lg,
          color: stylesGlobal.colors.primary[500],
        }}>
          ☰
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Main component
const Index: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, isAuthenticated, logout } = useAuth();
  const [comentarioTexto, setComentarioTexto] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isMenuModalVisible, setIsMenuModalVisible] = useState(false);

  const {
    categorias,
    localidades,
    comentarios,
    isLoading,
    error,
    loadData,
  } = useHomeData();

  // Load initial data
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleLocalidadPress = useCallback((localidad: Localidad) => {
    navigation.navigate('ProductosScreen', { localidad: localidad.nombre });
  }, [navigation]);

  const handleExplorarServicios = useCallback(() => {
    // Navega a la pantalla de servicios.
    navigation.navigate('ServiciosScreen');
  }, [navigation]);

  const handleSubmitComentario = useCallback(async () => {
    if (!comentarioTexto.trim()) {
      Alert.alert('Error', 'Por favor escribe un comentario');
      return;
    }

    if (!isAuthenticated || !user?.id) {
      Alert.alert('Inicia Sesión', 'Debes iniciar sesión para comentar');
      return;
    }

    try {
      // TODO: Implement actual API call
      Alert.alert('Información', 'Función en desarrollo');
      setComentarioTexto('');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo enviar el comentario');
    }
  }, [comentarioTexto, isAuthenticated, user]);

  const handleLoginPress = useCallback(() => {
    navigation.navigate('LoginScreen');
  }, [navigation]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      Alert.alert('Éxito', 'Sesión cerrada correctamente');
      navigation.replace('LoginScreen');
    } catch (err: any) {
      Alert.alert('Error', 'No se pudo cerrar la sesión');
    }
  }, [logout, navigation]);

  const handleProfilePress = useCallback(() => {
    navigation.navigate('auth/ScreenPerfil');
  }, [navigation]);

  const handleMenuPress = useCallback(() => {
    setIsMenuModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsMenuModalVisible(false);
  }, []);

  // Render loading state
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaView style={globalStyles.screenBase}>
        <StatusBar barStyle="dark-content" backgroundColor={stylesGlobal.colors.surface.primary} />
        <View style={globalStyles.screenCentered}>
          <Text style={[globalStyles.textSecondary, { textAlign: 'center', marginBottom: 16 }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[globalStyles.buttonBase, globalStyles.buttonPrimary]}
            onPress={loadData}
            activeOpacity={0.8}
          >
            <Text style={{ color: stylesGlobal.colors.primary.contrast }}>
              Reintentar
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.screenBase}>
      <StatusBar barStyle="dark-content" backgroundColor={stylesGlobal.colors.surface.primary} />
      
      <Header 
        isAuthenticated={isAuthenticated}
        onMenuPress={handleMenuPress}
      />
      
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[stylesGlobal.colors.primary[500]]}
            tintColor={stylesGlobal.colors.primary[500]}
          />
        }
      >
        <HeroSection onExplorarServicios={handleExplorarServicios} />
        
        <View style={globalStyles.screenContent}>
          {/* Categories Section */}
          <Text style={{
            fontSize: mobileHelpers.getDynamicFontSize(stylesGlobal.typography.scale['2xl']),
            fontWeight: stylesGlobal.typography.weights.semibold as any,
            color: stylesGlobal.colors.text.primary,
            marginBottom: stylesGlobal.spacing.scale[4],
            marginTop: stylesGlobal.spacing.scale[8],
          }}>
            Categorías Principales
          </Text>
          
          <FlatList
            data={categorias}
            renderItem={({ item }) => (
              <CategoriaCard categoria={item} />
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: stylesGlobal.spacing.scale[4] }}
          />

          {/* Locations Section */}
          <Text style={{
            fontSize: mobileHelpers.getDynamicFontSize(stylesGlobal.typography.scale['2xl']),
            fontWeight: stylesGlobal.typography.weights.semibold as any,
            color: stylesGlobal.colors.text.primary,
            marginBottom: stylesGlobal.spacing.scale[4],
            marginTop: stylesGlobal.spacing.scale[8],
          }}>
            Explora por Localidades
          </Text>
          
          {localidades.map((localidad) => (
            <LocalidadItem
              key={localidad.id}
              localidad={localidad}
              onPress={handleLocalidadPress}
            />
          ))}

          {/* Comments Section */}
          <CommentSection
            comentarios={comentarios}
            comentarioTexto={comentarioTexto}
            setComentarioTexto={setComentarioTexto}
            onSubmitComentario={handleSubmitComentario}
            isAuthenticated={isAuthenticated}
            onLoginPress={handleLoginPress}
          />
        </View>
      </ScrollView>

      {/* Menu Modal */}
      <MenuModal
        visible={isMenuModalVisible}
        onClose={handleCloseModal}
        onLogout={handleLogout}
        onProfilePress={handleProfilePress}
      />
    </SafeAreaView>
  );
};

export default Index;