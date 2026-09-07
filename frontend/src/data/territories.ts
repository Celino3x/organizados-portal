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
  polygon?: string; // WKT do polígono
}

export const territories: Territory[] = [
  { id: '1', number: 1, name: 'Condomínio Aripuãna', group: 'Vilar Guanabara', type: 'condominium', address: 'Condomínio Aripuãna', latitude: -43.6165355, longitude: -22.9147943, status: 'available', visits: 0 },
  { id: '2', number: 2, name: 'Serra do Cipó/Alfredo de Assunção', group: 'Vilar Guanabara', type: 'residential', address: 'Serra do Cipó, Alfredo de Assunção', latitude: -43.6162726, longitude: -22.9139296, status: 'available', visits: 0 },
  { id: '3', number: 3, name: 'Serra do Cipó/Florentino Ávidos', group: 'Vilar Guanabara', type: 'residential', address: 'Serra do Cipó, Florentino Ávidos', latitude: -43.6140053, longitude: -22.913466, status: 'available', visits: 0 },
  { id: '4', number: 4, name: 'Serra do Cipó', group: 'Vilar Guanabara', type: 'residential', address: 'Serra do Cipó', latitude: -43.6139289, longitude: -22.9140071, status: 'available', visits: 0 },
  { id: '5', number: 5, name: 'Praça do Externato', group: 'Vilar Guanabara', type: 'mixed', address: 'Praça do Externato', latitude: -43.6124067, longitude: -22.9133697, status: 'available', visits: 0 },
  { id: '6', number: 6, name: 'Bom Pastor/Arco Íris', group: 'Vilar Guanabara', type: 'residential', address: 'Bom Pastor/Arco Íris', latitude: -43.6113754, longitude: -22.9133771, status: 'available', visits: 0 },
  { id: '7', number: 7, name: 'Território 7', group: 'Vilar Guanabara', type: 'residential', address: 'Vilar Guanabara', latitude: -43.6140124, longitude: -22.9148588, status: 'available', visits: 0 },
  { id: '8', number: 8, name: 'Território 8', group: 'Vilar Guanabara', type: 'residential', address: 'Vilar Guanabara', latitude: -43.6139855, longitude: -22.9141028, status: 'available', visits: 0 },
  { id: '9', number: 9, name: 'Território 9', group: 'Vilar Guanabara', type: 'residential', address: 'Vilar Guanabara', latitude: -43.6132399, longitude: -22.9148637, status: 'available', visits: 0 },
  { id: '10', number: 10, name: 'Território 10', group: 'Vilar Guanabara', type: 'residential', address: 'Vilar Guanabara', latitude: -43.612524, longitude: -22.9148145, status: 'available', visits: 0 },
  { id: '11', number: 11, name: 'Território 11', group: 'Vilar Guanabara', type: 'residential', address: 'Vilar Guanabara', latitude: -43.6117301, longitude: -22.914938, status: 'available', visits: 0 },
  { id: '12', number: 12, name: 'Território 12', group: 'Vilar Guanabara', type: 'residential', address: 'Vilar Guanabara', latitude: -43.610937, longitude: -22.9149205, status: 'available', visits: 0 },
  { id: '13', number: 13, name: 'Território 13', group: 'Vilar Guanabara', type: 'residential', address: 'Vilar Guanabara', latitude: -43.6095306, longitude: -22.9148886, status: 'available', visits: 0 },
  { id: '14', number: 14, name: 'Território 14', group: 'Vilar Guanabara', type: 'residential', address: 'Vilar Guanabara', latitude: -43.6108717, longitude: -22.9141622, status: 'available', visits: 0 },
  { id: '15', number: 15, name: 'Território 15', group: 'Vilar Guanabara', type: 'residential', address: 'Vilar Guanabara', latitude: -43.6108297, longitude: -22.9134728, status: 'available', visits: 0 },
  { id: '16', number: 16, name: 'Território 16', group: 'Vilar Guanabara', type: 'residential', address: 'Vilar Guanabara', latitude: -43.6094859, longitude: -22.9134624, status: 'available', visits: 0 },
  { id: '17', number: 17, name: 'Território 17', group: 'Vilar Guanabara', type: 'residential', address: 'Vilar Guanabara', latitude: -43.6100295, longitude: -22.9135594, status: 'available', visits: 0 },
  { id: '18', number: 18, name: 'Território 18', group: 'Vilar Guanabara', type: 'residential', address: 'Vilar Guanabara', latitude: -43.610642, longitude: -22.9134827, status: 'available', visits: 0 },
  { id: '19', number: 19, name: 'Território 19', group: 'Vilar Guanabara', type: 'residential', address: 'Vilar Guanabara', latitude: -43.6102387, longitude: -22.9126898, status: 'available', visits: 0 },
  { id: '20', number: 20, name: 'Território 20', group: 'Vilar Guanabara', type: 'residential', address: 'Vilar Guanabara', latitude: -43.6094824, longitude: -22.912759, status: 'available', visits: 0 },
  // ... continuar com todos os 64
];

export const groups = ['Vilar Guanabara'];

export const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    available: 'Disponível',
    assigned: 'Designado',
    in_progress: 'Em Andamento',
    completed: 'Concluído'
  };
  return map[status] || status;
};

export const getStatusBadge = (status: string) => {
  const map: Record<string, string> = {
    available: 'badge-green',
    assigned: 'badge-yellow',
    in_progress: 'badge-blue',
    completed: 'badge-purple'
  };
  return map[status] || 'badge-gray';
};

export const getTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    residential: 'Residencial',
    commercial: 'Comercial',
    mixed: 'Misto',
    condominium: 'Condomínio'
  };
  return map[type] || type;
};