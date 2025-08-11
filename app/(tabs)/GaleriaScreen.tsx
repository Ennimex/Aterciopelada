import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Video as ExpoVideo, ResizeMode } from 'expo-av';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, Modal, RefreshControl, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { publicAPI } from '../../services/api';
import { globalStyles, mobileHelpers, stylesGlobal } from '../../styles/stylesGlobal';

// Types
interface Photo {
  _id?: string;
  url: string;
  titulo: string;
  descripcion?: string;
  fechaSubida?: string;
}

interface Video {
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
}

interface Evento {
  _id?: string;
  titulo: string;
  descripcion?: string;
  fecha?: string;
  ubicacion?: string;
  horaInicio?: string;
  horaFin?: string;
  fechaEliminacion?: string;
}

// Custom Hook for Gallery Data
const useGalleryData = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [loadingEventos, setLoadingEventos] = useState(false);
  
  const [errorPhotos, setErrorPhotos] = useState<string | null>(null);
  const [errorVideos, setErrorVideos] = useState<string | null>(null);
  const [errorEventos, setErrorEventos] = useState<string | null>(null);

  const loadPhotos = useCallback(async () => {
    try {
      setLoadingPhotos(true);
      setErrorPhotos(null);
      const response = await publicAPI.getFotos();
      setPhotos(Array.isArray(response) ? response : []);
    } catch (err: any) {
      setErrorPhotos(err?.error || 'Error al cargar fotos');
      setPhotos([]);
    } finally {
      setLoadingPhotos(false);
    }
  }, []);

  const loadVideos = useCallback(async () => {
    try {
      setLoadingVideos(true);
      setErrorVideos(null);
      const response = await publicAPI.getVideos();
      setVideos(Array.isArray(response) ? response : []);
    } catch (err: any) {
      setErrorVideos(err?.error || 'Error al cargar videos');
      setVideos([]);
    } finally {
      setLoadingVideos(false);
    }
  }, []);

  const loadEventos = useCallback(async () => {
    try {
      setLoadingEventos(true);
      setErrorEventos(null);
      const response = await publicAPI.getEventos();
      setEventos(Array.isArray(response) ? response : []);
    } catch (err: any) {
      setErrorEventos(err?.error || 'Error al cargar eventos');
      setEventos([]);
    } finally {
      setLoadingEventos(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadPhotos(), loadVideos(), loadEventos()]);
  }, [loadPhotos, loadVideos, loadEventos]);

  useEffect(() => {
    loadPhotos();
    loadVideos();
    loadEventos();
  }, [loadPhotos, loadVideos, loadEventos]);

  return {
    photos,
    videos,
    eventos,
    loadingPhotos,
    loadingVideos,
    loadingEventos,
    errorPhotos,
    errorVideos,
    errorEventos,
    refreshAll,
    loadEventos,
  };
};

// Components
const LoadingComponent: React.FC<{ message?: string }> = ({ message = "Cargando..." }) => (
  <View style={globalStyles.screenCentered}>
    <ActivityIndicator size="large" color={stylesGlobal.colors.primary[500]} />
    <Text style={[globalStyles.textSecondary, { marginTop: stylesGlobal.spacing.scale[2] }]}>
      {message}
    </Text>
  </View>
);

const ErrorComponent: React.FC<{ 
  message: string;
  onRetry: () => void;
}> = ({ message, onRetry }) => (
  <View style={globalStyles.screenCentered}>
    <Text style={[globalStyles.textSecondary, { textAlign: 'center', marginBottom: stylesGlobal.spacing.scale[4] }]}>
      {message}
    </Text>
    <TouchableOpacity
      style={[globalStyles.buttonBase, globalStyles.buttonPrimary]}
      onPress={onRetry}
      activeOpacity={0.8}
    >
      <Text style={{ color: stylesGlobal.colors.primary.contrast }}>
        Reintentar
      </Text>
    </TouchableOpacity>
  </View>
);

const Header: React.FC<{ onEventsPress: () => void }> = ({ onEventsPress }) => {
  const headerStyles = useMemo(() => ({
    container: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      paddingHorizontal: stylesGlobal.spacing.scale[4],
      paddingVertical: stylesGlobal.spacing.scale[3],
      backgroundColor: stylesGlobal.colors.surface.primary,
      borderBottomWidth: 1,
      borderBottomColor: stylesGlobal.colors.surface.secondary,
    },
    title: {
      fontSize: stylesGlobal.typography.scale.xl,
      fontWeight: stylesGlobal.typography.weights.bold as any,
      color: stylesGlobal.colors.text.primary,
    },
    eventButton: {
      backgroundColor: stylesGlobal.colors.primary[50],
      padding: stylesGlobal.spacing.scale[2],
      borderRadius: 12,
      borderWidth: 1,
      borderColor: stylesGlobal.colors.primary[200],
    },
  }), []);

  return (
    <View style={headerStyles.container}>
      <Text style={headerStyles.title}>Galería</Text>
      <TouchableOpacity
        style={headerStyles.eventButton}
        onPress={onEventsPress}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons 
          name="calendar-month" 
          size={24} 
          color={stylesGlobal.colors.primary[500]} 
        />
      </TouchableOpacity>
    </View>
  );
};

const VideoCard: React.FC<{
  video: Video;
  onPress: () => void;
}> = React.memo(({ video, onPress }) => {
  const { width } = Dimensions.get('window');
  const cardWidth = width * 0.45;
  
  const cardStyles = useMemo(() => ({
    container: {
      backgroundColor: stylesGlobal.colors.surface.primary,
      borderRadius: 12,
      padding: stylesGlobal.spacing.scale[3],
      marginRight: stylesGlobal.spacing.scale[3],
      width: cardWidth,
      ...stylesGlobal.shadows.base,
    },
    thumbnailContainer: {
      width: cardWidth - (stylesGlobal.spacing.scale[3] * 2),
      height: (cardWidth - (stylesGlobal.spacing.scale[3] * 2)) * 1.2,
      borderRadius: 8,
      backgroundColor: stylesGlobal.colors.primary[50],
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginBottom: stylesGlobal.spacing.scale[2],
      overflow: 'hidden' as const,
      position: 'relative' as const,
    },
    playOverlay: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    title: {
      fontSize: stylesGlobal.typography.scale.sm,
      fontWeight: stylesGlobal.typography.weights.semibold as any,
      color: stylesGlobal.colors.text.primary,
      marginBottom: stylesGlobal.spacing.scale[1],
    },
    description: {
      fontSize: stylesGlobal.typography.scale.xs,
      color: stylesGlobal.colors.text.secondary,
      lineHeight: stylesGlobal.typography.scale.xs * stylesGlobal.typography.lineHeights.relaxed,
    },
  }), [cardWidth]);

  return (
    <TouchableOpacity
      style={cardStyles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={cardStyles.thumbnailContainer}>
        {video.miniatura ? (
          <>
            <Image 
              source={{ uri: video.miniatura }} 
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
            <View style={cardStyles.playOverlay}>
              <Ionicons name="play-circle" size={48} color="white" />
            </View>
          </>
        ) : (
          <Ionicons 
            name="play-circle" 
            size={60} 
            color={stylesGlobal.colors.primary[400]} 
          />
        )}
      </View>
      <Text style={cardStyles.title} numberOfLines={2}>
        {video.titulo}
      </Text>
      <Text style={cardStyles.description} numberOfLines={3}>
        {video.descripcion || 'Sin descripción'}
      </Text>
    </TouchableOpacity>
  );
});

const PhotoCard: React.FC<{
  photo: Photo;
  onPress: () => void;
  cardWidth: number;
}> = React.memo(({ photo, onPress, cardWidth }) => {
  const cardStyles = useMemo(() => ({
    container: {
      backgroundColor: stylesGlobal.colors.surface.primary,
      borderRadius: 8,
      padding: stylesGlobal.spacing.scale[2],
      marginBottom: stylesGlobal.spacing.scale[3],
      width: cardWidth,
      ...stylesGlobal.shadows.sm,
    },
    imageContainer: {
      width: cardWidth - (stylesGlobal.spacing.scale[2] * 2),
      height: (cardWidth - (stylesGlobal.spacing.scale[2] * 2)) * 0.75,
      borderRadius: 6,
      overflow: 'hidden' as const,
      marginBottom: stylesGlobal.spacing.scale[2],
      backgroundColor: stylesGlobal.colors.surface.secondary,
    },
    title: {
      fontSize: stylesGlobal.typography.scale.xs,
      fontWeight: stylesGlobal.typography.weights.medium as any,
      color: stylesGlobal.colors.text.primary,
      marginBottom: stylesGlobal.spacing.scale[1],
    },
    description: {
      fontSize: stylesGlobal.typography.scale['2xs'],
      color: stylesGlobal.colors.text.tertiary,
      lineHeight: stylesGlobal.typography.scale['2xs'] * stylesGlobal.typography.lineHeights.normal,
    },
  }), [cardWidth]);

  return (
    <TouchableOpacity
      style={cardStyles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={cardStyles.imageContainer}>
        <Image 
          source={{ uri: photo.url }} 
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      </View>
      <Text style={cardStyles.title} numberOfLines={2}>
        {photo.titulo}
      </Text>
      <Text style={cardStyles.description} numberOfLines={2}>
        {photo.descripcion}
      </Text>
    </TouchableOpacity>
  );
});

const EventModal: React.FC<{
  visible: boolean;
  eventos: Evento[];
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onRefresh: () => void;
}> = ({ visible, eventos, loading, error, onClose, onRefresh }) => {
  const modalStyles = useMemo(() => ({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    container: {
      backgroundColor: stylesGlobal.colors.surface.primary,
      borderRadius: 16,
      padding: stylesGlobal.spacing.scale[6],
      margin: stylesGlobal.spacing.scale[4],
      maxWidth: mobileHelpers.screen.width * 0.9,
      maxHeight: mobileHelpers.screen.height * 0.8,
      width: '100%',
      ...stylesGlobal.shadows.base,
    },
    title: {
      fontSize: stylesGlobal.typography.scale['2xl'],
      fontWeight: stylesGlobal.typography.weights.bold as any,
      color: stylesGlobal.colors.text.primary,
      textAlign: 'center' as const,
      marginBottom: stylesGlobal.spacing.scale[4],
    },
    eventCard: {
      backgroundColor: stylesGlobal.colors.primary[50],
      borderRadius: 8,
      padding: stylesGlobal.spacing.scale[3],
      marginBottom: stylesGlobal.spacing.scale[3],
      borderLeftWidth: 3,
      borderLeftColor: stylesGlobal.colors.primary[500],
    },
    eventTitle: {
      fontSize: stylesGlobal.typography.scale.base,
      fontWeight: stylesGlobal.typography.weights.semibold as any,
      color: stylesGlobal.colors.text.primary,
      marginBottom: stylesGlobal.spacing.scale[1],
    },
    eventDescription: {
      fontSize: stylesGlobal.typography.scale.sm,
      color: stylesGlobal.colors.text.secondary,
      marginBottom: stylesGlobal.spacing.scale[2],
    },
    eventDetail: {
      fontSize: stylesGlobal.typography.scale.xs,
      color: stylesGlobal.colors.text.tertiary,
      marginBottom: stylesGlobal.spacing.scale[1],
    },
    closeButton: {
      backgroundColor: stylesGlobal.colors.primary[500],
      paddingVertical: stylesGlobal.spacing.scale[3],
      paddingHorizontal: stylesGlobal.spacing.scale[6],
      borderRadius: 8,
      alignItems: 'center' as const,
      marginTop: stylesGlobal.spacing.scale[4],
    },
    closeButtonText: {
      color: stylesGlobal.colors.primary.contrast,
      fontSize: stylesGlobal.typography.scale.base,
      fontWeight: stylesGlobal.typography.weights.semibold as any,
    },
  }), []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

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
          style={modalStyles.container as any}
          activeOpacity={1}
          onPress={() => {}} // Prevent modal close when tapping inside
        >
          <Text style={modalStyles.title}>Eventos</Text>
          
          {loading ? (
            <LoadingComponent message="Cargando eventos..." />
          ) : error ? (
            <ErrorComponent message={error} onRetry={onRefresh} />
          ) : eventos.length === 0 ? (
            <View style={globalStyles.screenCentered}>
              <Text style={[globalStyles.textSecondary, { textAlign: 'center' }]}>
                No hay eventos disponibles
              </Text>
            </View>
          ) : (
            <ScrollView style={{ maxHeight: mobileHelpers.screen.height * 0.5 }}>
              {eventos.map((evento) => (
                <View key={evento._id} style={modalStyles.eventCard}>
                  <Text style={modalStyles.eventTitle}>{evento.titulo}</Text>
                  {evento.descripcion && (
                    <Text style={modalStyles.eventDescription}>{evento.descripcion}</Text>
                  )}
                  {evento.fecha && (
                    <Text style={modalStyles.eventDetail}>
                      📅 {formatDate(evento.fecha)}
                    </Text>
                  )}
                  {evento.ubicacion && (
                    <Text style={modalStyles.eventDetail}>
                      📍 {evento.ubicacion}
                    </Text>
                  )}
                  {(evento.horaInicio || evento.horaFin) && (
                    <Text style={modalStyles.eventDetail}>
                      🕐 {evento.horaInicio || ''}{evento.horaInicio && evento.horaFin ? ' - ' : ''}{evento.horaFin || ''}
                    </Text>
                  )}
                </View>
              ))}
            </ScrollView>
          )}
          
          <TouchableOpacity
            style={modalStyles.closeButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={modalStyles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const MediaModal: React.FC<{
  visible: boolean;
  photo?: Photo | null;
  video?: Video | null;
  onClose: () => void;
}> = ({ visible, photo, video, onClose }) => {
  const modalStyles = useMemo(() => ({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    container: {
      backgroundColor: stylesGlobal.colors.surface.primary,
      borderRadius: 16,
      padding: stylesGlobal.spacing.scale[4],
      margin: stylesGlobal.spacing.scale[4],
      maxWidth: mobileHelpers.screen.width * 0.9,
      maxHeight: mobileHelpers.screen.height * 0.8,
      alignItems: 'center' as const,
    },
    mediaContainer: {
      width: mobileHelpers.screen.width * 0.8,
      height: mobileHelpers.screen.width * 0.8,
      borderRadius: 12,
      overflow: 'hidden' as const,
      marginBottom: stylesGlobal.spacing.scale[4],
      backgroundColor: stylesGlobal.colors.surface.secondary,
    },
    title: {
      fontSize: stylesGlobal.typography.scale.lg,
      fontWeight: stylesGlobal.typography.weights.semibold as any,
      color: stylesGlobal.colors.text.primary,
      textAlign: 'center' as const,
      marginBottom: stylesGlobal.spacing.scale[2],
    },
    description: {
      fontSize: stylesGlobal.typography.scale.sm,
      color: stylesGlobal.colors.text.secondary,
      textAlign: 'center' as const,
      marginBottom: stylesGlobal.spacing.scale[4],
    },
    closeButton: {
      backgroundColor: stylesGlobal.colors.primary[500],
      paddingVertical: stylesGlobal.spacing.scale[2],
      paddingHorizontal: stylesGlobal.spacing.scale[4],
      borderRadius: 8,
    },
    closeButtonText: {
      color: stylesGlobal.colors.primary.contrast,
      fontSize: stylesGlobal.typography.scale.base,
      fontWeight: stylesGlobal.typography.weights.semibold as any,
    },
  }), []);

  const currentMedia = photo || video;

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
          style={modalStyles.container}
          activeOpacity={1}
          onPress={() => {}} // Prevent modal close when tapping inside
        >
          <View style={modalStyles.mediaContainer}>
            {photo && (
              <Image
                source={{ uri: photo.url }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
            )}
            {video && (
              <ExpoVideo
                source={{ uri: video.url }}
                rate={1.0}
                volume={1.0}
                isMuted={false}
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay
                useNativeControls
                style={{ width: '100%', height: '100%' }}
              />
            )}
          </View>
          
          <Text style={modalStyles.title}>
            {currentMedia?.titulo}
          </Text>
          <Text style={modalStyles.description}>
            {currentMedia?.descripcion}
          </Text>
          
          <TouchableOpacity
            style={modalStyles.closeButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={modalStyles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// Main Component
const GaleriaScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const {
    photos,
    videos,
    eventos,
    loadingPhotos,
    loadingVideos,
    loadingEventos,
    errorPhotos,
    errorVideos,
    errorEventos,
    refreshAll,
    loadEventos,
  } = useGalleryData();

  const { width } = Dimensions.get('window');
  const numColumns = 2;
  const cardMargin = stylesGlobal.spacing.scale[3];
  const cardWidth = (width - (numColumns + 1) * cardMargin) / numColumns;

  // Handlers
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  }, [refreshAll]);

  const handleEventsPress = useCallback(() => {
    setEventModalVisible(true);
    if (eventos.length === 0) {
      loadEventos();
    }
  }, [eventos.length, loadEventos]);

  const handlePhotoPress = useCallback((photo: Photo) => {
    setSelectedPhoto(photo);
    setSelectedVideo(null);
    setMediaModalVisible(true);
  }, []);

  const handleVideoPress = useCallback((video: Video) => {
    setSelectedVideo(video);
    setSelectedPhoto(null);
    setMediaModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setMediaModalVisible(false);
    setSelectedPhoto(null);
    setSelectedVideo(null);
  }, []);

  const renderPhotoItem = useCallback(({ item, index }: { item: Photo; index: number }) => (
    <PhotoCard
      photo={item}
      onPress={() => handlePhotoPress(item)}
      cardWidth={cardWidth}
    />
  ), [cardWidth, handlePhotoPress]);

  const renderVideoItem = useCallback(({ item }: { item: Video }) => (
    <VideoCard
      video={item}
      onPress={() => handleVideoPress(item)}
    />
  ), [handleVideoPress]);

  return (
    <SafeAreaView style={globalStyles.screenBase}>
      <StatusBar barStyle="dark-content" backgroundColor={stylesGlobal.colors.surface.primary} />
      
      <Header onEventsPress={handleEventsPress} />
      
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
        <View style={globalStyles.screenContent}>
          {/* Videos Section */}
          <Text style={{
            fontSize: mobileHelpers.getDynamicFontSize(stylesGlobal.typography.scale['2xl']),
            fontWeight: stylesGlobal.typography.weights.semibold as any,
            color: stylesGlobal.colors.text.primary,
            marginBottom: stylesGlobal.spacing.scale[4],
            marginTop: stylesGlobal.spacing.scale[4],
          }}>
            Videos Destacados
          </Text>
          
          {loadingVideos ? (
            <LoadingComponent message="Cargando videos..." />
          ) : errorVideos ? (
            <ErrorComponent message={errorVideos} onRetry={refreshAll} />
          ) : (
            <FlatList
              data={videos}
              renderItem={renderVideoItem}
              keyExtractor={(item) => item._id || item.url}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: stylesGlobal.spacing.scale[4] }}
            />
          )}

          {/* Photos Section */}
          <Text style={{
            fontSize: mobileHelpers.getDynamicFontSize(stylesGlobal.typography.scale['2xl']),
            fontWeight: stylesGlobal.typography.weights.semibold as any,
            color: stylesGlobal.colors.text.primary,
            marginBottom: stylesGlobal.spacing.scale[4],
            marginTop: stylesGlobal.spacing.scale[6],
          }}>
            Galería de Fotos
          </Text>
          
          {loadingPhotos ? (
            <LoadingComponent message="Cargando fotos..." />
          ) : errorPhotos ? (
            <ErrorComponent message={errorPhotos} onRetry={refreshAll} />
          ) : (
            <FlatList
              data={photos}
              renderItem={renderPhotoItem}
              keyExtractor={(item) => item._id || item.url}
              numColumns={numColumns}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              scrollEnabled={false}
              contentContainerStyle={{ paddingBottom: stylesGlobal.spacing.scale[4] }}
            />
          )}
        </View>
      </ScrollView>

      {/* Event Modal */}
      <EventModal
        visible={eventModalVisible}
        eventos={eventos}
        loading={loadingEventos}
        error={errorEventos}
        onClose={() => setEventModalVisible(false)}
        onRefresh={loadEventos}
      />

      {/* Media Modal */}
      <MediaModal
        visible={mediaModalVisible}
        photo={selectedPhoto}
        video={selectedVideo}
        onClose={handleCloseModal}
      />
    </SafeAreaView>
  );
};

export default GaleriaScreen;