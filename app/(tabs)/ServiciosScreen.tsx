import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { publicAPI } from '../../services/api';

// Interfaces optimizadas
interface Servicio {
  _id?: string;
  id?: string;
  nombre: string;
  titulo?: string;
  descripcion: string;
  imagen?: string;
  icono?: string;
}

interface Beneficio {
  id: string;
  titulo: string;
  descripcion: string;
  icono: string;
}

interface StyleConstants {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    accent: string;
    accentLight: string;
    border: string;
    shadow: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    hero: number;
    title: number;
    subtitle: number;
    body: number;
    caption: number;
  };
}

// Constantes de diseño centralizadas
const STYLE_CONSTANTS: StyleConstants = {
  colors: {
    primary: '#d63384',
    secondary: '#e6a756',
    background: '#fefcf3',
    surface: '#ffffff',
    textPrimary: '#2a241f',
    textSecondary: '#524842',
    textMuted: '#8b7d74',
    accent: '#fce7eb',
    accentLight: '#fef7e0',
    border: '#e6a756',
    shadow: '#2a241f',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  typography: {
    hero: 26,
    title: 20,
    subtitle: 16,
    body: 14,
    caption: 12,
  },
} as const;

// Datos de beneficios optimizados con tipado
const BENEFICIOS_DATA: readonly Beneficio[] = [
  {
    id: "calidad",
    titulo: "Excelencia Artesanal",
    descripcion: "Cada pieza es meticulosamente elaborada por maestras artesanas con décadas de experiencia, garantizando la más alta calidad.",
    icono: "⭐",
  },
  {
    id: "autenticidad",
    titulo: "Herencia Cultural",
    descripcion: "Preservamos técnicas ancestrales huastecas, manteniendo viva la tradición textil de nuestros pueblos originarios.",
    icono: "🌿",
  },
  {
    id: "artesanos",
    titulo: "Comercio Justo",
    descripcion: "Trabajamos directamente con comunidades artesanales, asegurando condiciones dignas y precios justos.",
    icono: "👐",
  },
  {
    id: "exclusividad",
    titulo: "Piezas Únicas",
    descripcion: "Cada creación es irrepetible, diseñada especialmente para quienes valoran la autenticidad y la exclusividad.",
    icono: "💎",
  },
] as const;

const ArtisanServicesScreen: React.FC = () => {
  // Estados optimizados
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Dimensiones memoizadas
  const { width } = useMemo(() => Dimensions.get('window'), []);
  const isSmallScreen = useMemo(() => width < 375, [width]);

  // Estilos memoizados
  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: STYLE_CONSTANTS.colors.background,
    },
    heroContainer: {
      backgroundColor: '#fdf2f4',
      paddingVertical: STYLE_CONSTANTS.spacing.lg,
      paddingHorizontal: isSmallScreen ? STYLE_CONSTANTS.spacing.md : STYLE_CONSTANTS.spacing.lg,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    heroTitle: {
      fontSize: STYLE_CONSTANTS.typography.hero,
      fontWeight: '600',
      color: STYLE_CONSTANTS.colors.textPrimary,
      textAlign: 'center',
    },
    heroSubtitle: {
      fontSize: STYLE_CONSTANTS.typography.subtitle,
      color: STYLE_CONSTANTS.colors.textSecondary,
      textAlign: 'center',
      marginVertical: STYLE_CONSTANTS.spacing.md,
      marginHorizontal: isSmallScreen ? STYLE_CONSTANTS.spacing.md : STYLE_CONSTANTS.spacing.lg,
      lineHeight: 22,
    },
    sectionTitle: {
      fontSize: STYLE_CONSTANTS.typography.title,
      fontWeight: '600',
      color: STYLE_CONSTANTS.colors.textPrimary,
      marginVertical: STYLE_CONSTANTS.spacing.md,
      marginHorizontal: isSmallScreen ? STYLE_CONSTANTS.spacing.md : STYLE_CONSTANTS.spacing.lg,
    },
    serviceScroll: {
      paddingHorizontal: isSmallScreen ? STYLE_CONSTANTS.spacing.md : STYLE_CONSTANTS.spacing.lg,
      paddingBottom: STYLE_CONSTANTS.spacing.md,
    },
    serviceCard: {
      backgroundColor: STYLE_CONSTANTS.colors.surface,
      borderRadius: STYLE_CONSTANTS.borderRadius.lg,
      padding: STYLE_CONSTANTS.spacing.md,
      marginRight: STYLE_CONSTANTS.spacing.md,
      width: 200,
      shadowColor: STYLE_CONSTANTS.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(230, 167, 86, 0.1)',
    },
    serviceIconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: STYLE_CONSTANTS.colors.accent,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: STYLE_CONSTANTS.spacing.sm,
    },
    serviceIcon: {
      fontSize: 28,
      color: STYLE_CONSTANTS.colors.primary,
    },
    serviceTitle: {
      fontSize: STYLE_CONSTANTS.typography.subtitle,
      fontWeight: '600',
      color: STYLE_CONSTANTS.colors.textPrimary,
      textAlign: 'center',
      marginBottom: STYLE_CONSTANTS.spacing.xs,
    },
    serviceDescription: {
      fontSize: STYLE_CONSTANTS.typography.caption,
      color: STYLE_CONSTANTS.colors.textMuted,
      textAlign: 'center',
      lineHeight: 16,
    },
    benefitContainer: {
      backgroundColor: STYLE_CONSTANTS.colors.surface,
      borderRadius: STYLE_CONSTANTS.borderRadius.md,
      padding: STYLE_CONSTANTS.spacing.md,
      marginHorizontal: isSmallScreen ? STYLE_CONSTANTS.spacing.md : STYLE_CONSTANTS.spacing.lg,
      marginBottom: STYLE_CONSTANTS.spacing.md,
      borderWidth: 1,
      borderColor: STYLE_CONSTANTS.colors.border,
      shadowColor: STYLE_CONSTANTS.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    benefitIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: STYLE_CONSTANTS.colors.accentLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: STYLE_CONSTANTS.spacing.md,
    },
    benefitIcon: {
      fontSize: 24,
      color: STYLE_CONSTANTS.colors.secondary,
    },
    benefitContent: {
      flex: 1,
    },
    benefitTitle: {
      fontSize: STYLE_CONSTANTS.typography.subtitle,
      fontWeight: '600',
      color: STYLE_CONSTANTS.colors.textPrimary,
      marginBottom: STYLE_CONSTANTS.spacing.xs,
    },
    benefitDescription: {
      fontSize: STYLE_CONSTANTS.typography.body,
      color: STYLE_CONSTANTS.colors.textMuted,
      lineHeight: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 200,
    },
    errorContainer: {
      padding: STYLE_CONSTANTS.spacing.lg,
      alignItems: 'center',
    },
    errorText: {
      fontSize: STYLE_CONSTANTS.typography.body,
      color: STYLE_CONSTANTS.colors.textMuted,
      textAlign: 'center',
      marginTop: STYLE_CONSTANTS.spacing.sm,
    },
    retryButton: {
      backgroundColor: STYLE_CONSTANTS.colors.primary,
      paddingHorizontal: STYLE_CONSTANTS.spacing.lg,
      paddingVertical: STYLE_CONSTANTS.spacing.sm,
      borderRadius: STYLE_CONSTANTS.borderRadius.sm,
      marginTop: STYLE_CONSTANTS.spacing.md,
    },
    retryButtonText: {
      color: STYLE_CONSTANTS.colors.surface,
      fontSize: STYLE_CONSTANTS.typography.body,
      fontWeight: '600',
    },
    emptyServicesContainer: {
      alignItems: 'center',
      paddingVertical: STYLE_CONSTANTS.spacing.xl,
      paddingHorizontal: STYLE_CONSTANTS.spacing.lg,
    },
    emptyServicesText: {
      fontSize: STYLE_CONSTANTS.typography.body,
      color: STYLE_CONSTANTS.colors.textMuted,
      textAlign: 'center',
    },
  }), [isSmallScreen]);

  // Función para cargar servicios optimizada
  const fetchServicios = useCallback(async () => {
    try {
      setError(null);
      const response = await publicAPI.getServicios();
      
      // Normalizar respuesta de la API
      const serviciosArray = Array.isArray(response) ? response : response?.data ?? [];
      
      // Normalizar IDs y validar datos
      const serviciosNormalizados = serviciosArray
        .filter((servicio: any) => servicio && servicio.nombre) // Filtrar servicios válidos
        .map((servicio: any, index: number) => ({
          ...servicio,
          id: servicio._id ? String(servicio._id) : 
              (servicio.id ? String(servicio.id) : `servicio-${index}`)
        }));

      setServicios(serviciosNormalizados);
    } catch (error) {
      console.error('❌ Error fetching servicios:', error);
      setError('No se pudieron cargar los servicios');
      setServicios([]);
    }
  }, []);

  // Efecto para carga inicial
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await fetchServicios();
      setLoading(false);
    };

    loadInitialData();
  }, [fetchServicios]);

  // Handler para refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchServicios();
    setRefreshing(false);
  }, [fetchServicios]);

  // Handler para navegar a detalles del servicio
  const handleServicePress = useCallback((servicio: Servicio) => {
    // TODO: Implementar navegación a detalles del servicio
    console.log('Navigating to service:', servicio.nombre);
  }, []);

  // Handler para reintentar carga
  const handleRetry = useCallback(() => {
    setLoading(true);
    fetchServicios().finally(() => setLoading(false));
  }, [fetchServicios]);

  // Componente de tarjeta de servicio memoizado
  const ServiceCard = React.memo(({ service }: { service: Servicio }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => handleServicePress(service)}
      activeOpacity={0.8}
    >
      {service.imagen ? (
        <View style={styles.serviceIconContainer}>
          <View style={{ 
            width: 60, 
            height: 60, 
            borderRadius: 30, 
            overflow: 'hidden',
            backgroundColor: STYLE_CONSTANTS.colors.accent,
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Image
              source={{ uri: service.imagen }}
              style={{ width: 60, height: 60, borderRadius: 30 }}
              resizeMode="cover"
              loadingIndicatorSource={{ 
                uri: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' 
              }}
            />
          </View>
        </View>
      ) : (
        <View style={styles.serviceIconContainer}>
          <Text style={styles.serviceIcon}>{service.icono || '🧵'}</Text>
        </View>
      )}
      <Text style={styles.serviceTitle} numberOfLines={2}>
        {service.titulo || service.nombre}
      </Text>
      <Text style={styles.serviceDescription} numberOfLines={3}>
        {service.descripcion}
      </Text>
    </TouchableOpacity>
  ));

  // Componente de beneficio memoizado
  const BenefitCard = React.memo(({ benefit }: { benefit: Beneficio }) => (
    <View style={styles.benefitContainer}>
      <View style={styles.benefitIconContainer}>
        <Text style={styles.benefitIcon}>{benefit.icono}</Text>
      </View>
      <View style={styles.benefitContent}>
        <Text style={styles.benefitTitle}>{benefit.titulo}</Text>
        <Text style={styles.benefitDescription}>{benefit.descripcion}</Text>
      </View>
    </View>
  ));

  // Componente de servicios con manejo de estados
  const ServicesSection = React.memo(() => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={STYLE_CONSTANTS.colors.primary} />
          <Text style={styles.errorText}>Cargando servicios...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry} activeOpacity={0.8}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (servicios.length === 0) {
      return (
        <View style={styles.emptyServicesContainer}>
          <Text style={styles.emptyServicesText}>
            No hay servicios disponibles en este momento
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.serviceScroll}
        snapToInterval={212}
        decelerationRate="fast"
        removeClippedSubviews={true}
      >
        {servicios.map((service) => (
          <ServiceCard
            key={service._id || service.id || service.nombre}
            service={service}
          />
        ))}
      </ScrollView>
    );
  });

  // Componente principal del hero
  const HeroSection = React.memo(() => (
    <>
      <View style={styles.heroContainer}>
        <Text style={styles.heroTitle}>Artesanía Huasteca</Text>
      </View>
      <Text style={styles.heroSubtitle}>
        Explora la belleza de nuestras tradiciones textiles
      </Text>
    </>
  ));

  // Componente de beneficios
  const BenefitsSection = React.memo(() => (
    <>
      <Text style={styles.sectionTitle}>Por Qué Elegirnos</Text>
      {BENEFICIOS_DATA.map((benefit) => (
        <BenefitCard key={benefit.id} benefit={benefit} />
      ))}
    </>
  ));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[STYLE_CONSTANTS.colors.primary]}
            tintColor={STYLE_CONSTANTS.colors.primary}
          />
        }
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Hero Section */}
        <HeroSection />

        {/* Servicios Section */}
        <Text style={styles.sectionTitle}>Nuestros Servicios</Text>
        <ServicesSection />

        {/* Beneficios Section */}
        <BenefitsSection />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ArtisanServicesScreen;