// Arquivo de polígonos - versão com dados mockados para visualização
// Os polígonos reais serão carregados do KML posteriormente

export interface TerritoryPolygon {
  number: number;
  name: string;
  polygonPoints: [number, number][];
  borders?: {
    north: string;
    south: string;
    east: string;
    west: string;
  };
}

// Função para gerar polígono mockado baseado nas coordenadas
const generateMockPolygon = (lat: number, lng: number): [number, number][] => {
  const offset = 0.0015;
  return [
    [lng + offset, lat - offset],
    [lng + offset, lat + offset],
    [lng - offset, lat + offset],
    [lng - offset, lat - offset],
    [lng + offset, lat - offset]
  ];
};

// Dados mockados dos polígonos para cada território
export const territoryPolygons: TerritoryPolygon[] = [];

// Função para obter polígonos por número
export const getPolygonByNumber = (number: number): TerritoryPolygon | null => {
  // Busca nos dados existentes
  const found = territoryPolygons.find(p => p.number === number);
  if (found) return found;
  return null;
};

// Função principal para obter o polígono no formato do Leaflet
export const getLeafletPolygon = (number: number): [number, number][] | null => {
  // Primeiro tenta buscar nos dados existentes
  const polygon = getPolygonByNumber(number);
  if (polygon) return polygon.polygonPoints;
  
  // Se não encontrar, gera um polígono mockado baseado no território
  try {
    // Importar territories dinamicamente para evitar dependência circular
    const { territories } = require('./territories');
    const territory = territories.find((t: any) => t.number === number);
    if (!territory) return null;
    
    // Gerar polígono mockado baseado nas coordenadas do território
    console.log(`📐 Gerando polígono mockado para território ${number}`);
    return generateMockPolygon(territory.longitude, territory.latitude);
  } catch (error) {
    console.error('❌ Erro ao gerar polígono mockado:', error);
    return null;
  }
};

export default territoryPolygons;