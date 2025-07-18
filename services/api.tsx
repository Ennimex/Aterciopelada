import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Interfaces para tipos de datos
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

interface ApiResponse<T = any> {
  data: T;
  message?: string;
  error?: string;
}

interface ErrorResponse {
  error: string;
  originalError?: any;
}

interface UserData {
  id?: number;
  nombre: string;
  email: string;
  telefono?: string;
  rol?: string;
  activo?: boolean;
}

interface ProductoData {
  _id?: string;
  nombre: string;
  descripcion?: string;
  tipoTela?: string;
  imagenURL?: string;
  localidadId: string | LocalidadData;
  tallasDisponibles?: (string | TallaData)[];
  // Campos adicionales para compatibilidad con frontend
  categoriaId?: number;
  disponible?: boolean;
  id?: string; // Alias para _id
}

interface CategoriaData {
  id?: number;
  nombre: string;
  descripcion?: string;
  imagenURL?: string;
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

interface LocalidadData {
  _id?: string;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

interface EventoData {
  id?: number;
  titulo: string;
  descripcion?: string;
  fecha: string;
  ubicacion?: string;
  activo?: boolean;
}

interface FotoData {
  id?: number;
  titulo?: string;
  descripcion?: string;
  categoria?: string;
  activo?: boolean;
}

interface VideoData {
  id?: number;
  titulo: string;
  descripcion?: string;
  url: string;
  activo?: boolean;
}

interface ServicioData {
  id?: number;
  nombre: string;
  descripcion?: string;
  precio?: number;
  activo?: boolean;
}

interface NosotrosData {
  id?: number;
  mision?: string;
  vision?: string;
  historia?: string;
  valores?: string;
}

interface ColaboradorData {
  id?: number;
  nombre: string;
  cargo?: string;
  descripcion?: string;
  activo?: boolean;
}

// Configuración global de Axios
const api: AxiosInstance = axios.create({
  baseURL: 'https://back-three-gamma.vercel.app/api', // URL de tu API en Vercel
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para agregar el token automáticamente en cada petición
api.interceptors.request.use(
  async (config: any) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from AsyncStorage:', error);
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error: any): Promise<ErrorResponse> => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Manejar diferentes tipos de errores del backend
    if (error.response?.data) {
      const errorData = error.response.data;
      
      // Si es un array de errores de validación, unirlos en un string
      if (Array.isArray(errorData.error)) {
        const errorMessage = errorData.error.join(', ');
        return Promise.reject({ error: errorMessage, originalError: errorData });
      }
      
      // Si es un error con mensaje simple
      if (errorData.error) {
        return Promise.reject({ error: errorData.error, originalError: errorData });
      }
      
      // Si es un error con mensaje en 'message'
      if (errorData.message) {
        return Promise.reject({ error: errorData.message, originalError: errorData });
      }
    }
    
    // Error de conexión o sin respuesta del servidor
    if (error.request) {
      return Promise.reject({ 
        error: 'Error de conexión. Verifica tu conexión a internet.', 
        originalError: error 
      });
    }
    
    // Otros errores
    return Promise.reject({ 
      error: error.message || 'Error desconocido', 
      originalError: error 
    });
  }
);

// Funciones de autenticación
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse> => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response;
    } catch (error) {
      throw error;
    }
  },

  register: async (userData: RegisterData): Promise<ApiResponse> => {
    try {
      const response = await api.post('/auth/register', userData);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

// Funciones para páginas públicas
export const publicAPI = {
  // Categorías
  getCategorias: async (): Promise<ApiResponse<CategoriaData[]>> => {
    try {
      const response = await api.get('/categorias');

      // Verificar que cada categoría tenga los campos necesarios
      if (Array.isArray(response)) {
        response.forEach((categoria: any, index: number) => {
          // Removed console logs for each category
        });
      }

      // El interceptor ya extrajo response.data, así que response es directamente el array
      const formattedResponse: ApiResponse<CategoriaData[]> = {
        data: response as any,
        message: 'Categorías obtenidas exitosamente'
      };

      return formattedResponse;
    } catch (error) {
      console.error('❌ Error al obtener categorías:', error);
      throw error;
    }
  },

  // Localidades
  getLocalidades: async (): Promise<ApiResponse<LocalidadData[]>> => {
    try {
      const response = await api.get('/localidades');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Tallas
  getTallas: async (): Promise<ApiResponse<TallaData[]>> => {
    try {
      const response = await api.get('/tallas');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Productos
  getProductos: async (): Promise<ApiResponse<ProductoData[]>> => {
    try {
      const response = await api.get('/public/productos');
      return response;
    } catch (error) {
      throw error;
    }
  },

  getProductoById: async (id: number | string): Promise<ApiResponse<ProductoData>> => {
    try {
      const response = await api.get(`/public/productos/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Nosotros
  getNosotros: async (): Promise<ApiResponse<NosotrosData>> => {
    try {
      const response = await api.get('/nosotros');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Fotos
  getFotos: async (): Promise<ApiResponse<FotoData[]>> => {
    try {
      const response = await api.get('/fotos');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Videos (si existen)
  getVideos: async (): Promise<ApiResponse<VideoData[]>> => {
    try {
      const response = await api.get('/videos');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Eventos (si existen)
  getEventos: async (): Promise<ApiResponse<EventoData[]>> => {
    try {
      const response = await api.get('/eventos');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Colaboradores
  getColaboradores: async (): Promise<ApiResponse<ColaboradorData[]>> => {
    try {
      const response = await api.get('/public/colaboradores');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Servicios
  getServicios: async (): Promise<ApiResponse<ServicioData[]>> => {
    try {
      const response = await api.get('/servicios');
      return response;
    } catch (error) {
      throw error;
    }
  },
};

// Funciones para área administrativa
export const adminAPI = {
  // Dashboard
  getDashboard: async (): Promise<ApiResponse> => {
    try {
      const response = await api.get('/admin/dashboard');
      return response;
    } catch (error) {
      throw error;
    }
  },

  getActivity: async (): Promise<ApiResponse> => {
    try {
      const response = await api.get('/admin/activity');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Gestión de usuarios
  getUsers: async (): Promise<ApiResponse<UserData[]>> => {
    try {
      const response = await api.get('/admin/users');
      return response;
    } catch (error) {
      throw error;
    }
  },

  createUser: async (userData: UserData): Promise<ApiResponse<UserData>> => {
    try {
      const response = await api.post('/admin/users', userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateUser: async (userId: number | string, userData: Partial<UserData>): Promise<ApiResponse<UserData>> => {
    try {
      const response = await api.put(`/admin/users/${userId}`, userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  deleteUser: async (userId: number | string): Promise<ApiResponse> => {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Gestión de productos
  getProductos: async (): Promise<ApiResponse<ProductoData[]>> => {
    try {
      const response = await api.get('/productos');
      return response;
    } catch (error) {
      throw error;
    }
  },

  createProducto: async (formData: FormData): Promise<ApiResponse<ProductoData>> => {
    try {
      const response = await api.post('/productos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateProducto: async (productoId: number | string, formData: FormData): Promise<ApiResponse<ProductoData>> => {
    try {
      const response = await api.put(`/productos/${productoId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  deleteProducto: async (productoId: number | string): Promise<ApiResponse> => {
    try {
      const response = await api.delete(`/productos/${productoId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Gestión de categorías
  getCategorias: async (): Promise<ApiResponse<CategoriaData[]>> => {
    try {
      const response = await api.get('/categorias');
      return response;
    } catch (error) {
      throw error;
    }
  },

  createCategoria: async (formData: FormData): Promise<ApiResponse<CategoriaData>> => {
    try {
      const response = await api.post('/categorias', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateCategoria: async (categoriaId: number | string, formData: FormData): Promise<ApiResponse<CategoriaData>> => {
    try {
      const response = await api.put(`/categorias/${categoriaId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  deleteCategoria: async (categoriaId: number | string): Promise<ApiResponse> => {
    try {
      const response = await api.delete(`/categorias/${categoriaId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Gestión de tallas
  getTallas: async (): Promise<ApiResponse<TallaData[]>> => {
    try {
      const response = await api.get('/tallas');
      return response;
    } catch (error) {
      throw error;
    }
  },

  createTalla: async (tallaData: TallaData): Promise<ApiResponse<TallaData>> => {
    try {
      const response = await api.post('/tallas', tallaData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateTalla: async (tallaId: number | string, tallaData: Partial<TallaData>): Promise<ApiResponse<TallaData>> => {
    try {
      const response = await api.put(`/tallas/${tallaId}`, tallaData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  deleteTalla: async (tallaId: number | string): Promise<ApiResponse> => {
    try {
      const response = await api.delete(`/tallas/${tallaId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};