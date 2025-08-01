import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Image, Platform, StyleSheet, View } from 'react-native';
import { useAuth } from '../context/AuthProvider';
import { stylesGlobal } from '../styles/stylesGlobal';

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, checkTokenExpiration } = useAuth();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Forzar la redirección al login inicialmente
        await AsyncStorage.removeItem('token');
        
        // Verificar si el token aún es válido
        const tokenValid = await checkTokenExpiration();
        
        // Simula carga adicional
        setTimeout(() => {
          router.replace('/LoginScreen');
        }, 1500);
      } catch (error) {
        console.error('Error in SplashScreen:', error);
        router.replace('/LoginScreen');
      }
    };

    initializeApp();
  }, [router, isAuthenticated, checkTokenExpiration]);

  return (
    <View style={splashStyles.container}>
      <Image
        source={require('../assets/images/logo-aterciopelada.png')}
        style={splashStyles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color={stylesGlobal.colors.primary[500] as string} />
    </View>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: typeof stylesGlobal.colors.surface.primary === 'string' ? stylesGlobal.colors.surface.primary : '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 40,
    borderRadius: 100, // Hace el contorno circular
    backgroundColor: '#fff',
    padding: 10,
    elevation: 8, // Para Android
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 4px 8px rgba(214, 51, 132, 0.3)'
    } : {
      shadowColor: stylesGlobal.colors.primary[500] as string,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    })
  },
});
