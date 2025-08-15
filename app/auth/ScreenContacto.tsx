import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { globalStyles, mobileHelpers, stylesGlobal } from '../../styles/stylesGlobal';

interface FormState {
  nombre: string;
  email: string;
  telefono: string;
  mensaje: string;
}

interface ContactInfo {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  content: string;
  action?: () => void;
}

interface SocialNetwork {
  icon: keyof typeof Ionicons.glyphMap;
  name: string;
  handle: string;
  url: string;
}

const { colors, spacing, typography } = stylesGlobal;
const { isTablet } = mobileHelpers.screen;

// Configuración del servicio de email
const EMAIL_CONFIG = {
  // Opción 1: EmailJS (Recomendado para apps móviles)
  EMAILJS_SERVICE_ID: "tu_service_id",
  EMAILJS_TEMPLATE_ID: "tu_template_id",
  EMAILJS_USER_ID: "tu_user_id",

  // Opción 2: API Backend personalizada
  API_ENDPOINT: "https://tu-servidor.com/api/contact",

  // Email de destino
  DESTINATION_EMAIL: "alexanderhernan325@gmail.com"
};

const ScreenContacto: React.FC = () => {
  const [formState, setFormState] = useState<FormState>({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedInput, setFocusedInput] = useState('');

  const handleInputChange = (field: keyof FormState, value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Validación del formulario
  const validateForm = (): boolean => {
    if (!formState.nombre.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return false;
    }

    if (!formState.email.trim()) {
      Alert.alert('Error', 'El email es requerido');
      return false;
    }

    // Validación de email básica
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formState.email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return false;
    }

    if (!formState.mensaje.trim()) {
      Alert.alert('Error', 'El mensaje es requerido');
      return false;
    }

    return true;
  };

  // OPCIÓN 1: Usando EmailJS (Recomendado para React Native)
  const sendEmailWithEmailJS = async () => {
    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: EMAIL_CONFIG.EMAILJS_SERVICE_ID,
          template_id: EMAIL_CONFIG.EMAILJS_TEMPLATE_ID,
          user_id: EMAIL_CONFIG.EMAILJS_USER_ID,
          template_params: {
            from_name: formState.nombre,
            from_email: formState.email,
            phone: formState.telefono || 'No proporcionado',
            message: formState.mensaje,
            to_email: EMAIL_CONFIG.DESTINATION_EMAIL,
            reply_to: formState.email,
          }
        })
      });

      if (response.ok) {
        return { success: true };
      } else {
        throw new Error('Error al enviar el email');
      }
    } catch (error) {
      console.error('Error EmailJS:', error);
      return { success: false, error: 'Error al enviar el email' };
    }
  };

  // OPCIÓN 2: Usando tu propio backend
  const sendEmailWithAPI = async () => {
    try {
      const response = await fetch(EMAIL_CONFIG.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formState.nombre,
          email: formState.email,
          telefono: formState.telefono,
          mensaje: formState.mensaje,
          destinatario: EMAIL_CONFIG.DESTINATION_EMAIL,
          timestamp: new Date().toISOString(),
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        return { success: true };
      } else {
        throw new Error(result.message || 'Error al enviar el email');
      }
    } catch (error) {
      console.error('Error API:', error);
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  };

  // OPCIÓN 3: Usando mailto (funciona pero no es ideal)
  const sendEmailWithMailto = async () => {
    try {
      const subject = encodeURIComponent(`Contacto desde la app - ${formState.nombre}`);
      const body = encodeURIComponent(
        `Nombre: ${formState.nombre}\n` +
        `Email: ${formState.email}\n` +
        `Teléfono: ${formState.telefono || 'No proporcionado'}\n\n` +
        `Mensaje:\n${formState.mensaje}\n\n` +
        `---\nEnviado desde la app La Aterciopelada`
      );
      
      const mailtoUrl = `mailto:${EMAIL_CONFIG.DESTINATION_EMAIL}?subject=${subject}&body=${body}`;
      
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
        return { success: true };
      } else {
        throw new Error('No hay aplicación de email configurada');
      }
    } catch (error) {
      console.error('Error mailto:', error);
      return { success: false, error: 'Error al abrir la aplicación de email' };
    }
  };

  // OPCIÓN 4: Usando Formspree (Servicio externo simple)
  const sendEmailWithFormspree = async () => {
    try {
      const response = await fetch('https://formspree.io/f/TU_FORM_ID', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formState.nombre,
          email: formState.email,
          phone: formState.telefono,
          message: formState.mensaje,
        })
      });

      if (response.ok) {
        return { success: true };
      } else {
        throw new Error('Error al enviar el formulario');
      }
    } catch (error) {
      console.error('Error Formspree:', error);
      return { success: false, error: 'Error al enviar el formulario' };
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Cambia aquí el método que quieras usar:
      // const result = await sendEmailWithEmailJS();
      // const result = await sendEmailWithAPI();
      const result = await sendEmailWithMailto(); // Más simple para empezar
      // const result = await sendEmailWithFormspree();

      if (result.success) {
        // Limpiar formulario
        setFormState({
          nombre: '',
          email: '',
          telefono: '',
          mensaje: '',
        });

        Alert.alert(
          '¡Mensaje Enviado!',
          'Gracias por contactarnos. Te responderemos en breve.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Error',
          result.error || 'Hubo un problema al enviar el mensaje. Inténtalo de nuevo.'
        );
      }
    } catch (error) {
      console.error('Error general:', error);
      Alert.alert(
        'Error',
        'Hubo un problema inesperado. Por favor intenta de nuevo.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openURL = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'No se puede abrir este enlace');
      }
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al abrir el enlace');
    }
  };

  const contactInfo: ContactInfo[] = [
    {
      icon: 'call-outline',
      title: 'Teléfono',
      content: '+52 771 123 4567',
      action: () => openURL('tel:+527711234567'),
    },
    {
      icon: 'mail-outline',
      title: 'Correo',
      content: 'contacto@laaterciopelada.com',
      action: () => openURL('mailto:contacto@laaterciopelada.com'),
    },
    {
      icon: 'location-outline',
      title: 'Ubicación',
      content: 'Huasteca Potosina, SLP',
      action: () => openURL('https://maps.google.com/?q=Huasteca+Potosina'),
    },
  ];

  const socialNetworks: SocialNetwork[] = [
    {
      icon: 'logo-facebook',
      name: 'Facebook',
      handle: '@LaAterciopelada',
      url: 'https://web.facebook.com/people/La-Aterciopelada/61567232369483/?sk=photos',
    },
    {
      icon: 'logo-whatsapp',
      name: 'WhatsApp',
      handle: '+52 771 123 4567',
      url: 'https://wa.me/527711234567',
    },
  ];

  return (
    <KeyboardAvoidingView
      style={globalStyles.screenBase}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[colors.surface.primary, colors.surface.secondary, colors.neutral[100]]}
        style={{ flex: 1 }}
      >
        <ScrollView 
          style={globalStyles.screenContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Sección Hero */}
          <View style={{ paddingVertical: spacing.scale[8] }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.primary[100],
              paddingHorizontal: spacing.scale[4],
              paddingVertical: spacing.scale[2],
              borderRadius: 20,
              alignSelf: 'center',
              marginBottom: spacing.scale[4],
            }}>
              <Ionicons name="chatbubble-outline" size={16} color={colors.primary[600]} />
              <Text style={{
                marginLeft: spacing.scale[2],
                color: colors.primary[600],
                fontSize: typography.scale.sm,
                fontWeight: '600',
              }}>Contáctanos</Text>
            </View>

            <Text style={{
              fontSize: isTablet ? typography.scale['3xl'] : typography.scale['2xl'],
              color: colors.text.primary,
              textAlign: 'center',
              marginBottom: spacing.scale[4],
              fontWeight: '300',
            }}>
              Conecta con{'\n'}La Aterciopelada
            </Text>

            <Text style={{
              fontSize: typography.scale.base,
              color: colors.text.secondary,
              textAlign: 'center',
              marginBottom: spacing.scale[8],
              paddingHorizontal: spacing.scale[4],
            }}>
              Estamos aquí para ayudarte con tus pedidos especiales y conectarte con el auténtico arte textil huasteco.
            </Text>
          </View>

          {/* Sección de Información de Contacto */}
          <View style={{ marginBottom: spacing.scale[8] }}>
            {contactInfo.map((info, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  globalStyles.cardBase,
                  { marginBottom: spacing.scale[4] }
                ]}
                onPress={info.action}
                activeOpacity={info.action ? 0.7 : 1}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    backgroundColor: colors.primary[50],
                    padding: spacing.scale[3],
                    borderRadius: 12,
                    marginRight: spacing.scale[4],
                  }}>
                    <Ionicons name={info.icon} size={24} color={colors.primary[500]} />
                  </View>
                  <View>
                    <Text style={globalStyles.listItemTitle}>{info.title}</Text>
                    <Text style={globalStyles.listItemSubtitle}>{info.content}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Formulario */}
          <View style={[globalStyles.cardBase, { marginBottom: spacing.scale[8] }]}>
            <Text style={[globalStyles.listItemTitle, { marginBottom: spacing.scale[4] }]}>
              Envíanos un mensaje
            </Text>

            <View style={{ marginBottom: spacing.scale[4] }}>
              <Text style={globalStyles.listItemSubtitle}>Nombre *</Text>
              <TextInput
                style={[
                  globalStyles.inputBase,
                  focusedInput === 'nombre' && globalStyles.inputError
                ]}
                value={formState.nombre}
                onChangeText={(text) => handleInputChange('nombre', text)}
                onFocus={() => setFocusedInput('nombre')}
                onBlur={() => setFocusedInput('')}
                placeholder="Tu nombre completo"
                placeholderTextColor={colors.text.muted}
              />
            </View>

            <View style={{ marginBottom: spacing.scale[4] }}>
              <Text style={globalStyles.listItemSubtitle}>Email *</Text>
              <TextInput
                style={[
                  globalStyles.inputBase,
                  focusedInput === 'email' && globalStyles.inputError
                ]}
                value={formState.email}
                onChangeText={(text) => handleInputChange('email', text)}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput('')}
                placeholder="tu@email.com"
                placeholderTextColor={colors.text.muted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={{ marginBottom: spacing.scale[4] }}>
              <Text style={globalStyles.listItemSubtitle}>Teléfono</Text>
              <TextInput
                style={[
                  globalStyles.inputBase,
                  focusedInput === 'telefono' && globalStyles.inputError
                ]}
                value={formState.telefono}
                onChangeText={(text) => handleInputChange('telefono', text)}
                onFocus={() => setFocusedInput('telefono')}
                onBlur={() => setFocusedInput('')}
                placeholder="+52 771 123 4567"
                placeholderTextColor={colors.text.muted}
                keyboardType="phone-pad"
              />
            </View>

            <View style={{ marginBottom: spacing.scale[4] }}>
              <Text style={globalStyles.listItemSubtitle}>Mensaje *</Text>
              <TextInput
                style={[
                  globalStyles.inputBase,
                  { height: 100, textAlignVertical: 'top' },
                  focusedInput === 'mensaje' && globalStyles.inputError
                ]}
                value={formState.mensaje}
                onChangeText={(text) => handleInputChange('mensaje', text)}
                onFocus={() => setFocusedInput('mensaje')}
                onBlur={() => setFocusedInput('')}
                placeholder="¿Cómo podemos ayudarte?"
                placeholderTextColor={colors.text.muted}
                multiline
                numberOfLines={4}
              />
            </View>

            <TouchableOpacity
              style={[
                globalStyles.buttonPrimary,
                isSubmitting && { opacity: 0.7 }
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {isSubmitting ? (
                  <>
                    <ActivityIndicator size="small" color={colors.text.inverse} />
                    <Text style={[
                      globalStyles.textPrimary,
                      { color: colors.text.inverse, marginLeft: spacing.scale[2] }
                    ]}>
                      Enviando...
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="send-outline" size={16} color={colors.text.inverse} />
                    <Text style={[
                      globalStyles.textPrimary,
                      { color: colors.text.inverse, marginLeft: spacing.scale[2] }
                    ]}>
                      Enviar Mensaje
                    </Text>
                  </>
                )}
              </View>
            </TouchableOpacity>

            {/* Información adicional */}
            <Text style={{
              fontSize: typography.scale.xs,
              color: colors.text.muted,
              textAlign: 'center',
              marginTop: spacing.scale[3],
            }}>
              * Campos obligatorios
            </Text>
          </View>

          {/* Redes Sociales */}
          <View style={{ marginBottom: spacing.scale[8] }}>
            <Text style={[globalStyles.listItemTitle, { marginBottom: spacing.scale[4] }]}>
              Síguenos en redes sociales
            </Text>
            {socialNetworks.map((social, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  globalStyles.cardBase,
                  { marginBottom: spacing.scale[4] }
                ]}
                onPress={() => openURL(social.url)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    backgroundColor: colors.primary[50],
                    padding: spacing.scale[3],
                    borderRadius: 12,
                    marginRight: spacing.scale[4],
                  }}>
                    <Ionicons name={social.icon} size={24} color={colors.primary[500]} />
                  </View>
                  <View>
                    <Text style={globalStyles.listItemTitle}>{social.name}</Text>
                    <Text style={[
                      globalStyles.listItemSubtitle,
                      { color: colors.primary[500] }
                    ]}>{social.handle}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

export default ScreenContacto;