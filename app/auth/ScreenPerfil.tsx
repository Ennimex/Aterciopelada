import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  const [originalProfileData, setOriginalProfileData] = useState<UserProfile>({
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
  const [focusedField, setFocusedField] = useState<string>('');

  const { colors, spacing, typography } = stylesGlobal;

  // Obtener los datos del perfil al cargar el componente
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        const response = await profileAPI.getProfile() as ApiResponse;
        
        if (response.success && response.data) {
          const profileInfo = {
            id: response.data.id,
            name: response.data.name || '',
            email: response.data.email || '',
            phone: response.data.phone || '',
            role: response.data.role || 'user',
            createdAt: response.data.createdAt,
            avatar: response.data.avatar,
            emailVerified: response.data.emailVerified
          };
          setProfileData(profileInfo);
          setOriginalProfileData(profileInfo);
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

  // Función para verificar si hay cambios en el perfil
  const hasProfileChanges = (): boolean => {
    return (
      profileData.name !== originalProfileData.name ||
      profileData.email !== originalProfileData.email ||
      profileData.phone !== originalProfileData.phone
    );
  };

  // Función para obtener los campos que han cambiado
  const getChangedFields = (): string[] => {
    const changes: string[] = [];
    if (profileData.name !== originalProfileData.name) changes.push('Nombre');
    if (profileData.email !== originalProfileData.email) changes.push('Email');
    if (profileData.phone !== originalProfileData.phone) changes.push('Teléfono');
    return changes;
  };

  // Validar email
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validar teléfono
  const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  };

  const handleProfileSubmit = async () => {
    // Validar campos requeridos
    if (!profileData.name.trim() || !profileData.email.trim() || !profileData.phone.trim()) {
      Alert.alert('Error', 'Todos los campos son requeridos');
      return;
    }

    // Validar email
    if (!isValidEmail(profileData.email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    // Validar teléfono
    if (!isValidPhone(profileData.phone)) {
      Alert.alert('Error', 'Por favor ingresa un teléfono válido');
      return;
    }

    // Verificar si hay cambios
    if (!hasProfileChanges()) {
      Alert.alert('Información', 'No hay cambios para guardar');
      return;
    }

    // Mostrar qué campos se van a actualizar
    const changedFields = getChangedFields();
    const changedFieldsText = changedFields.join(', ');

    Alert.alert(
      'Confirmar cambios',
      `Se actualizarán los siguientes campos: ${changedFieldsText}`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await profileAPI.updateProfile({
                name: profileData.name,
                email: profileData.email,
                phone: profileData.phone
              });
              
              // Actualizar los datos originales después de un guardado exitoso
              setOriginalProfileData(profileData);
              
              Alert.alert(
                'Éxito',
                `Perfil actualizado correctamente.\nCampos actualizados: ${changedFieldsText}`
              );
            } catch (error) {
              const errorMessage = (error as ApiError)?.error || 
                                 (error as ApiError)?.message || 
                                 'Error al actualizar el perfil';
              Alert.alert('Error', errorMessage);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handlePasswordSubmit = async () => {
    // Validaciones de contraseña
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      Alert.alert('Error', 'Todos los campos de contraseña son requeridos');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    // Validación de seguridad básica
    const hasUpperCase = /[A-Z]/.test(passwordData.newPassword);
    const hasLowerCase = /[a-z]/.test(passwordData.newPassword);
    const hasNumbers = /\d/.test(passwordData.newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      Alert.alert(
        'Contraseña débil',
        'La contraseña debe contener al menos:\n• Una mayúscula\n• Una minúscula\n• Un número'
      );
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

  const resetProfileChanges = () => {
    Alert.alert(
      'Descartar cambios',
      '¿Estás seguro de que quieres descartar todos los cambios?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Descartar',
          style: 'destructive',
          onPress: () => {
            setProfileData(originalProfileData);
          }
        }
      ]
    );
  };

  if (profileLoading) {
    return (
      <View style={[globalStyles.screenCentered, { backgroundColor: colors.surface.secondary }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={[globalStyles.textPrimary, { marginTop: spacing.scale[4] }]}>
          Cargando perfil...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={globalStyles.screenBase} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[colors.surface.primary, colors.surface.secondary, colors.neutral[100]]}
        style={{ flex: 1, paddingHorizontal: spacing.scale[4] }}
      >
        {/* Header con avatar y info básica */}
        <View style={{
          marginTop: spacing.scale[6],
          marginBottom: spacing.scale[6],
          padding: spacing.scale[4],
          backgroundColor: colors.surface.tertiary,
          borderRadius: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {profileData.avatar ? (
              <Image 
                source={{ uri: profileData.avatar }} 
                style={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: 40,
                  marginRight: spacing.scale[4],
                  borderWidth: 3,
                  borderColor: colors.primary[200],
                }} 
              />
            ) : (
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.primary[100],
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: spacing.scale[4],
                borderWidth: 3,
                borderColor: colors.primary[200],
              }}>
                <Text style={{
                  fontSize: 32,
                  color: colors.primary[600],
                  fontWeight: 'bold'
                }}>
                  {profileData.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: typography.scale.xl,
                fontWeight: '600',
                color: colors.text.primary,
                marginBottom: spacing.scale[1]
              }}>
                {profileData.name}
              </Text>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.scale[1] }}>
                <Ionicons name="mail-outline" size={16} color={colors.text.secondary} />
                <Text style={{
                  fontSize: typography.scale.sm,
                  color: colors.text.secondary,
                  marginLeft: spacing.scale[1]
                }}>
                  {profileData.email}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.scale[2] }}>
                <Ionicons 
                  name={profileData.role === 'admin' ? 'shield-checkmark' : 'person-outline'} 
                  size={16} 
                  color={colors.primary[500]} 
                />
                <Text style={{
                  fontSize: typography.scale.sm,
                  color: colors.primary[600],
                  fontWeight: '500',
                  marginLeft: spacing.scale[1]
                }}>
                  {profileData.role === 'admin' ? 'Administrador' : 'Usuario'}
                </Text>
              </View>

              {profileData.createdAt && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="calendar-outline" size={14} color={colors.text.muted} />
                  <Text style={{
                    fontSize: typography.scale.xs,
                    color: colors.text.muted,
                    marginLeft: spacing.scale[1]
                  }}>
                    Miembro desde {new Date(profileData.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Pestañas de navegación */}
        <View style={{ marginBottom: spacing.scale[6] }}>
          <View style={{ 
            flexDirection: 'row', 
            marginBottom: spacing.scale[4],
            backgroundColor: colors.neutral[100],
            borderRadius: 12,
            padding: 4,
          }}>
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: spacing.scale[3],
                borderRadius: 8,
                backgroundColor: activeTab === 'profile' ? colors.primary[500] : 'transparent',
              }}
              onPress={() => setActiveTab('profile')}
            >
              <Text style={{
                textAlign: 'center',
                color: activeTab === 'profile' ? colors.text.inverse : colors.text.secondary,
                fontWeight: activeTab === 'profile' ? '600' : '400',
                fontSize: typography.scale.sm,
              }}>
                <Ionicons 
                  name="person-outline" 
                  size={16} 
                  color={activeTab === 'profile' ? colors.text.inverse : colors.text.secondary} 
                /> Perfil
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: spacing.scale[3],
                borderRadius: 8,
                backgroundColor: activeTab === 'password' ? colors.primary[500] : 'transparent',
              }}
              onPress={() => setActiveTab('password')}
            >
              <Text style={{
                textAlign: 'center',
                color: activeTab === 'password' ? colors.text.inverse : colors.text.secondary,
                fontWeight: activeTab === 'password' ? '600' : '400',
                fontSize: typography.scale.sm,
              }}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={16} 
                  color={activeTab === 'password' ? colors.text.inverse : colors.text.secondary} 
                /> Seguridad
              </Text>
            </TouchableOpacity>
          </View>

          {/* Contenido de las pestañas */}
          <View style={{
            backgroundColor: colors.surface.tertiary,
            borderRadius: 16,
            padding: spacing.scale[4],
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}>
            {activeTab === 'profile' ? (
              <View>
                {/* Header con indicador de cambios */}
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: spacing.scale[4]
                }}>
                  <Text style={{
                    fontSize: typography.scale.lg,
                    fontWeight: '600',
                    color: colors.text.primary
                  }}>
                    Información personal
                  </Text>
                  {hasProfileChanges() && (
                    <View style={{
                      backgroundColor: colors.semantic.warning.light,
                      paddingHorizontal: spacing.scale[3],
                      paddingVertical: spacing.scale[1],
                      borderRadius: 12,
                    }}>
                      <Text style={{
                        fontSize: typography.scale.xs,
                        color: colors.semantic.warning.main,
                        fontWeight: '500'
                      }}>
                        Cambios pendientes
                      </Text>
                    </View>
                  )}
                </View>
                
                {/* Campo Nombre */}
                <View style={{ marginBottom: spacing.scale[4] }}>
                  <Text style={{
                    fontSize: typography.scale.sm,
                    color: colors.text.secondary,
                    marginBottom: spacing.scale[2],
                    fontWeight: '500'
                  }}>
                    Nombre completo
                  </Text>
                  <View style={{ position: 'relative' }}>
                    <TextInput
                      style={[
                        globalStyles.inputBase,
                        focusedField === 'name' && { borderColor: colors.primary[500] },
                        profileData.name !== originalProfileData.name && { 
                          borderColor: colors.semantic.warning.main,
                          backgroundColor: colors.semantic.warning.light + '20'
                        }
                      ]}
                      value={profileData.name}
                      onChangeText={(text) => handleProfileChange('name', text)}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField('')}
                      placeholder="Ingresa tu nombre completo"
                      placeholderTextColor={colors.text.muted}
                    />
                    {profileData.name !== originalProfileData.name && (
                      <View style={{ position: 'absolute', right: 12, top: 12 }}>
                        <Ionicons name="pencil" size={16} color={colors.semantic.warning.main} />
                      </View>
                    )}
                  </View>
                </View>

                {/* Campo Email */}
                <View style={{ marginBottom: spacing.scale[4] }}>
                  <Text style={{
                    fontSize: typography.scale.sm,
                    color: colors.text.secondary,
                    marginBottom: spacing.scale[2],
                    fontWeight: '500'
                  }}>
                    Correo electrónico
                  </Text>
                  <View style={{ position: 'relative' }}>
                    <TextInput
                      style={[
                        globalStyles.inputBase,
                        focusedField === 'email' && { borderColor: colors.primary[500] },
                        profileData.email !== originalProfileData.email && { 
                          borderColor: colors.semantic.warning.main,
                          backgroundColor: colors.semantic.warning.light + '20'
                        }
                      ]}
                      value={profileData.email}
                      onChangeText={(text) => handleProfileChange('email', text)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField('')}
                      placeholder="tu@email.com"
                      placeholderTextColor={colors.text.muted}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    {profileData.email !== originalProfileData.email && (
                      <View style={{ position: 'absolute', right: 12, top: 12 }}>
                        <Ionicons name="pencil" size={16} color={colors.semantic.warning.main} />
                      </View>
                    )}
                  </View>
                </View>

                {/* Campo Teléfono */}
                <View style={{ marginBottom: spacing.scale[6] }}>
                  <Text style={{
                    fontSize: typography.scale.sm,
                    color: colors.text.secondary,
                    marginBottom: spacing.scale[2],
                    fontWeight: '500'
                  }}>
                    Teléfono
                  </Text>
                  <View style={{ position: 'relative' }}>
                    <TextInput
                      style={[
                        globalStyles.inputBase,
                        focusedField === 'phone' && { borderColor: colors.primary[500] },
                        profileData.phone !== originalProfileData.phone && { 
                          borderColor: colors.semantic.warning.main,
                          backgroundColor: colors.semantic.warning.light + '20'
                        }
                      ]}
                      value={profileData.phone}
                      onChangeText={(text) => handleProfileChange('phone', text)}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField('')}
                      placeholder="+52 771 123 4567"
                      placeholderTextColor={colors.text.muted}
                      keyboardType="phone-pad"
                    />
                    {profileData.phone !== originalProfileData.phone && (
                      <View style={{ position: 'absolute', right: 12, top: 12 }}>
                        <Ionicons name="pencil" size={16} color={colors.semantic.warning.main} />
                      </View>
                    )}
                  </View>
                </View>

                {/* Botones de acción */}
                <View style={{ flexDirection: 'row', gap: spacing.scale[3] }}>
                  {hasProfileChanges() && (
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        paddingVertical: spacing.scale[3],
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: colors.neutral[300],
                        alignItems: 'center',
                      }}
                      onPress={resetProfileChanges}
                    >
                      <Text style={{
                        color: colors.text.secondary,
                        fontWeight: '500'
                      }}>
                        Descartar
                      </Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={{
                      flex: hasProfileChanges() ? 2 : 1,
                      paddingVertical: spacing.scale[3],
                      borderRadius: 12,
                      backgroundColor: hasProfileChanges() ? colors.primary[500] : colors.neutral[300],
                      alignItems: 'center',
                      opacity: loading ? 0.7 : 1,
                    }}
                    onPress={handleProfileSubmit}
                    disabled={loading || !hasProfileChanges()}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {loading ? (
                        <>
                          <ActivityIndicator size="small" color={colors.text.inverse} />
                          <Text style={{
                            color: colors.text.inverse,
                            fontWeight: '600',
                            marginLeft: spacing.scale[2]
                          }}>
                            Guardando...
                          </Text>
                        </>
                      ) : (
                        <>
                          <Ionicons 
                            name="checkmark-circle-outline" 
                            size={16} 
                            color={hasProfileChanges() ? colors.text.inverse : colors.text.muted} 
                          />
                          <Text style={{
                            color: hasProfileChanges() ? colors.text.inverse : colors.text.muted,
                            fontWeight: '600',
                            marginLeft: spacing.scale[2]
                          }}>
                            Guardar cambios
                          </Text>
                        </>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Información de ayuda */}
                {hasProfileChanges() && (
                  <View style={{
                    marginTop: spacing.scale[4],
                    padding: spacing.scale[3],
                    backgroundColor: colors.primary[50],
                    borderRadius: 8,
                    borderLeftWidth: 4,
                    borderLeftColor: colors.primary[500],
                  }}>
                    <Text style={{
                      fontSize: typography.scale.xs,
                      color: colors.text.secondary,
                      lineHeight: 16,
                    }}>
                      Campos modificados: {getChangedFields().join(', ')}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View>
                <Text style={{
                  fontSize: typography.scale.lg,
                  fontWeight: '600',
                  color: colors.text.primary,
                  marginBottom: spacing.scale[4]
                }}>
                  Cambiar contraseña
                </Text>
                
                {/* Contraseña actual */}
                <View style={{ marginBottom: spacing.scale[4] }}>
                  <Text style={{
                    fontSize: typography.scale.sm,
                    color: colors.text.secondary,
                    marginBottom: spacing.scale[2],
                    fontWeight: '500'
                  }}>
                    Contraseña actual
                  </Text>
                  <TextInput
                    style={[
                      globalStyles.inputBase,
                      focusedField === 'currentPassword' && { borderColor: colors.primary[500] }
                    ]}
                    value={passwordData.currentPassword}
                    onChangeText={(text) => handlePasswordChange('currentPassword', text)}
                    onFocus={() => setFocusedField('currentPassword')}
                    onBlur={() => setFocusedField('')}
                    placeholder="Ingresa tu contraseña actual"
                    placeholderTextColor={colors.text.muted}
                    secureTextEntry
                  />
                </View>

                {/* Nueva contraseña */}
                <View style={{ marginBottom: spacing.scale[4] }}>
                  <Text style={{
                    fontSize: typography.scale.sm,
                    color: colors.text.secondary,
                    marginBottom: spacing.scale[2],
                    fontWeight: '500'
                  }}>
                    Nueva contraseña
                  </Text>
                  <TextInput
                    style={[
                      globalStyles.inputBase,
                      focusedField === 'newPassword' && { borderColor: colors.primary[500] }
                    ]}
                    value={passwordData.newPassword}
                    onChangeText={(text) => handlePasswordChange('newPassword', text)}
                    onFocus={() => setFocusedField('newPassword')}
                    onBlur={() => setFocusedField('')}
                    placeholder="Ingresa tu nueva contraseña"
                    placeholderTextColor={colors.text.muted}
                    secureTextEntry
                  />
                </View>

                {/* Confirmar contraseña */}
                <View style={{ marginBottom: spacing.scale[6] }}>
                  <Text style={{
                    fontSize: typography.scale.sm,
                    color: colors.text.secondary,
                    marginBottom: spacing.scale[2],
                    fontWeight: '500'
                  }}>
                    Confirmar nueva contraseña
                  </Text>
                  <TextInput
                    style={[
                      globalStyles.inputBase,
                      focusedField === 'confirmPassword' && { borderColor: colors.primary[500] }
                    ]}
                    value={passwordData.confirmPassword}
                    onChangeText={(text) => handlePasswordChange('confirmPassword', text)}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField('')}
                    placeholder="Confirma tu nueva contraseña"
                    placeholderTextColor={colors.text.muted}
                    secureTextEntry
                  />
                </View>

                {/* Botón cambiar contraseña */}
                <TouchableOpacity
                  style={{
                    paddingVertical: spacing.scale[3],
                    borderRadius: 12,
                    backgroundColor: colors.primary[500],
                    alignItems: 'center',
                    opacity: loading ? 0.7 : 1,
                  }}
                  onPress={handlePasswordSubmit}
                  disabled={loading}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {loading ? (
                      <>
                        <ActivityIndicator size="small" color={colors.text.inverse} />
                        <Text style={{
                          color: colors.text.inverse,
                          fontWeight: '600',
                          marginLeft: spacing.scale[2]
                        }}>
                          Cambiando...
                        </Text>
                      </>
                    ) : (
                      <>
                        <Ionicons name="shield-checkmark-outline" size={16} color={colors.text.inverse} />
                        <Text style={{
                          color: colors.text.inverse,
                          fontWeight: '600',
                          marginLeft: spacing.scale[2]
                        }}>
                          Cambiar contraseña
                        </Text>
                      </>
                    )}
                  </View>
                </TouchableOpacity>

                {/* Información de seguridad */}
                <View style={{
                  marginTop: spacing.scale[4],
                  padding: spacing.scale[3],
                  backgroundColor: colors.semantic.info.light,
                  borderRadius: 8,
                  borderLeftWidth: 4,
                  borderLeftColor: colors.semantic.info.main,
                }}>
                  <Text style={{
                    fontSize: typography.scale.xs,
                    color: colors.text.secondary,
                    lineHeight: 16,
                  }}>
                    Tu contraseña debe tener al menos 8 caracteres e incluir mayúsculas, minúsculas y números.
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </ScrollView>
  );
};

export default ScreenPerfil;