import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthProvider';
import { publicAPI } from '../../services/api';
import { globalStyles, mobileHelpers, stylesGlobal } from '../../styles/stylesGlobal';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  ProductosScreen: { localidad: string };
  // ...otros screens si los tienes
};

const index = () => {
  // Estados con tipado correcto
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [categorias, setCategorias] = useState<any[]>([]);
  const [localidades, setLocalidades] = useState<any[]>([]);
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [comentarioTexto, setComentarioTexto] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");

  // Usar el contexto de autenticación real
  const { user, isAuthenticated } = useAuth();

  // Conjunto de iconos disponibles por tipo
  const iconosDisponibles = {
    localidades: ["🏛️", "🌆", "🏙️", "🌃", "🌉", "🌄", "🌅", "🌇", "🏰", "⛪", "🕌", "🕍", "🏢", "🏣", "🏤", "🏥", "🏦", "🏨", "🏪", "🏫"],
    categorias: {
      negocios: ["🏢", "🏣", "🏤", "🏥", "🏦", "🏪", "🏫", "🏬", "🏭", "🏯", "🏰"],
      comida: ["🍽️", "🍴", "🍳", "🥘", "🥗", "🍕", "🌮", "🥪", "🍜", "🍱", "🍲"],
      entretenimiento: ["🎭", "🎨", "🎪", "🎬", "🎮", "🎯", "🎲", "🎸", "🎹", "🎷", "🎺"],
      deportes: ["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🎱", "🏓", "🏸", "🏊"],
      servicios: ["⚙️", "🔧", "🔨", "🛠️", "💻", "📱", "💡", "🔌", "📡", "🛂", "🔑"],
      compras: ["🛍️", "🛒", "👕", "👗", "👔", "👠", "👜", "💎", "�", "📦", "🏷️"],
      salud: ["⚕️", "💊", "�", "🩺", "🔬", "🧬", "🦷", "👨‍⚕️", "🧪", "🩹", "💉"],
      belleza: ["💄", "💅", "💇", "💈", "👗", "👠", "💃", "�", "💆", "👄", "💋"],
      educacion: ["📚", "✏️", "📝", "🎓", "🏫", "📖", "🔬", "🎨", "🎵", "📐", "🗣️"],
      otros: ["🌟", "✨", "💫", "⭐", "🔆", "📍", "🎯", "🎪", "🎨", "🎭", "�"]
    }
  };

  // Función para obtener un icono aleatorio de un array
  const getRandomIcon = (iconos: string[]) => {
    return iconos[Math.floor(Math.random() * iconos.length)];
  };

  // Función para obtener icono de localidad
  const getLocalidadIcon = (nombre: string) => {
    return getRandomIcon(iconosDisponibles.localidades);
  };

  // Función para obtener icono de categoría basado en palabras clave
  const getCategoriaIcon = (nombre: string) => {
    const nombreLower = nombre.toLowerCase();
    let categoria: keyof typeof iconosDisponibles.categorias = 'otros';

    if (nombreLower.match(/restaurant|comida|aliment|café|bar|pizza|taco|sushi/)) {
      categoria = 'comida';
    } else if (nombreLower.match(/entreten|divers|espectác|teatro|cine|juego/)) {
      categoria = 'entretenimiento';
    } else if (nombreLower.match(/deport|fitness|gym|ejercicio|futbol|tenis/)) {
      categoria = 'deportes';
    } else if (nombreLower.match(/servicio|profesional|técnico|reparación/)) {
      categoria = 'servicios';
    } else if (nombreLower.match(/compra|tienda|ropa|calzado|mercado|comercio/)) {
      categoria = 'compras';
    } else if (nombreLower.match(/salud|médico|hospital|clínica|consultorio/)) {
      categoria = 'salud';
    } else if (nombreLower.match(/belleza|estética|spa|peluquer|manicur/)) {
      categoria = 'belleza';
    } else if (nombreLower.match(/educación|escuela|curso|academia|universidad/)) {
      categoria = 'educacion';
    } else if (nombreLower.match(/negocio|empresa|corporativ|oficina/)) {
      categoria = 'negocios';
    }

    return getRandomIcon(iconosDisponibles.categorias[categoria]);
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);

      // Cargar categorías de la API
      const categoriasResponse = await publicAPI.getCategorias();

      // Procesar categorías
      const categoriasConImagenes = categoriasResponse.data.map(
        (categoria: any) => {
          return {
            ...categoria,
            id: categoria._id || categoria.id, // MongoDB usa _id
            hasImage: !!categoria.imagenURL
          };
        }
      );

      // Intentar cargar localidades por separado
      let localidadesConEmpresas = [];
      try {
        const localidadesResponse = await publicAPI.getLocalidades();

        // La respuesta es un array directo, no un objeto con propiedad data
        if (Array.isArray(localidadesResponse)) {
          localidadesConEmpresas = localidadesResponse.map(
            (localidad: any) => ({
              ...localidad,
              id: localidad._id || localidad.id // MongoDB usa _id
            })
          );
        } else {
          throw new Error("Estructura de datos inválida");
        }
      } catch (localidadesError) {
        console.error("Error al cargar localidades:", localidadesError);
        localidadesConEmpresas = [];
      }

      // Inicializar array de comentarios vacío
      const mockComentarios: Array<{
        id: number;
        texto: string;
        usuario: string;
        fecha: string;
        rating: number;
      }> = [];

      setCategorias(categoriasConImagenes);
      setLocalidades(localidadesConEmpresas);
      setComentarios(mockComentarios);
    } catch (error: any) {
      const errorMessage =
        error?.error || error?.message || "Error desconocido";
      Alert.alert("Error cargando categorías", errorMessage);

      // ...eliminado fallback a datos mock, solo muestra alerta...
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh control
  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  // Manejar navegación a categoría específica
  const handleCategoriaPress = async (categoria: any) => {
    try {
      // Aquí podrías navegar a una pantalla de productos por categoría
      // Por ahora mostraremos un alert con información
      Alert.alert(
        categoria.nombre,
        `${categoria.descripcion || "Explora esta categoría"}`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Ver Productos",
            onPress: () => {
              // TODO: Navegar a pantalla de productos filtrados por categoría
            }
          }
        ]
      );
    } catch (error) {
      console.error("Error handling categoria press:", error);
    }
  };

  // Manejar navegación a localidad específica
  const handleLocalidadPress = (localidad: any) => {
    navigation.navigate("ProductosScreen", { localidad: localidad.nombre });
  };

  // Manejar envío de comentario
  const handleSubmitComentario = async () => {
    if (!comentarioTexto.trim()) {
      Alert.alert("Error", "Por favor escribe un comentario");
      return;
    }

    if (!isAuthenticated) {
      Alert.alert("Inicia Sesión", "Debes iniciar sesión para comentar");
      return;
    }

    try {
      if (!user?.id) {
        throw new Error("Usuario no identificado");
      }

      // En este punto deberías implementar la llamada real a tu API
      Alert.alert("Información", "Función en desarrollo");
      setComentarioTexto("");
      
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo enviar el comentario");
    }
  };

  // Manejar navegación a explorar servicios
  const handleExplorarServicios = async () => {
    try {
      // Cargar servicios disponibles
      const serviciosResponse = await publicAPI.getServicios();
      const serviciosCount = serviciosResponse.data.length;

      Alert.alert(
        "Explorar Servicios",
        `Tenemos ${serviciosCount} servicios disponibles para ti.\n\n¿Qué te gustaría explorar?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Ver Todos",
            onPress: () => {
              // TODO: Navegar a pantalla de servicios
            }
          },
          {
            text: "Por Categoría",
            onPress: () => {
              // TODO: Navegar a categorías
            }
          }
        ]
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        "No se pudieron cargar los servicios. Por favor, intenta más tarde.",
        [{ text: "OK", onPress: () => {} }]
      );
    }
  };

  // Estilos dinámicos basados en el tamaño de pantalla usando stylesGlobal correctamente
  const dynamicStyles = StyleSheet.create({
    heroContainer: {
      backgroundColor: stylesGlobal.colors.primary[50] as string,
      paddingVertical: mobileHelpers.getDynamicSpacing(
        stylesGlobal.spacing.sections.md
      ),
      paddingHorizontal: stylesGlobal.spacing.mobile.content,
      alignItems: "center" as const
    },
    heroTitle: {
      fontSize: mobileHelpers.getDynamicFontSize(
        stylesGlobal.typography.scale["3xl"]
      ),
      fontWeight: stylesGlobal.typography.weights.bold as any,
      color: stylesGlobal.colors.text.primary as string,
      textAlign: "center" as const,
      marginBottom: stylesGlobal.spacing.scale[3]
    },
    heroSubtitle: {
      fontSize: mobileHelpers.getDynamicFontSize(
        stylesGlobal.typography.scale.lg
      ),
      color: stylesGlobal.colors.text.secondary as string,
      textAlign: "center" as const,
      lineHeight: Math.round(
        stylesGlobal.typography.leading.relaxed *
          stylesGlobal.typography.scale.lg
      ),
      marginBottom: stylesGlobal.spacing.scale[6]
    },
    sectionTitle: {
      fontSize: mobileHelpers.getDynamicFontSize(
        stylesGlobal.typography.scale["2xl"]
      ),
      fontWeight: stylesGlobal.typography.weights.semibold as any,
      color: stylesGlobal.colors.text.primary as string,
      marginBottom: stylesGlobal.spacing.scale[4],
      marginTop: stylesGlobal.spacing.scale[8]
    },
    categoryCard: {
      backgroundColor: stylesGlobal.colors.surface.primary as string,
      borderRadius: 12, // lg radius
      padding: stylesGlobal.spacing.scale[4],
      marginRight: stylesGlobal.spacing.scale[3],
      marginBottom: stylesGlobal.spacing.scale[3],
      width: mobileHelpers.screen.width * 0.4,
      alignItems: "center" as const,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3
    },
    localidadCard: {
      backgroundColor: stylesGlobal.colors.surface.primary as string,
      borderRadius: 8, // md radius
      padding: stylesGlobal.spacing.scale[4],
      marginBottom: stylesGlobal.spacing.scale[3],
      flexDirection: "row" as const,
      alignItems: "center" as const,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2
    },
    categoryTitle: {
      fontSize: stylesGlobal.typography.scale.sm,
      fontWeight: stylesGlobal.typography.weights.semibold as any,
      color: stylesGlobal.colors.text.primary as string,
      textAlign: "center" as const,
      marginBottom: stylesGlobal.spacing.scale[1]
    },
    categoryDescription: {
      fontSize: stylesGlobal.typography.scale.xs,
      color: stylesGlobal.colors.text.tertiary as string,
      textAlign: "center" as const
    },
    localidadTitle: {
      fontSize: stylesGlobal.typography.scale.base,
      fontWeight: stylesGlobal.typography.weights.semibold as any,
      color: stylesGlobal.colors.text.primary as string,
      marginBottom: stylesGlobal.spacing.scale[1]
    },
    localidadSubtitle: {
      fontSize: stylesGlobal.typography.scale.sm,
      color: stylesGlobal.colors.text.secondary as string
    },
    arrowIcon: {
      color: stylesGlobal.colors.text.tertiary as string
    }
  });

  if (isLoading) {
    return (
      <SafeAreaView style={globalStyles.screenBase}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={stylesGlobal.colors.surface.primary as string}
        />
        <View style={globalStyles.screenCentered}>
          <Text
            style={{
              fontSize: stylesGlobal.typography.scale.lg,
              color: stylesGlobal.colors.text.secondary as string
            }}
          >
            Cargando...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.screenBase}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={stylesGlobal.colors.surface.primary as string}
      />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Hero Section */}
        <View style={dynamicStyles.heroContainer}>
          <Text style={dynamicStyles.heroTitle}>Descubre La Aterciopelada</Text>
          <Text style={dynamicStyles.heroSubtitle}>
            Encuentra los mejores servicios y lugares de tu ciudad en un solo
            lugar
          </Text>

          <TouchableOpacity
            style={[
              globalStyles.buttonBase,
              globalStyles.buttonPrimary,
              { marginTop: stylesGlobal.spacing.scale[4] }
            ]}
            onPress={handleExplorarServicios}
          >
            <Text
              style={{
                color: stylesGlobal.colors.primary.contrast as string,
                fontWeight: stylesGlobal.typography.weights.semibold as any
              }}
            >
              Explorar Servicios
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contenido Principal */}
        <View style={globalStyles.screenContent}>
          {/* Categorías Section */}
          <Text style={dynamicStyles.sectionTitle}>Categorías Principales</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: stylesGlobal.spacing.scale[4] }}
          >
            {categorias.map((categoria) => (
              <TouchableOpacity
                key={categoria.id}
                style={dynamicStyles.categoryCard}
                onPress={() => handleCategoriaPress(categoria)}
              >
                {/* Imagen de Cloudinary o placeholder */}
                {categoria.imagenURL && categoria.hasImage ? (
                  <Image
                    source={{ uri: categoria.imagenURL }}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      marginBottom: stylesGlobal.spacing.scale[2]
                    }}
                    resizeMode="cover"
                    onError={(error) => {
                      // Error silencioso al cargar imagen
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      backgroundColor: stylesGlobal.colors
                        .primary[100] as string,
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: stylesGlobal.spacing.scale[2]
                    }}
                  >
                    <Text
                      style={{
                        fontSize: stylesGlobal.typography.scale["2xl"],
                        color: stylesGlobal.colors.primary[500] as string
                      }}
                    >
                      {getCategoriaIcon(categoria.nombre)}
                    </Text>
                  </View>
                )}

                <Text
                  style={{
                    fontSize: stylesGlobal.typography.scale.sm,
                    fontWeight: stylesGlobal.typography.weights.semibold as any,
                    color: stylesGlobal.colors.text.primary as string,
                    textAlign: "center",
                    marginBottom: stylesGlobal.spacing.scale[1]
                  }}
                >
                  {categoria.nombre}
                </Text>
                <Text
                  style={{
                    fontSize: stylesGlobal.typography.scale.xs,
                    color: stylesGlobal.colors.text.tertiary as string,
                    textAlign: "center"
                  }}
                >
                  {categoria.descripcion}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Localidades Section */}
          <Text style={dynamicStyles.sectionTitle}>
            Explora por Localidades
          </Text>
          {localidades.map((localidad) => (
            <TouchableOpacity
              key={localidad.id}
              style={dynamicStyles.localidadCard}
              onPress={() => handleLocalidadPress(localidad)}
            >
              <Text
                style={{
                  fontSize: stylesGlobal.typography.scale["2xl"],
                  marginRight: stylesGlobal.spacing.scale[3]
                }}
              >
                {getLocalidadIcon(localidad.nombre)}
              </Text>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text
                  style={{
                    fontSize: stylesGlobal.typography.scale.base,
                    fontWeight: stylesGlobal.typography.weights.semibold as any,
                    color: stylesGlobal.colors.text.primary as string
                  }}
                >
                  {localidad.nombre}
                </Text>
                <Text
                  style={{
                    fontSize: stylesGlobal.typography.scale.sm,
                    color: stylesGlobal.colors.text.secondary as string
                  }}
                >
                  {localidad.empresas}
                </Text>
              </View>
              <Text
                style={{ color: stylesGlobal.colors.text.tertiary as string }}
              >
                ›
              </Text>
            </TouchableOpacity>
          ))}

          {/* Comentarios Section */}
          <Text style={dynamicStyles.sectionTitle}>
            Lo que dicen nuestros usuarios
          </Text>

          {/* Input para nuevo comentario */}
          {isAuthenticated && (
            <View
              style={{
                backgroundColor: stylesGlobal.colors.surface
                  .secondary as string,
                borderRadius: 8, // md radius
                padding: stylesGlobal.spacing.scale[4],
                marginBottom: stylesGlobal.spacing.scale[4]
              }}
            >
              <TextInput
                style={[
                  globalStyles.inputBase,
                  { marginBottom: stylesGlobal.spacing.scale[3] }
                ]}
                placeholder="Comparte tu experiencia..."
                value={comentarioTexto}
                onChangeText={setComentarioTexto}
                multiline
                numberOfLines={3}
              />
              <TouchableOpacity
                style={[globalStyles.buttonSm, globalStyles.buttonPrimary]}
                onPress={handleSubmitComentario}
              >
                <Text
                  style={{
                    color: stylesGlobal.colors.primary.contrast as string,
                    fontWeight: stylesGlobal.typography.weights.semibold as any
                  }}
                >
                  Enviar Comentario
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Lista de comentarios */}
          {comentarios.map((comentario) => (
            <View
              key={comentario.id}
              style={{
                backgroundColor: stylesGlobal.colors.surface.primary as string,
                borderRadius: 8, // md radius
                padding: stylesGlobal.spacing.scale[4],
                marginBottom: stylesGlobal.spacing.scale[3],
                borderLeftWidth: 3,
                borderLeftColor: stylesGlobal.colors.primary[500] as string,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1
              }}
            >
              <Text
                style={{
                  fontSize: stylesGlobal.typography.scale.sm,
                  color: stylesGlobal.colors.text.primary as string,
                  lineHeight: Math.round(
                    stylesGlobal.typography.leading.normal *
                      stylesGlobal.typography.scale.sm
                  ),
                  marginBottom: stylesGlobal.spacing.scale[2]
                }}
              >
                "{comentario.texto}"
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between"
                }}
              >
                <Text
                  style={{
                    fontSize: stylesGlobal.typography.scale.xs,
                    color: stylesGlobal.colors.text.secondary as string,
                    fontWeight: stylesGlobal.typography.weights.semibold as any
                  }}
                >
                  {comentario.usuario}
                </Text>
                <Text
                  style={{
                    fontSize: stylesGlobal.typography.scale.xs,
                    color: stylesGlobal.colors.text.tertiary as string
                  }}
                >
                  {comentario.fecha}
                </Text>
              </View>
            </View>
          ))}

          {/* Mensaje para usuarios no autenticados */}
          {!isAuthenticated && (
            <View
              style={{
                backgroundColor: stylesGlobal.colors.surface.accent as string,
                borderRadius: 8, // md radius
                padding: stylesGlobal.spacing.scale[4],
                alignItems: "center",
                marginTop: stylesGlobal.spacing.scale[4]
              }}
            >
              <Text
                style={{
                  fontSize: stylesGlobal.typography.scale.base,
                  color: stylesGlobal.colors.text.primary as string,
                  fontWeight: stylesGlobal.typography.weights.semibold as any,
                  marginBottom: stylesGlobal.spacing.scale[2]
                }}
              >
                ¡Únete a nuestra comunidad!
              </Text>
              <Text
                style={{
                  fontSize: stylesGlobal.typography.scale.sm,
                  color: stylesGlobal.colors.text.secondary as string,
                  textAlign: "center",
                  marginBottom: stylesGlobal.spacing.scale[4]
                }}
              >
                Inicia sesión para dejar comentarios y acceder a funciones
                exclusivas
              </Text>
              <TouchableOpacity
                style={[globalStyles.buttonBase, globalStyles.buttonSecondary]}
                onPress={() => {
                  // Navegar a login
                  Alert.alert("Login", "Navegando a inicio de sesión");
                }}
              >
                <Text
                  style={{
                    color: stylesGlobal.colors.secondary[500] as string,
                    fontWeight: stylesGlobal.typography.weights.semibold as any
                  }}
                >
                  Iniciar Sesión
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default index;