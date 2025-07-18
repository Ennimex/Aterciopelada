
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthProvider';
import { stylesGlobal } from '../styles/stylesGlobal';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email: string) => {
    // Validación simple de email
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    if (!validateEmail(email)) {
      setError('El correo no es válido.');
      return;
    }
    
    setLoading(true);
    try {
      const result = await login({ email: email.trim(), password });
      
      if (result.success) {
        router.replace('/(tabs)'); // Redirige a la pantalla principal después de iniciar sesión
      } else {
        setError(result.message || 'Error al iniciar sesión');
      }
    } catch (error: any) {
      setError(error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={loginStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={loginStyles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={require('../assets/images/logo-aterciopelada.png')}
          style={loginStyles.logo}
          resizeMode="contain"
        />
        <Text style={loginStyles.title}>Bienvenido</Text>
        <Text style={loginStyles.subtitle}>Inicia sesión para continuar</Text>
        <TextInput
          style={loginStyles.input}
          placeholder="Correo electrónico"
          placeholderTextColor={typeof stylesGlobal.colors.text.muted === 'string' ? stylesGlobal.colors.text.muted : '#b8aca4'}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <View style={loginStyles.passwordContainer}>
          <TextInput
            style={loginStyles.passwordInput}
            placeholder="Contraseña"
            placeholderTextColor={typeof stylesGlobal.colors.text.muted === 'string' ? stylesGlobal.colors.text.muted : '#b8aca4'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={loginStyles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={24}
              color={typeof stylesGlobal.colors.text.muted === 'string' ? stylesGlobal.colors.text.muted : '#b8aca4'}
            />
          </TouchableOpacity>
        </View>
        {error ? <Text style={loginStyles.error}>{error}</Text> : null}
        <TouchableOpacity
          style={[loginStyles.button, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={loginStyles.buttonText}>{loading ? 'Ingresando...' : 'Ingresar'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={loginStyles.registerLink}
          onPress={() => router.push('/RegisterScreen')}
        >
          <Text style={loginStyles.registerText}>¿Aún no te has registrado?</Text>
          <Text style={loginStyles.registerTextBold}> Regístrate aquí</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: typeof stylesGlobal.colors.surface.primary === 'string' ? stylesGlobal.colors.surface.primary : '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 32,
    borderRadius: 75, // Hace el contorno circular
    backgroundColor: '#fff',
    padding: 8,
    shadowColor: stylesGlobal.colors.primary[500] as string,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6, // Para Android
  },
  title: {
    fontSize: stylesGlobal.typography.headings.h3.fontSize,
    fontFamily: 'SpaceMono', // Cambia aquí si tienes Playfair Display cargada
    fontWeight: '700',
    color: typeof stylesGlobal.colors.primary[500] === 'string' ? stylesGlobal.colors.primary[500] : '#d63384',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: stylesGlobal.typography.body.base.fontSize,
    color: typeof stylesGlobal.colors.text.secondary === 'string' ? stylesGlobal.colors.text.secondary : '#524842',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    // Solo las propiedades válidas para TextInput
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: stylesGlobal.typography.body.base.fontSize,
    lineHeight: 24,
    color: typeof stylesGlobal.colors.text.primary === 'string' ? stylesGlobal.colors.text.primary : '#2a241f',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd6d1',
    borderRadius: 10,
    marginBottom: 16,
  },
  passwordContainer: {
    width: '100%',
    position: 'relative',
    marginBottom: 16,
  },
  passwordInput: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingRight: 50, // Espacio para el ícono
    fontSize: stylesGlobal.typography.body.base.fontSize,
    lineHeight: 24,
    color: typeof stylesGlobal.colors.text.primary === 'string' ? stylesGlobal.colors.text.primary : '#2a241f',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd6d1',
    borderRadius: 10,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  button: {
    backgroundColor: typeof stylesGlobal.colors.primary[500] === 'string' ? stylesGlobal.colors.primary[500] : '#d63384',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: stylesGlobal.typography.body.base.fontSize,
  },
  error: {
    color: typeof stylesGlobal.colors.semantic.error.main === 'string' ? stylesGlobal.colors.semantic.error.main : '#e11d48',
    marginBottom: 8,
  },
  registerLink: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerText: {
    color: typeof stylesGlobal.colors.text.secondary === 'string' ? stylesGlobal.colors.text.secondary : '#524842',
    fontSize: stylesGlobal.typography.body.small.fontSize,
  },
  registerTextBold: {
    color: typeof stylesGlobal.colors.primary[500] === 'string' ? stylesGlobal.colors.primary[500] : '#d63384',
    fontSize: stylesGlobal.typography.body.small.fontSize,
    fontWeight: '600',
  },
});
