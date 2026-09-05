export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'elder' | 'publisher';
  congregation: string;
  phone?: string;
}

export interface Territory {
  id: string;
  number: number;
  name: string;
  group: string;
  type: 'residential' | 'commercial' | 'mixed' | 'condominium';
  address: string;
  latitude: number;
  longitude: number;
  status: 'available' | 'assigned' | 'in_progress' | 'completed';
  visits: number;
  assignedTo?: string;
  assignedToName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  borders?: {
    north: string;
    south: string;
    east: string;
    west: string;
  };
  area?: {
    km2: number;
    perimeter: number;
  };
  layerName?: string;
  mapId?: string;
  lastUpdated?: string;
  type_territorio?: string;
  description?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  congregation: string;
  phone?: string;
}

export interface Designation {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedToName?: string;
  date: string;
  duration: number;
  location: 'salão' | 'online' | 'visita' | 'outro';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}