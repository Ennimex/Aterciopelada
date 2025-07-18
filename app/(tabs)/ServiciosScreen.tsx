import React, { useEffect, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { publicAPI } from '../../services/api';

// Datos proporcionados
const beneficiosData = [
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
];

// Estado para los servicios obtenidos de la API
interface Servicio {
  _id?: string;
  id?: string;
  nombre: string;
  titulo?: string;
  descripcion: string;
  imagen?: string;
  icono?: string;
}

const ArtisanServicesScreen = () => {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);

  // Determinar tamaño de pantalla para márgenes responsivos
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;

  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const response = await publicAPI.getServicios();
        // El backend regresa un array directamente
        // Normalizar id a string para compatibilidad con el componente
        const arr = Array.isArray(response) ? response : response.data ?? [];
        setServicios(arr.map((serv: any) => ({
          ...serv,
          id: serv._id ? String(serv._id) : (serv.id ? String(serv.id) : undefined)
        })));
      } catch (error) {
        setServicios([]);
      } finally {
        setLoading(false);
      }
    };
    fetchServicios();
  }, []);

  // Estilos inyectados directamente
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fefcf3', // Fondo cálido
    },
    heroContainer: {
      backgroundColor: '#fdf2f4',
      paddingVertical: 16,
      paddingHorizontal: isSmallScreen ? 12 : 16,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    heroIcon: {
      fontSize: 40,
      marginRight: 12,
      color: '#d63384',
    },
    heroTitle: {
      fontSize: 26,
      fontWeight: '600',
      color: '#2a241f',
    },
    heroSubtitle: {
      fontSize: 16,
      color: '#524842',
      textAlign: 'center',
      marginVertical: 12,
      marginHorizontal: isSmallScreen ? 12 : 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: '#2a241f',
      marginVertical: 12,
      marginHorizontal: isSmallScreen ? 12 : 16,
    },
    serviceScroll: {
      paddingHorizontal: isSmallScreen ? 12 : 16,
      paddingBottom: 12,
    },
    serviceCard: {
      backgroundColor: '#ffffff',
      borderRadius: 16,
      padding: 12,
      marginRight: 12,
      width: 200, // Ancho fijo para tarjetas
      shadowColor: '#2a241f',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
      alignItems: 'center',
    },
    serviceIconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: '#fce7eb',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    serviceIcon: {
      fontSize: 40,
      color: '#d63384',
    },
    serviceTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: '#2a241f',
      textAlign: 'center',
      marginBottom: 4,
    },
    serviceDescription: {
      fontSize: 12,
      color: '#8b7d74',
      textAlign: 'center',
      lineHeight: 18,
    },
    benefitContainer: {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      padding: 12,
      marginHorizontal: isSmallScreen ? 12 : 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: '#e6a756',
      shadowColor: '#2a241f',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    benefitIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#fef7e0',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    benefitIcon: {
      fontSize: 32,
      color: '#e6a756',
    },
    benefitContent: {
      flex: 1,
    },
    benefitTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: '#2a241f',
      marginBottom: 4,
    },
    benefitDescription: {
      fontSize: 14,
      color: '#8b7d74',
      lineHeight: 20,
    },
    exploreButton: {
      position: 'absolute',
      bottom: 16,
      left: isSmallScreen ? 12 : 16,
      right: isSmallScreen ? 12 : 16,
      backgroundColor: '#d63384',
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: '#e6a756',
      alignItems: 'center',
      shadowColor: '#d63384',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 32,
      elevation: 4,
    },
    exploreButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#ffffff',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Text style={styles.heroIcon}>🌿</Text>
          <Text style={styles.heroTitle}>Artesanía Huasteca</Text>
        </View>
        <Text style={styles.heroSubtitle}>
          Explora la belleza de nuestras tradiciones textiles
        </Text>

        {/* Servicios Section (Horizontal Scroll) */}
        <Text style={styles.sectionTitle}>Nuestros Servicios</Text>
        {loading ? (
          <Text style={{ textAlign: 'center', marginVertical: 16 }}>Cargando servicios...</Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.serviceScroll}
            snapToInterval={212}
            decelerationRate="fast"
          >
            {servicios.map((service) => (
              <TouchableOpacity
                key={service._id || service.id || service.nombre}
                style={styles.serviceCard}
                onPress={() => {
                  // TODO: Implementar navegación a detalles del servicio
                }}
              >
                {service.imagen ? (
                  <View style={styles.serviceIconContainer}>
                    <View style={{ width: 60, height: 60, borderRadius: 30, overflow: 'hidden', backgroundColor: '#fce7eb', justifyContent: 'center', alignItems: 'center' }}>
                      <Image
                        source={{ uri: service.imagen }}
                        style={{ width: 60, height: 60, borderRadius: 30 }}
                        resizeMode="cover"
                      />
                    </View>
                  </View>
                ) : (
                  <View style={styles.serviceIconContainer}>
                    <Text style={styles.serviceIcon}>{service.icono || '🧵'}</Text>
                  </View>
                )}
                <Text style={styles.serviceTitle}>{service.titulo || service.nombre}</Text>
                <Text style={styles.serviceDescription}>{service.descripcion}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Por Qué Elegirnos Section */}
        <Text style={styles.sectionTitle}>Por Qué Elegirnos</Text>
        {beneficiosData.map((benefit) => (
          <View key={benefit.id} style={styles.benefitContainer}>
            <View style={styles.benefitIconContainer}>
              <Text style={styles.benefitIcon}>{benefit.icono}</Text>
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>{benefit.titulo}</Text>
              <Text style={styles.benefitDescription}>{benefit.descripcion}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Botón Fijo de Acción eliminado */}
    </SafeAreaView>
  );
};

export default ArtisanServicesScreen;