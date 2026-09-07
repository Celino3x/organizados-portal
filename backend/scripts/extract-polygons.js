const fs = require('fs');
const path = require('path');

// Caminho do arquivo CSV com os polígonos
const csvPath = path.join(__dirname, '../data/Mapa de Território Cong. VIlar Guanabara- Vilar Guanabara - Rio de Janeiro RJ (93435).kml.csv');

// Ler o arquivo CSV
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n').filter(line => line.trim());

// Pular cabeçalho
const data = lines.slice(1);

// Processar cada linha
const polygons = data.map((line, index) => {
  // Extrair o WKT (primeira coluna entre aspas)
  const match = line.match(/"POLYGON\s*\(\(([^)]+)\)\)"/);
  if (!match) return null;
  
  const wktCoords = match[1];
  
  // Converter para array de pontos [lat, lng]
  const points = wktCoords
    .split(', ')
    .map(pair => {
      const [lng, lat] = pair.split(' ').map(Number);
      return [lat, lng]; // Leaflet usa [lat, lng]
    });
  
  // Extrair o nome (segunda coluna)
  const nameMatch = line.match(/,"([^"]*)"/);
  const name = nameMatch ? nameMatch[1] : `Território ${index + 1}`;
  
  // Extrair as bordas
  const borderMatch = line.match(/,"([^"]*)","([^"]*)","([^"]*)","([^"]*)"$/);
  const borders = borderMatch ? {
    north: borderMatch[1] || '',
    south: borderMatch[2] || '',
    east: borderMatch[3] || '',
    west: borderMatch[4] || ''
  } : null;
  
  return {
    number: index + 1,
    name: name,
    polygonPoints: points,
    borders: borders
  };
}).filter(p => p !== null);

// Gerar o arquivo TypeScript
const output = `// Arquivo gerado automaticamente - POLÍGONOS REAIS DO KML
// Para usar, importe este arquivo no lugar de territories.ts

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

export const territoryPolygons: TerritoryPolygon[] = ${JSON.stringify(polygons, null, 2)};

// Função para obter polígonos por número
export const getPolygonByNumber = (number: number) => {
  return territoryPolygons.find(p => p.number === number);
};

// Função para converter para o formato do Leaflet
export const getLeafletPolygon = (number: number) => {
  const polygon = getPolygonByNumber(number);
  if (!polygon) return null;
  return polygon.polygonPoints;
};

console.log(\`✅ ${polygons.length} polígonos extraídos do KML\`);
`;

// Salvar o arquivo
const outputPath = path.join(__dirname, '../../frontend/src/data/polygons.ts');
fs.writeFileSync(outputPath, output, 'utf-8');

console.log(`✅ Arquivo gerado em: ${outputPath}`);
console.log(`📊 Total de polígonos: ${polygons.length}`);