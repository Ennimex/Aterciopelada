import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthProvider';
import { stylesGlobal } from '../styles/stylesGlobal';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('El nombre es requerido.');
      return false;
    }
    if (!formData.email.trim()) {
      setError('El correo electrónico es requerido.');
      return false;
    }
    if (!validateEmail(formData.email)) {
      setError('El formato del correo no es válido.');
      return false;
    }
    if (!formData.password) {
      setError('La contraseña es requerida.');
      return false;
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('El teléfono es requerido.');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    setError('');
    setSuccess('');
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
      });

      if (result.success) {
        setSuccess('Registro exitoso. Ahora puedes iniciar sesión.');
        setTimeout(() => {
          router.replace('/LoginScreen');
        }, 2000);
      } else {
        setError(result.message || 'Error en el registro');
      }
    } catch (error: any) {
      setError(error.message || 'Error en el registro');
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    router.replace('/LoginScreen');
  };

  return (
    <KeyboardAvoidingView 
      style={registerStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={registerStyles.scrollView} 
        contentContainerStyle={registerStyles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={registerStyles.formContainer}>
          <Image
            source={require('../assets/images/logo-aterciopelada.png')}
            style={registerStyles.logo}
            resizeMode="contain"
          />
          
          <Text style={registerStyles.title}>Crear Cuenta</Text>
          <Text style={registerStyles.subtitle}>Únete a La Aterciopelada</Text>

          <TextInput
            style={registerStyles.input}
            placeholder="Nombre completo"
            placeholderTextColor={typeof stylesGlobal.colors.text.muted === 'string' ? stylesGlobal.colors.text.muted : '#b8aca4'}
            value={formData.name}
            onChangeText={(text) => setFormData({...formData, name: text})}
            autoCapitalize="words"
          />

          <TextInput
            style={registerStyles.input}
            placeholder="Correo electrónico"
            placeholderTextColor={typeof stylesGlobal.colors.text.muted === 'string' ? stylesGlobal.colors.text.muted : '#b8aca4'}
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={registerStyles.input}
            placeholder="Teléfono"
            placeholderTextColor={typeof stylesGlobal.colors.text.muted === 'string' ? stylesGlobal.colors.text.muted : '#b8aca4'}
            value={formData.phone}
            onChangeText={(text) => setFormData({...formData, phone: text})}
            keyboardType="phone-pad"
          />

          <View style={registerStyles.passwordContainer}>
            <TextInput
              style={registerStyles.passwordInput}
              placeholder="Contraseña"
              placeholderTextColor={typeof stylesGlobal.colors.text.muted === 'string' ? stylesGlobal.colors.text.muted : '#b8aca4'}
              value={formData.password}
              onChangeText={(text) => setFormData({...formData, password: text})}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={registerStyles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={24}
                color={typeof stylesGlobal.colors.text.muted === 'string' ? stylesGlobal.colors.text.muted : '#b8aca4'}
              />
            </TouchableOpacity>
          </View>

          <View style={registerStyles.passwordContainer}>
            <TextInput
              style={registerStyles.passwordInput}
              placeholder="Confirmar contraseña"
              placeholderTextColor={typeof stylesGlobal.colors.text.muted === 'string' ? stylesGlobal.colors.text.muted : '#b8aca4'}
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              style={registerStyles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off' : 'eye'}
                size={24}
                color={typeof stylesGlobal.colors.text.muted === 'string' ? stylesGlobal.colors.text.muted : '#b8aca4'}
              />
            </TouchableOpacity>
          </View>

          {error ? <Text style={registerStyles.error}>{error}</Text> : null}
          {success ? <Text style={registerStyles.success}>{success}</Text> : null}

          <TouchableOpacity
            style={[registerStyles.button, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={registerStyles.buttonText}>
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={goToLogin} style={registerStyles.linkContainer}>
            <Text style={registerStyles.linkText}>
              ¿Ya tienes cuenta? Inicia sesión
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const registerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: typeof stylesGlobal.colors.surface.primary === 'string' ? stylesGlobal.colors.surface.primary : '#fff',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  formContainer: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
    borderRadius: 60,
    backgroundColor: '#fff',
    padding: 6,
    shadowColor: typeof stylesGlobal.colors.primary[500] === 'string' ? stylesGlobal.colors.primary[500] : '#d63384',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: stylesGlobal.typography.headings.h3.fontSize,
    fontFamily: 'SpaceMono',
    fontWeight: '700',
    color: typeof stylesGlobal.colors.primary[500] === 'string' ? stylesGlobal.colors.primary[500] : '#d63384',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: stylesGlobal.typography.body.base.fontSize,
    color: typeof stylesGlobal.colors.text.secondary === 'string' ? stylesGlobal.colors.text.secondary : '#524842',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    width: '100%',
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
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: stylesGlobal.typography.body.base.fontSize,
  },
  error: {
    color: typeof stylesGlobal.colors.semantic.error.main === 'string' ? stylesGlobal.colors.semantic.error.main : '#e11d48',
    marginBottom: 8,
    textAlign: 'center',
  },
  success: {
    color: typeof stylesGlobal.colors.semantic.success.main === 'string' ? stylesGlobal.colors.semantic.success.main : '#22c55e',
    marginBottom: 8,
    textAlign: 'center',
  },
  linkContainer: {
    paddingVertical: 8,
  },
  linkText: {
    color: typeof stylesGlobal.colors.primary[500] === 'string' ? stylesGlobal.colors.primary[500] : '#d63384',
    fontSize: stylesGlobal.typography.body.small.fontSize,
    fontWeight: '500',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
