import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TextInput, View } from 'react-native';
import { Button } from 'react-native-paper';
import { profileAPI } from '../../services/api';
import { globalStyles, stylesGlobal } from '../../styles/stylesGlobal';

interface UserProfile {
  id?: string;
  name: string;
  email: string;
  phone: string;
  role?: string;
  createdAt?: string;
  avatar?: string;
  emailVerified?: boolean;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ApiError {
  error?: string;
  message?: string;
}

interface ApiResponse {
  success: boolean;
  data: UserProfile;
}

const ScreenPerfil = () => {
  const [profileData, setProfileData] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
  });
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  // Obtener los datos del perfil al cargar el componente
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        const response = await profileAPI.getProfile() as ApiResponse;
        
        if (response.success && response.data) {
          setProfileData({
            id: response.data.id,
            name: response.data.name || '',
            email: response.data.email || '',
            phone: response.data.phone || '',
            role: response.data.role || 'user',
            createdAt: response.data.createdAt,
            avatar: response.data.avatar,
            emailVerified: response.data.emailVerified
          });
        } else {
          throw new Error('No se pudo cargar la información del perfil');
        }
      } catch (error) {
        const errorMessage = (error as ApiError)?.error || 
                           (error as ApiError)?.message || 
                           'No se pudo cargar el perfil. Por favor intenta nuevamente.';
        Alert.alert('Error', errorMessage);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileChange = (field: keyof UserProfile, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordChange = (field: keyof PasswordData, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProfileSubmit = async () => {
    if (!profileData.name || !profileData.email || !profileData.phone) {
      Alert.alert('Error', 'Todos los campos son requeridos');
      return;
    }

    try {
      setLoading(true);
      const response = await profileAPI.updateProfile({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone
      });
      
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (error) {
      const errorMessage = (error as ApiError)?.error || 
                         (error as ApiError)?.message || 
                         'Error al actualizar el perfil';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    try {
      setLoading(true);
      const response = await profileAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      Alert.alert('Éxito', 'Contraseña cambiada correctamente');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      const errorMessage = (error as ApiError)?.error || 
                         (error as ApiError)?.message || 
                         'Error al cambiar la contraseña';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <View style={[globalStyles.screenCentered, { backgroundColor: stylesGlobal.colors.surface.secondary }]}>
        <ActivityIndicator size="large" color={stylesGlobal.colors.primary[500]} />
      </View>
    );
  }

  return (
    <ScrollView style={[globalStyles.screenBase, { padding: stylesGlobal.spacing.scale[4] }]}>
      {/* Sección de información del usuario */}
      <View style={[globalStyles.flexRow, { 
        alignItems: 'center', 
        marginBottom: stylesGlobal.spacing.scale[4],
        padding: stylesGlobal.spacing.scale[3],
        backgroundColor: stylesGlobal.colors.surface.tertiary,
        borderRadius: 12
      }]}>
        {profileData.avatar ? (
          <Image 
            source={{ uri: profileData.avatar }} 
            style={{ 
              width: 80, 
              height: 80, 
              borderRadius: 40,
              marginRight: stylesGlobal.spacing.scale[3]
            }} 
          />
        ) : (
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: stylesGlobal.colors.primary[100],
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: stylesGlobal.spacing.scale[3]
          }}>
            <Text style={{
              fontSize: 30,
              color: stylesGlobal.colors.primary[500],
              fontWeight: 'bold'
            }}>
              {profileData.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        
        <View style={{ flex: 1 }}>
          <Text style={[globalStyles.listItemTitle, { marginBottom: stylesGlobal.spacing.scale[1] }]}>
            {profileData.name}
          </Text>
          <Text style={[globalStyles.listItemSubtitle, { marginBottom: stylesGlobal.spacing.scale[1] }]}>
            {profileData.email}
          </Text>

          <Text style={[globalStyles.textMuted, { marginBottom: stylesGlobal.spacing.scale[1] }]}>
            Rol: {profileData.role === 'admin' ? 'Administrador' : 'Usuario'}
          </Text>
          {profileData.createdAt && (
            <Text style={globalStyles.textMuted}>
              Miembro desde: {new Date(profileData.createdAt).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>

      {/* Pestañas de edición */}
      <View style={{ marginBottom: stylesGlobal.spacing.scale[6] }}>
        <View style={[globalStyles.flexRow, { marginBottom: stylesGlobal.spacing.scale[4] }]}>
          <Button
            mode={activeTab === 'profile' ? 'contained' : 'outlined'}
            onPress={() => setActiveTab('profile')}
            style={{ flex: 1, marginRight: stylesGlobal.spacing.scale[2] }}
            labelStyle={{ color: activeTab === 'profile' ? stylesGlobal.colors.primary.contrast : stylesGlobal.colors.primary[500] }}
          >
            Perfil
          </Button>
          <Button
            mode={activeTab === 'password' ? 'contained' : 'outlined'}
            onPress={() => setActiveTab('password')}
            style={{ flex: 1 }}
            labelStyle={{ color: activeTab === 'password' ? stylesGlobal.colors.primary.contrast : stylesGlobal.colors.primary[500] }}
          >
            Contraseña
          </Button>
        </View>

        {activeTab === 'profile' ? (
          <View>
            <Text style={[globalStyles.listItemTitle, { marginBottom: stylesGlobal.spacing.scale[2] }]}>Información personal</Text>
            
            <View style={{ marginBottom: stylesGlobal.spacing.scale[4] }}>
              <Text style={globalStyles.listItemSubtitle}>Nombre completo</Text>
              <TextInput
                style={globalStyles.inputBase}
                value={profileData.name}
                onChangeText={(text) => handleProfileChange('name', text)}
                placeholder="Ingresa tu nombre"
              />
            </View>

            <View style={{ marginBottom: stylesGlobal.spacing.scale[4] }}>
              <Text style={globalStyles.listItemSubtitle}>Correo electrónico</Text>
              <TextInput
                style={globalStyles.inputBase}
                value={profileData.email}
                onChangeText={(text) => handleProfileChange('email', text)}
                placeholder="Ingresa tu correo"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={false} // El email no se puede editar normalmente
              />
            </View>

            <View style={{ marginBottom: stylesGlobal.spacing.scale[4] }}>
              <Text style={globalStyles.listItemSubtitle}>Teléfono</Text>
              <TextInput
                style={globalStyles.inputBase}
                value={profileData.phone}
                onChangeText={(text) => handleProfileChange('phone', text)}
                placeholder="Ingresa tu teléfono"
                keyboardType="phone-pad"
              />
            </View>

            <Button
              mode="contained"
              onPress={handleProfileSubmit}
              loading={loading}
              disabled={loading}
              style={[globalStyles.buttonPrimary, { marginTop: stylesGlobal.spacing.scale[4] }]}
              labelStyle={{ color: stylesGlobal.colors.primary.contrast }}
            >
              Guardar cambios
            </Button>
          </View>
        ) : (
          <View>
            <Text style={[globalStyles.listItemTitle, { marginBottom: stylesGlobal.spacing.scale[2] }]}>Cambiar contraseña</Text>
            
            <View style={{ marginBottom: stylesGlobal.spacing.scale[4] }}>
              <Text style={globalStyles.listItemSubtitle}>Contraseña actual</Text>
              <TextInput
                style={globalStyles.inputBase}
                value={passwordData.currentPassword}
                onChangeText={(text) => handlePasswordChange('currentPassword', text)}
                placeholder="Ingresa tu contraseña actual"
                secureTextEntry
              />
            </View>

            <View style={{ marginBottom: stylesGlobal.spacing.scale[4] }}>
              <Text style={globalStyles.listItemSubtitle}>Nueva contraseña</Text>
              <TextInput
                style={globalStyles.inputBase}
                value={passwordData.newPassword}
                onChangeText={(text) => handlePasswordChange('newPassword', text)}
                placeholder="Ingresa tu nueva contraseña"
                secureTextEntry
              />
            </View>

            <View style={{ marginBottom: stylesGlobal.spacing.scale[4] }}>
              <Text style={globalStyles.listItemSubtitle}>Confirmar nueva contraseña</Text>
              <TextInput
                style={globalStyles.inputBase}
                value={passwordData.confirmPassword}
                onChangeText={(text) => handlePasswordChange('confirmPassword', text)}
                placeholder="Confirma tu nueva contraseña"
                secureTextEntry
              />
            </View>

            <Button
              mode="contained"
              onPress={handlePasswordSubmit}
              loading={loading}
              disabled={loading}
              style={[globalStyles.buttonPrimary, { marginTop: stylesGlobal.spacing.scale[4] }]}
              labelStyle={{ color: stylesGlobal.colors.primary.contrast }}
            >
              Cambiar contraseña
            </Button>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default ScreenPerfil;