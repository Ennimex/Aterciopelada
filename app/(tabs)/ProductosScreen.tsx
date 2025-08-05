import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, FlatList, Image, Linking, Modal, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { publicAPI } from '../../services/api';
import { globalStyles, stylesGlobal } from '../../styles/stylesGlobal';

// Interfaces
interface ProductoData {
  _id?: string;
  nombre: string;
  descripcion?: string;
  tipoTela?: string;
  imagenURL?: string;
  localidadId: string | LocalidadData;
  tallasDisponibles?: (string | TallaData)[];
  localidad?: LocalidadData;
  tallas?: TallaData[];
  categoriaId?: number;
  disponible?: boolean;
  id?: string;
}

interface LocalidadData {
  _id?: string;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

interface TallaData {
  _id?: string;
  categoriaId?: string;
  genero?: string;
  talla: string;
  rangoEdad?: string;
  medida?: string;
}

interface CategoriaData {
  id?: number | string;
  nombre: string;
  descripcion?: string;
  imagenURL?: string;
  activo?: boolean;
}

const { width } = Dimensions.get('window');

// Constantes de estilo
const styleConstants = {
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12
  },
  spacing: stylesGlobal.spacing.scale,
  colors: {
    ...stylesGlobal.colors,
    surface: {
      ...stylesGlobal.colors.surface,
      secondary: stylesGlobal.colors.surface.secondary,
      tertiary: stylesGlobal.colors.surface.tertiary
    }
  }
};

const ProductosScreen: React.FC = () => {
  // Estado para controlar si se presionó el botón de buscar
  const [searchTriggered, setSearchTriggered] = useState(false);
  // Leer parámetro de navegación
  const route = useRoute();
  const localidadParam = (route.params && (route.params as any).localidad) || null;
  // States
  const [productos, setProductos] = useState<ProductoData[]>([]);
  const [categorias, setCategorias] = useState<CategoriaData[]>([]); // Solo para mostrar nombre en modal
  const [filteredProductos, setFilteredProductos] = useState<ProductoData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<ProductoData | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  // Filtros adicionales
  const [selectedTalla, setSelectedTalla] = useState<string | null>(null);
  const [selectedLocalidad, setSelectedLocalidad] = useState<string | null>(null);
  const [soloDisponibles, setSoloDisponibles] = useState<boolean>(false);
  // Estado para mostrar/ocultar el menú de filtros
  const [showFilters, setShowFilters] = useState(false);

  // Obtener tallas únicas de los productos
  const tallasUnicas = React.useMemo(() => {
    const tallasSet = new Set<string>();
    productos.forEach(p => {
      if (p.tallasDisponibles && Array.isArray(p.tallasDisponibles)) {
        p.tallasDisponibles.forEach(t => {
          if (typeof t === 'string') tallasSet.add(t);
          else if (t && t.talla) tallasSet.add(t.talla);
        });
      }
      if (p.tallas && Array.isArray(p.tallas)) {
        p.tallas.forEach(t => {
          if (t && t.talla) tallasSet.add(t.talla);
        });
      }
    });
    return Array.from(tallasSet);
  }, [productos]);

  // Obtener localidades únicas de los productos
  const localidadesUnicas = React.useMemo(() => {
    const locs = new Map<string, string>();
    productos.forEach(p => {
      if (typeof p.localidadId === 'string') {
        locs.set(p.localidadId, p.localidad?.nombre || p.localidadId);
      } else if (p.localidadId && typeof p.localidadId === 'object') {
        locs.set(p.localidadId._id || '', p.localidadId.nombre || '');
      }
    });
    // Elimina vacíos
    return Array.from(locs.entries()).filter(([id, nombre]) => id && nombre);
  }, [productos]);


  // Cargar productos y aplicar filtro de localidad si viene por navegación
  useEffect(() => {
    loadInitialData();
  }, []);

  // Si viene parámetro de localidad, aplicar filtro automáticamente al montar
  useEffect(() => {
    if (localidadParam && productos.length > 0) {
      // Buscar el id de la localidad en los productos
      const localidadId = (() => {
        // Buscar por nombre en los productos
        for (const p of productos) {
          if (typeof p.localidadId === 'string' && p.localidad?.nombre === localidadParam) {
            return p.localidadId;
          } else if (p.localidadId && typeof p.localidadId === 'object' && p.localidadId.nombre === localidadParam) {
            return p.localidadId._id;
          }
        }
        return null;
      })();
      if (localidadId) {
        setSelectedLocalidad(localidadId);
      }
    }
  }, [localidadParam, productos]);

  // Filtrar productos cuando cambian los filtros (excepto búsqueda por texto)
  useEffect(() => {
    // Filtrar sin considerar el texto de búsqueda
    let filtered = productos;

    // Filtrar por talla
    if (selectedTalla) {
      filtered = filtered.filter(producto => {
        if (producto.tallasDisponibles && Array.isArray(producto.tallasDisponibles)) {
          return producto.tallasDisponibles.some(t =>
            typeof t === 'string' ? t === selectedTalla : t.talla === selectedTalla
          );
        }
        if (producto.tallas && Array.isArray(producto.tallas)) {
          return producto.tallas.some(t => t.talla === selectedTalla);
        }
        return false;
      });
    }

    // Filtrar por localidad
    if (selectedLocalidad) {
      filtered = filtered.filter(producto => {
        if (typeof producto.localidadId === 'string') {
          return producto.localidadId === selectedLocalidad;
        } else if (producto.localidadId && typeof producto.localidadId === 'object') {
          return producto.localidadId._id === selectedLocalidad;
        }
        return false;
      });
    }

    // Filtrar solo disponibles
    if (soloDisponibles) {
      filtered = filtered.filter(producto => producto.disponible !== false);
    }

    // No filtrar por búsqueda de texto aquí
    setFilteredProductos(filtered);
    setSearchTriggered(false); // Reiniciar trigger al cambiar filtros
  }, [productos, selectedTalla, selectedLocalidad, soloDisponibles]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [productosResponse, categoriasResponse] = await Promise.all([
        publicAPI.getProductos(),
        publicAPI.getCategorias(),
      ]);

      setProductos(Array.isArray(productosResponse) ? productosResponse : productosResponse.data || []);
      let cats = Array.isArray(categoriasResponse) ? categoriasResponse : categoriasResponse.data || [];
      // Mapear _id a id para compatibilidad
      cats = cats.map((cat: any) => ({ ...cat, id: cat.id ?? cat._id }));
      setCategorias(cats);
    } catch (error: any) {
      console.error('❌ Error loading data:', error);
      Alert.alert('Error', 'No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInitialData();
    // Si hay parámetro de localidad, volver a aplicar el filtro
    if (localidadParam && productos.length > 0) {
      // Buscar el id de la localidad en los productos
      const localidadId = (() => {
        for (const p of productos) {
          if (typeof p.localidadId === 'string' && p.localidad?.nombre === localidadParam) {
            return p.localidadId;
          } else if (p.localidadId && typeof p.localidadId === 'object' && p.localidadId.nombre === localidadParam) {
            return p.localidadId._id;
          }
        }
        return null;
      })();
      if (localidadId) {
        setSelectedLocalidad(localidadId);
      }
    } else {
      // Si no hay parámetro, quitar filtro
      setSelectedLocalidad(null);
    }
    setRefreshing(false);
  }, [localidadParam, productos]);

  const filterProductos = () => {
    let filtered = productos;

    // Filtrar por talla
    if (selectedTalla) {
      filtered = filtered.filter(producto => {
        // Buscar en tallasDisponibles (array de string o TallaData)
        if (producto.tallasDisponibles && Array.isArray(producto.tallasDisponibles)) {
          return producto.tallasDisponibles.some(t =>
            typeof t === 'string' ? t === selectedTalla : t.talla === selectedTalla
          );
        }
        // Buscar en tallas (array de TallaData)
        if (producto.tallas && Array.isArray(producto.tallas)) {
          return producto.tallas.some(t => t.talla === selectedTalla);
        }
        return false;
      });
    }

    // Filtrar por localidad
    if (selectedLocalidad) {
      filtered = filtered.filter(producto => {
        // localidadId puede ser string o LocalidadData
        if (typeof producto.localidadId === 'string') {
          return producto.localidadId === selectedLocalidad;
        } else if (producto.localidadId && typeof producto.localidadId === 'object') {
          return producto.localidadId._id === selectedLocalidad;
        }
        return false;
      });
    }

    // Filtrar solo disponibles
    if (soloDisponibles) {
      filtered = filtered.filter(producto => producto.disponible !== false);
    }

    // Filtrar por búsqueda de texto SOLO si se ha solicitado (por botón)
    if (searchQuery.trim() && searchTriggered) {
      filtered = filtered.filter(producto =>
        producto.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        producto.descripcion?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredProductos(filtered);
  };



  const handleProductPress = (producto: ProductoData) => {
    setSelectedProduct(producto);
    setShowModal(true);
  };



  const renderProductItem = ({ item }: { item: ProductoData }) => (
    <TouchableOpacity
      style={[
        globalStyles.cardElevated,
        {
          width: (width - stylesGlobal.spacing.scale[6] * 3) / 2,
          marginBottom: stylesGlobal.spacing.scale[3],
        },
      ]}
      onPress={() => handleProductPress(item)}
    >
      <View
        style={{
          height: 150,
          backgroundColor: typeof stylesGlobal.colors.surface.tertiary === 'string'
            ? stylesGlobal.colors.surface.tertiary
            : stylesGlobal.colors.surface.tertiary[500],
          borderRadius: styleConstants.borderRadius.md,
          marginBottom: stylesGlobal.spacing.scale[2],
          overflow: 'hidden',
        }}
      >
        {item.imagenURL ? (
          <Image
            source={{ uri: item.imagenURL }}
            style={{
              width: '100%',
              height: '100%',
              resizeMode: 'cover',
            }}
          />
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons
              name="image-outline"
              size={40}
              color={stylesGlobal.colors.text.muted as string}
            />
          </View>
        )}
      </View>

      <Text
        style={[
          globalStyles.listItemTitle,
          { marginBottom: stylesGlobal.spacing.scale[1] },
        ]}
        numberOfLines={2}
      >
        {item.nombre}
      </Text>

      {item.tipoTela && (
        <Text
          style={[
            globalStyles.listItemSubtitle,
            {
              color: stylesGlobal.colors.text.secondary,
              marginBottom: stylesGlobal.spacing.scale[1],
            },
          ]}
        >
          {item.tipoTela}
        </Text>
      )}

      {item.disponible !== false && (
        <View
          style={{
            backgroundColor: typeof stylesGlobal.colors.semantic.success.light === 'string'
              ? stylesGlobal.colors.semantic.success.light
              : stylesGlobal.colors.semantic.success.light[500],
            paddingHorizontal: stylesGlobal.spacing.scale[1],
            paddingVertical: 2,
            borderRadius: styleConstants.borderRadius.sm,
            alignSelf: 'flex-start',
          }}
        >
          <Text
            style={[
              globalStyles.listItemSubtitle,
              { color: stylesGlobal.colors.semantic.success.dark },
            ]}
          >
            Disponible
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderProductModal = () => (
    <Modal
      visible={showModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowModal(false)}
    >
      <SafeAreaView style={globalStyles.screenBase}>
        <ScrollView style={{ flex: 1 }}>
          <View style={{ padding: stylesGlobal.spacing.scale[4] }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: stylesGlobal.spacing.scale[6],
              }}
            >
              <Text style={globalStyles.modalTitle}>
                Detalles del Producto
              </Text>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={globalStyles.modalCloseButton}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={typeof stylesGlobal.colors.text.primary === 'string' ? stylesGlobal.colors.text.primary : stylesGlobal.colors.text.primary[500]}
                />
              </TouchableOpacity>
            </View>

            {selectedProduct && (
              <>
                <View
                  style={{
                    height: 250,
                    backgroundColor: typeof stylesGlobal.colors.surface.tertiary === 'string'
                      ? stylesGlobal.colors.surface.tertiary
                      : stylesGlobal.colors.surface.tertiary[500],
                    borderRadius: styleConstants.borderRadius.lg,
                    marginBottom: stylesGlobal.spacing.scale[6],
                    overflow: 'hidden',
                  }}
                >
                  {selectedProduct.imagenURL ? (
                    <Image
                      source={{ uri: selectedProduct.imagenURL }}
                      style={{
                        width: '100%',
                        height: '100%',
                        resizeMode: 'cover',
                      }}
                    />
                  ) : (
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Ionicons
                        name="image-outline"
                        size={60}
                        color={typeof stylesGlobal.colors.text.muted === 'string' ? stylesGlobal.colors.text.muted : '#b8aca4'}
                      />
                    </View>
                  )}
                </View>

                <Text
                  style={[
                    globalStyles.listItemTitle,
                    { marginBottom: stylesGlobal.spacing.scale[2] },
                  ]}
                >
                  {selectedProduct.nombre}
                </Text>

                {/* Tipo de tela */}
                {selectedProduct.tipoTela && (
                  <Text
                    style={[
                      globalStyles.listItemSubtitle,
                      {
                        color: stylesGlobal.colors.text.secondary,
                        marginBottom: stylesGlobal.spacing.scale[2],
                      },
                    ]}
                  >
                    Tipo de tela: {selectedProduct.tipoTela}
                  </Text>
                )}

                {/* Tallas disponibles */}
                {(selectedProduct.tallasDisponibles?.length || selectedProduct.tallas?.length) && (
                  <View style={{ marginBottom: stylesGlobal.spacing.scale[2] }}>
                    <Text style={[globalStyles.listItemTitle, { marginBottom: stylesGlobal.spacing.scale[1] }]}>Tallas disponibles:</Text>
                    <Text style={[globalStyles.listItemSubtitle, { color: stylesGlobal.colors.text.secondary }]}> {
                      selectedProduct.tallasDisponibles && selectedProduct.tallasDisponibles.length > 0
                        ? selectedProduct.tallasDisponibles.map(t => typeof t === 'string' ? t : t.talla).join(', ')
                        : selectedProduct.tallas && selectedProduct.tallas.length > 0
                          ? selectedProduct.tallas.map(t => t.talla).join(', ')
                          : 'N/A'
                    }
                    </Text>
                  </View>
                )}

                {/* Localidad */}
                {selectedProduct.localidadId && (
                  <View style={{ marginBottom: stylesGlobal.spacing.scale[2] }}>
                    <Text style={[globalStyles.listItemTitle, { marginBottom: stylesGlobal.spacing.scale[1] }]}>Localidad:</Text>
                    <Text style={[globalStyles.listItemSubtitle, { color: stylesGlobal.colors.text.secondary }]}> {
                      typeof selectedProduct.localidadId === 'string'
                        ? (selectedProduct.localidad?.nombre || selectedProduct.localidadId)
                        : selectedProduct.localidadId.nombre
                    }
                    </Text>
                  </View>
                )}

                {/* Categoría */}
                <View style={{ marginBottom: stylesGlobal.spacing.scale[2] }}>
                  <Text style={[globalStyles.listItemTitle, { marginBottom: stylesGlobal.spacing.scale[1] }]}>Categoría:</Text>
                  <Text style={[globalStyles.listItemSubtitle, { color: stylesGlobal.colors.text.secondary }]}> {
                    (() => {
                      // 1. Buscar por categoriaId principal
                      if (selectedProduct.categoriaId) {
                        const cat = categorias.find(c => String(c.id) === String(selectedProduct.categoriaId));
                        if (cat) return cat.nombre;
                      }
                      // 2. Buscar por la primera talla disponible
                      if (selectedProduct.tallasDisponibles && selectedProduct.tallasDisponibles.length > 0) {
                        const t = selectedProduct.tallasDisponibles[0] as any;
                        if (t && t.categoriaId && typeof t.categoriaId === 'object' && 'nombre' in t.categoriaId) {
                          return t.categoriaId.nombre || 'N/A';
                        }
                      }
                      return 'N/A';
                    })()
                  }
                  </Text>
                </View>

                {/* Descripción */}
                {selectedProduct.descripcion && (
                  <View style={{ marginBottom: stylesGlobal.spacing.scale[6] }}>
                    <Text style={[globalStyles.listItemTitle, { marginBottom: stylesGlobal.spacing.scale[1] }]}>Descripción:</Text>
                    <Text style={[globalStyles.listItemSubtitle, { color: stylesGlobal.colors.text.secondary }]}>{selectedProduct.descripcion}</Text>
                  </View>
                )}

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: stylesGlobal.spacing.scale[8],
                  }}
                >
                  <Text
                    style={[
                      globalStyles.listItemTitle,
                      { marginRight: stylesGlobal.spacing.scale[2] },
                    ]}
                  >
                    Estado:
                  </Text>
                  <View
                    style={{
                      backgroundColor: selectedProduct.disponible !== false
                        ? (typeof stylesGlobal.colors.semantic.success.light === 'string'
                            ? stylesGlobal.colors.semantic.success.light
                            : stylesGlobal.colors.semantic.success.light[500])
                        : (typeof stylesGlobal.colors.semantic.error.light === 'string'
                            ? stylesGlobal.colors.semantic.error.light
                            : stylesGlobal.colors.semantic.error.light[500]),
                      paddingHorizontal: stylesGlobal.spacing.scale[2],
                      paddingVertical: stylesGlobal.spacing.scale[1],
                      borderRadius: styleConstants.borderRadius.sm,
                    }}
                  >
                    <Text
                      style={[
                        globalStyles.listItemSubtitle,
                        {
                          color: selectedProduct.disponible !== false
                            ? stylesGlobal.colors.semantic.success.dark
                            : stylesGlobal.colors.semantic.error.dark,
                        },
                      ]}
                    >
                      {selectedProduct.disponible !== false ? 'Disponible' : 'No disponible'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    globalStyles.buttonPrimary,
                    { marginTop: stylesGlobal.spacing.scale[6] },
                  ]}
                  onPress={() => {
                    const numero = '527712170532'; // Número de WhatsApp con código de país (México)
                    const mensaje = `Hola, me interesa el producto "${selectedProduct?.nombre}". ¿Podrían darme más información?`;
                    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
                    Linking.openURL(url).catch(() => {
                      Alert.alert('Error', 'No se pudo abrir WhatsApp. Asegúrate de que esté instalado en tu dispositivo.');
                    });
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '600' }}>
                    Contactar para más información
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={globalStyles.screenCentered}>
        <ActivityIndicator
          size="large"
          color={stylesGlobal.colors.primary[500]}
        />
        <Text
          style={[
            globalStyles.listItemSubtitle,
            {
              marginTop: stylesGlobal.spacing.scale[3],
              color: stylesGlobal.colors.text.muted,
            },
          ]}
        >
          Cargando productos...
        </Text>
      </SafeAreaView>
    );
  }

return (
  <SafeAreaView style={globalStyles.screenBase}>
    <>
      <View style={{ padding: stylesGlobal.spacing.scale[4], marginTop: stylesGlobal.spacing.scale[1] }}>
        <Text
          style={[
            globalStyles.headerTitle,
            { marginBottom: stylesGlobal.spacing.scale[6] },
          ]}
        >
          Productos
        </Text>
        {/* Menú desplegable de filtros */}
        <View style={{ marginBottom: stylesGlobal.spacing.scale[3] }}>
          {/* Buscador */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: stylesGlobal.colors.surface.secondary,
              borderRadius: styleConstants.borderRadius.md,
              paddingHorizontal: stylesGlobal.spacing.scale[3],
              paddingVertical: stylesGlobal.spacing.scale[4],
              marginBottom: stylesGlobal.spacing.scale[2],
              minHeight: 48,
            }}
          >
            <TextInput
              style={[
                globalStyles.inputBase,
                {
                  flex: 1,
                  marginLeft: 0,
                  paddingVertical: stylesGlobal.spacing.scale[2],
                  color: stylesGlobal.colors.text.primary,
                  fontSize: 17,
                  fontWeight: '500',
                  letterSpacing: 0.2,
                  minHeight: 36,
                  backgroundColor: 'transparent',
                },
              ]}
              placeholder="Buscar productos..."
              placeholderTextColor={stylesGlobal.colors.text.muted}
              value={searchQuery}
              onChangeText={text => {
                setSearchQuery(text);
                setSearchTriggered(false);
              }}
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
              returnKeyType="done"
              onSubmitEditing={() => {}}
            />
            <TouchableOpacity
              onPress={() => {
                setSearchTriggered(true);
                filterProductos();
              }}
              style={{
                marginLeft: stylesGlobal.spacing.scale[2],
                backgroundColor: stylesGlobal.colors.primary[500],
                borderRadius: styleConstants.borderRadius.sm,
                padding: 8,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              accessibilityLabel="Buscar"
            >
              <Ionicons
                name="search"
                size={20}
                color="#fff"
              />
            </TouchableOpacity>
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={{ marginLeft: stylesGlobal.spacing.scale[1] }}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={typeof stylesGlobal.colors.text.muted === 'string' ? stylesGlobal.colors.text.muted : '#b8aca4'}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Menú desplegable de filtros */}
          <View style={{ marginBottom: stylesGlobal.spacing.scale[2] }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: stylesGlobal.colors.surface.tertiary,
                borderRadius: styleConstants.borderRadius.md,
                paddingHorizontal: stylesGlobal.spacing.scale[3],
                paddingVertical: stylesGlobal.spacing.scale[2],
              }}
              onPress={() => setShowFilters((prev: boolean) => !prev)}
            >
              <Ionicons name={showFilters ? 'chevron-up' : 'chevron-down'} size={20} color={typeof stylesGlobal.colors.text.primary === 'string' ? stylesGlobal.colors.text.primary : stylesGlobal.colors.text.primary[500]} />
              <Text style={{ 
              fontSize: stylesGlobal.typography.scale.lg,
              fontWeight: '600',
              color: stylesGlobal.colors.text.primary,
              marginLeft: stylesGlobal.spacing.scale[2]
            }}>Filtros</Text>
            </TouchableOpacity>
            {showFilters && (
              <View style={{ marginTop: stylesGlobal.spacing.scale[6], padding: 24 }}>
                {/* Filtro de talla */}
                <Text style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: typeof stylesGlobal.colors.text.primary === 'string'
                    ? stylesGlobal.colors.text.primary
                    : (stylesGlobal.colors.text.primary[500] as string) || '#000',
                  marginBottom: 24,
                  marginTop: 18,
                }}>
                  Filtrar por Talla
                </Text>
                <Picker
                  selectedValue={selectedTalla ?? undefined}
                  onValueChange={(value: string) => setSelectedTalla(value === '' ? null : value)}
                  style={{ height: 52, marginBottom: 36 }}
                >
                  <Picker.Item label="Todas las tallas" value="" />
                  {tallasUnicas.map(talla => (
                    <Picker.Item key={talla} label={talla} value={talla} />
                  ))}
                </Picker>

                {/* Filtro de localidad */}
                <Text style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: typeof stylesGlobal.colors.text.primary === 'string'
                    ? stylesGlobal.colors.text.primary
                    : (stylesGlobal.colors.text.primary[500] as string) || '#000',
                  marginBottom: 24,
                  marginTop: 28,
                }}>
                  Filtrar por Localidad
                </Text>
                <Picker
                  selectedValue={selectedLocalidad ?? undefined}
                  onValueChange={(value: string) => setSelectedLocalidad(value === '' ? null : value)}
                  style={{ height: 52, marginBottom: 36 }}
                >
                  <Picker.Item label="Todas las localidades" value="" />
                  {localidadesUnicas.map(([id, nombre]) => (
                    <Picker.Item key={id} label={nombre} value={id} />
                  ))}
                </Picker>

                {/* Filtro de disponibilidad eliminado por solicitud */}
              </View>
            )}
          </View>
        </View>
        {/* Botón para quitar filtro de localidad si está activo por navegación */}
        {localidadParam && selectedLocalidad && (
          <TouchableOpacity
            style={{
              backgroundColor: typeof stylesGlobal.colors.secondary === 'string' ? stylesGlobal.colors.secondary : (stylesGlobal.colors.secondary[500] as string),
              padding: 10,
              borderRadius: 8,
              marginBottom: 12,
              alignSelf: 'flex-start',
            }}
            onPress={() => setSelectedLocalidad(null)}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Quitar filtro de localidad</Text>
          </TouchableOpacity>
        )}

        <FlatList
          data={filteredProductos}
          renderItem={renderProductItem}
          keyExtractor={(item, index) => item._id ?? item.id ?? `product-${index}`}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[stylesGlobal.colors.primary[500]]}
            />
          }
          ListEmptyComponent={
            <View style={globalStyles.screenCentered}>
              <Ionicons
                name="bag-outline"
                size={60}
                color={typeof stylesGlobal.colors.text.muted === 'string' ? stylesGlobal.colors.text.muted : '#b8aca4'}
              />
              <Text
                style={[
                  globalStyles.listItemTitle,
                  {
                    marginTop: stylesGlobal.spacing.scale[3],
                    color: stylesGlobal.colors.text.muted,
                    textAlign: 'center',
                  },
                ]}
              >
                {searchQuery ? 'No se encontraron productos' : 'No hay productos disponibles'}
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: stylesGlobal.spacing.scale[24] }}
        />
      </View>

      {renderProductModal()}
    </>
  </SafeAreaView>
);
};

export default ProductosScreen;