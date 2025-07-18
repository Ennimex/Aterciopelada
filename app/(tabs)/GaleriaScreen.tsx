import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Video as ExpoVideo, ResizeMode } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { publicAPI } from '../../services/api';

// Tipo para foto según modelo backend
type Photo = {
  _id?: string;
  url: string;
  titulo: string;
  descripcion?: string;
  fechaSubida?: string;
};

// Interfaz para videos/reels según modelo backend
type Video = {
  _id?: string;
  url: string;
  titulo: string;
  descripcion?: string;
  publicId?: string;
  duracion?: number;
  formato?: string;
  miniatura?: string;
  miniaturaPublicId?: string;
  fechaSubida?: string;
};

// Estado para fotos de la API
type Evento = {
  _id?: string;
  titulo: string;
  descripcion?: string;
  fecha?: string; // Fecha del evento (ISO)
  ubicacion?: string;
  horaInicio?: string; // "HH:mm"
  horaFin?: string;   // "HH:mm"
  fechaEliminacion?: string; // Fecha de eliminación automática (ISO)
};

const GaleriaScreen: React.FC = () => {
  const [photosData, setPhotosData] = useState<Photo[]>([]);
  const [videosData, setVideosData] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorVideos, setErrorVideos] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  // Estado para eventos y modal de eventos
  const [eventosModalVisible, setEventosModalVisible] = useState(false);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loadingEventos, setLoadingEventos] = useState(false);
  const [errorEventos, setErrorEventos] = useState<string | null>(null);
  // Función para cargar eventos al abrir el modal
  const handleOpenEventosModal = async () => {
    setEventosModalVisible(true);
    setLoadingEventos(true);
    setErrorEventos(null);
    try {
      const response = await publicAPI.getEventos();
      if (Array.isArray(response)) {
        setEventos(response);
      } else {
        setEventos([]);
      }
    } catch (err: any) {
      setErrorEventos(err?.error || 'Error al cargar eventos');
    } finally {
      setLoadingEventos(false);
    }
  };
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  useEffect(() => {
    // Cargar eventos solo una vez
    const fetchEventos = async () => {
      try {
        if (publicAPI.getEventos) {
          const response = await publicAPI.getEventos();
          if (Array.isArray(response)) {
            setEvents(response);
          } else {
            setEvents([]);
          }
        }
      } catch (err: any) {
        // No mostrar error, solo dejar vacío
        setEvents([]);
      }
    };
    fetchEventos();
  }, []);

  useEffect(() => {
    const fetchFotos = async () => {
      try {
        const response = await publicAPI.getFotos();
        // La API retorna un array directamente
        if (Array.isArray(response)) {
          setPhotosData(response);
        } else {
          setPhotosData([]);
        }
      } catch (err: any) {
        setError(err?.error || 'Error al cargar fotos');
      } finally {
        setLoading(false);
      }
    };
    fetchFotos();
    const fetchVideos = async () => {
      try {
        const response = await publicAPI.getVideos();
        if (Array.isArray(response)) {
          setVideosData(response);
        } else {
          setVideosData([]);
        }
      } catch (err: any) {
        setErrorVideos(err?.error || 'Error al cargar videos');
      } finally {
        setLoadingVideos(false);
      }
    };
    fetchVideos();
  }, []);

  // Obtener dimensiones de pantalla y calcular columnas
  const { width } = Dimensions.get('window');
  const numColumns = 2; // Siempre dos columnas en la sección de fotos
  const cardMargin = 12;
  const cardWidth = (width - (numColumns + 1) * cardMargin) / numColumns;

  // Dividir fotos en columnas
  const columns: Photo[][] = Array.from({ length: numColumns }, () => []);
  photosData.forEach((photo, index) => {
    columns[index % numColumns].push(photo);
  });

  // Estilos inyectados directamente
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fefcf3', // Fondo cálido
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: '#2a241f',
      marginVertical: 12,
      marginHorizontal: cardMargin,
    },
    reelScroll: {
      paddingHorizontal: cardMargin,
      paddingBottom: 12,
      backgroundColor: '#fdf2f4', // Fondo para sección de reels
    },
    reelCard: {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      padding: 12,
      marginRight: 12,
      width: 180, // Ancho fijo para tarjetas
      height: 240, // Altura optimizada para reels
      shadowColor: '#2a241f',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    reelIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: '#fce7eb',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    reelIcon: {
      fontSize: 48,
      color: '#d63384',
    },
    reelTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: '#2a241f',
      textAlign: 'center',
      marginBottom: 8,
    },
    reelDescription: {
      fontSize: 12,
      color: '#8b7d74',
      textAlign: 'center',
      lineHeight: 18,
    },
    photoContainer: {
      backgroundColor: '#f7f6f4', // Fondo para sección de fotos
      paddingTop: 12,
      paddingBottom: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginHorizontal: cardMargin,
    },
    column: {
      flex: 1,
      marginRight: cardMargin,
    },
    lastColumn: {
      flex: 1,
      marginRight: 0,
    },
    photoCard: {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      padding: 12,
      marginBottom: cardMargin,
      shadowColor: '#2a241f',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 2,
      elevation: 2,
      alignItems: 'center',
    },
    photoIconContainer: {
      width: cardWidth - 24, // Ajustar al ancho de la tarjeta
      height: (cardWidth - 24) * 1.2, // Proporción ajustada para imágenes
      borderRadius: 12,
      backgroundColor: '#fef7e0',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    photoIcon: {
      fontSize: 40,
      color: '#e6a756',
    },
    photoTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: '#2a241f',
      textAlign: 'center',
      marginBottom: 4,
    },
    photoDescription: {
      fontSize: 12,
      color: '#8b7d74',
      textAlign: 'center',
      lineHeight: 18,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Botón flotante estilo TikTok para eventos (solo uno, tamaño reducido) */}
      <View style={{ position: 'absolute', top: 44, right: 16, zIndex: 20 }}>
        <Pressable
          onPress={handleOpenEventosModal}
          style={{
            backgroundColor: '#fff',
            borderRadius: 24,
            padding: 6,
            shadowColor: '#2a241f',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.18,
            shadowRadius: 3,
            elevation: 3,
            borderWidth: 2,
            borderColor: '#d63384',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons name="calendar-month" size={22} color="#d63384" />
        </Pressable>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
      {/* Modal de eventos */}
      <Modal
        visible={eventosModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEventosModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center', width: '100%', maxWidth: 400, maxHeight: '80%' }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#d63384', marginBottom: 10, textAlign: 'center' }}>Eventos</Text>
            {loadingEventos ? (
              <ActivityIndicator size="large" color="#d63384" style={{ marginTop: 32 }} />
            ) : errorEventos ? (
              <Text style={{ color: 'red', textAlign: 'center', marginTop: 32 }}>{errorEventos}</Text>
            ) : eventos.length === 0 ? (
              <Text style={{ color: '#8b7d74', textAlign: 'center', marginTop: 32 }}>No hay eventos disponibles.</Text>
            ) : (
              <ScrollView style={{ width: '100%', maxHeight: 260 }}>
                {eventos.map((evento) => (
                  <View key={evento._id} style={{ backgroundColor: '#fdf2f4', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#d63384', shadowColor: '#2a241f', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.12, shadowRadius: 2, elevation: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#d63384', marginBottom: 4 }}>{evento.titulo}</Text>
                    <Text style={{ fontSize: 14, color: '#2a241f', marginBottom: 6 }}>{evento.descripcion}</Text>
                    {evento.fecha && (
                      <Text style={{ fontSize: 13, color: '#8b7d74' }}>Fecha: {new Date(evento.fecha).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
                    )}
                    {evento.ubicacion && (
                      <Text style={{ fontSize: 13, color: '#8b7d74' }}>Ubicación: {evento.ubicacion}</Text>
                    )}
                    {(evento.horaInicio || evento.horaFin) && (
                      <Text style={{ fontSize: 13, color: '#8b7d74' }}>Horario: {evento.horaInicio || ''}{evento.horaInicio && evento.horaFin ? ' - ' : ''}{evento.horaFin || ''}</Text>
                    )}
                    {evento.fechaEliminacion && (
                      <Text style={{ fontSize: 12, color: '#d63384', marginTop: 2 }}>Se eliminará el: {new Date(evento.fechaEliminacion).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}</Text>
                    )}
                  </View>
                ))}
              </ScrollView>
            )}
            <Pressable
              onPress={() => setEventosModalVisible(false)}
              style={{ backgroundColor: '#d63384', borderRadius: 8, paddingHorizontal: 32, paddingVertical: 10, marginTop: 8 }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 17 }}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
        {/* Sección de Reels Destacados (ahora funcional con videos de la API) */}
        <Text style={styles.sectionTitle}>Reels Destacados</Text>
        {loadingVideos ? (
          <ActivityIndicator size="large" color="#d63384" style={{ marginTop: 32 }} />
        ) : errorVideos ? (
          <Text style={{ color: 'red', textAlign: 'center', marginTop: 32 }}>{errorVideos}</Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.reelScroll}
            snapToInterval={192}
            decelerationRate="fast"
          >
            {videosData.map((video) => (
              <TouchableOpacity
                key={video._id}
                style={[styles.reelCard, { borderWidth: 1, borderColor: '#e6a756' }]}
                onPress={() => {
                  setSelectedVideo(video);
                  setVideoModalVisible(true);
                }}
                activeOpacity={0.85}
              >
                <View style={[styles.reelIconContainer, { backgroundColor: video.miniatura ? '#fce7eb' : '#fef7e0', borderWidth: video.miniatura ? 0 : 1, borderColor: '#e6a756', padding: 0, width: 130, height: 130, borderRadius: 20, justifyContent: 'center', alignItems: 'center', position: 'relative' }]}> 
                  {video.miniatura ? (
                    <>
                      <Image source={{ uri: video.miniatura }} style={{ width: 130, height: 130, borderRadius: 20, backgroundColor: 'transparent' }} />
                      <View style={{ position: 'absolute', top: 0, left: 0, width: 130, height: 130, justifyContent: 'center', alignItems: 'center' }}>
                        <Ionicons name="play-circle" size={54} color="#e6a756" style={{ opacity: 0.85 }} />
                      </View>
                    </>
                  ) : (
                    <Ionicons name="play-circle" size={90} color="#e6a756" />
                  )}
                </View>
                <Text style={styles.reelTitle}>{video.titulo}</Text>
                <Text style={styles.reelDescription}>{video.descripcion || 'Sin descripción'}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Sección de Fotos (Masonry Layout) */}
        <Text style={styles.sectionTitle}>Galería de Fotos</Text>
        <View style={styles.photoContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#e6a756" style={{ marginTop: 32 }} />
          ) : error ? (
            <Text style={{ color: 'red', textAlign: 'center', marginTop: 32 }}>{error}</Text>
          ) : (
            columns.map((column, index) => (
              <View
                key={`column-${index}`}
                style={index === numColumns - 1 ? styles.lastColumn : styles.column}
              >
                {column.map((photo) => (
                <TouchableOpacity
                  key={photo._id}
                  style={[styles.photoCard, { width: cardWidth }]}
                  onPress={() => {
                    setSelectedPhoto(photo);
                    setModalVisible(true);
                  }}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.photoIconContainer,
                      { height: cardWidth * 0.6, width: cardWidth - 24 },
                    ]}
                  >
                    {/* Imagen real */}
                    <Image source={{ uri: photo.url }} style={{ width: '100%', height: '100%', borderRadius: 12 }} resizeMode="cover" />
                  </View>
                  <Text style={styles.photoTitle}>{photo.titulo}</Text>
                  <Text style={styles.photoDescription}>{photo.descripcion}</Text>
                </TouchableOpacity>
                ))}
              </View>
            ))
          )}
        </View>
      </ScrollView>
      {/* Modal para ver imagen en grande */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', maxWidth: '90%' }}>
            {selectedPhoto?.url && (
              <Image
                source={{ uri: selectedPhoto.url }}
                style={{ width: 300, height: 300, borderRadius: 12, marginBottom: 16 }}
                resizeMode="cover"
              />
            )}
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2a241f', marginBottom: 8, textAlign: 'center' }}>{selectedPhoto?.titulo}</Text>
            <Text style={{ fontSize: 14, color: '#8b7d74', textAlign: 'center', marginBottom: 16 }}>{selectedPhoto?.descripcion}</Text>
            <Pressable
              onPress={() => setModalVisible(false)}
              style={{ backgroundColor: '#e6a756', borderRadius: 8, paddingHorizontal: 24, paddingVertical: 8 }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      {/* Modal para reproducir video */}
      {/* Modal para mostrar eventos */}
      <Modal
        visible={eventModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEventModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center', width: '100%', maxWidth: 400, maxHeight: '80%' }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#d63384', marginBottom: 16, textAlign: 'center' }}>Eventos</Text>
            <ScrollView style={{ width: '100%' }}>
              {events.length === 0 ? (
                <Text style={{ color: '#8b7d74', textAlign: 'center', fontSize: 16 }}>No hay eventos disponibles.</Text>
              ) : (
                events.map((event, idx) => (
                  <View key={event._id || idx} style={{ marginBottom: 18, padding: 12, backgroundColor: '#fdf2f4', borderRadius: 12, shadowColor: '#2a241f', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.12, shadowRadius: 2, elevation: 1 }}>
                    <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#d63384', marginBottom: 4 }}>{event.titulo || 'Sin título'}</Text>
                    <Text style={{ fontSize: 14, color: '#2a241f', marginBottom: 4 }}>{event.descripcion || 'Sin descripción'}</Text>
                    {event.fecha && (
                      <Text style={{ fontSize: 13, color: '#8b7d74' }}>Fecha: {event.fecha}</Text>
                    )}
                  </View>
                ))
              )}
            </ScrollView>
            <Pressable
              onPress={() => setEventModalVisible(false)}
              style={{ backgroundColor: '#d63384', borderRadius: 8, paddingHorizontal: 32, paddingVertical: 10, marginTop: 12 }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 17 }}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Modal
        visible={videoModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setVideoModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center', width: '100%', maxWidth: 400 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#2a241f', marginBottom: 10, textAlign: 'center' }}>{selectedVideo?.titulo}</Text>
            <Text style={{ fontSize: 15, color: '#8b7d74', textAlign: 'center', marginBottom: 18 }}>{selectedVideo?.descripcion}</Text>
            {selectedVideo?.url && (
              <ExpoVideo
                source={{ uri: selectedVideo.url }}
                rate={1.0}
                volume={1.0}
                isMuted={false}
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay
                useNativeControls
                style={{ width: '100%', maxWidth: 360, height: 220, borderRadius: 14, marginBottom: 18, backgroundColor: '#000' }}
              />
            )}
            <Pressable
              onPress={() => setVideoModalVisible(false)}
              style={{ backgroundColor: '#d63384', borderRadius: 8, paddingHorizontal: 32, paddingVertical: 10, marginTop: 4 }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 17 }}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};


export default GaleriaScreen;