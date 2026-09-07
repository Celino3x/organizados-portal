// Arquivo de polígonos - versão simplificada para o build
// Os polígonos reais serão carregados do backend quando necessário

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

// Dados vazios por enquanto - serão preenchidos com os polígonos reais
export const territoryPolygons: TerritoryPolygon[] = [];

export const getPolygonByNumber = (number: number) => {
  return territoryPolygons.find(p => p.number === number) || null;
};

export const getLeafletPolygon = (number: number): [number, number][] | null => {
  const polygon = getPolygonByNumber(number);
  if (!polygon) return null;
  return polygon.polygonPoints;
};

export default territoryPolygons;