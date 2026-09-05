export interface KMLTerritory {
  id: string;
  number: number;
  name: string;
  description?: string;
  coordinates: { lat: number; lng: number }[];
  center: { lat: number; lng: number };
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  startingPoint?: {
    lat: number;
    lng: number;
  };
  rawData?: any;
  areaKm2?: number;
  perimeterKm?: number;
  borders?: {
    north: string;
    south: string;
    east: string;
    west: string;
  };
  googleMapsUrl?: string;
}

/**
 * Parse KML string para objetos Territory com polígonos
 * Focado em extrair pontos de partida
 */
export const parseKML = (kmlString: string): KMLTerritory[] => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(kmlString, 'text/xml');
  const territories: KMLTerritory[] = [];

  const parserError = xmlDoc.querySelector('parsererror');
  if (parserError) {
    console.error('❌ Erro ao parsear KML:', parserError.textContent);
    return [];
  }

  // Buscar todos os Placemarks
  const placemarks = xmlDoc.getElementsByTagName('Placemark');
  console.log(`📄 Encontrados ${placemarks.length} placemarks no KML`);
  
  for (let i = 0; i < placemarks.length; i++) {
    const placemark = placemarks[i];
    
    // Nome do território
    const nameElement = placemark.getElementsByTagName('name')[0];
    let name = nameElement?.textContent || `Território ${i + 1}`;
    
    // Extrair número do nome
    const numberMatch = name.match(/\d+/);
    const number = numberMatch ? parseInt(numberMatch[0]) : i + 1;
    const cleanName = name.replace(/^\d+\s*[-:]?\s*/, '').trim() || name;
    
    const descElement = placemark.getElementsByTagName('description')[0];
    const description = descElement?.textContent || '';
    
    const borders = extractBorders(description);
    const areaInfo = extractArea(description);
    
    // ============================================================
    // PRIORIDADE 1: Buscar Ponto de Partida (Point)
    // ============================================================
    let startingPoint: { lat: number; lng: number } | undefined;
    let googleMapsUrl: string | undefined;
    
    // Tentar extrair URL do Google Maps da descrição
    const urlMatch = description.match(/https?:\/\/www\.google\.com\/maps\/[^\s<"]+/);
    if (urlMatch) {
      googleMapsUrl = urlMatch[0];
      console.log(`📍 URL do Google Maps encontrada para território ${number}: ${googleMapsUrl}`);
    }
    
    // Buscar Point no Placemark (prioridade máxima)
    const point = placemark.getElementsByTagName('Point')[0];
    if (point) {
      const coordsElement = point.getElementsByTagName('coordinates')[0];
      if (coordsElement) {
        const parts = coordsElement.textContent?.trim().split(',').map(Number) || [];
        if (parts.length >= 2) {
          startingPoint = { lat: parts[1], lng: parts[0] };
          console.log(`📍 PONTO DE PARTIDA do território ${number}: ${startingPoint.lat}, ${startingPoint.lng}`);
        }
      }
    }
    
    // Se não tiver Point, tentar extrair coordenadas da descrição
    if (!startingPoint) {
      const coordMatch = description.match(/([-+]?\d{1,2}\.\d+),\s*([-+]?\d{1,3}\.\d+)/);
      if (coordMatch) {
        startingPoint = { lat: parseFloat(coordMatch[1]), lng: parseFloat(coordMatch[2]) };
        console.log(`📍 Coordenadas da descrição do território ${number}: ${startingPoint.lat}, ${startingPoint.lng}`);
      }
    }
    
    // Buscar polígono (para centro e visualização)
    let polygon = placemark.getElementsByTagName('Polygon')[0];
    let coordinatesElement = polygon?.getElementsByTagName('coordinates')[0];
    
    if (!coordinatesElement) {
      const multiGeometry = placemark.getElementsByTagName('MultiGeometry')[0];
      if (multiGeometry) {
        polygon = multiGeometry.getElementsByTagName('Polygon')[0];
        coordinatesElement = polygon?.getElementsByTagName('coordinates')[0];
      }
    }
    
    if (!coordinatesElement) {
      const linearRing = placemark.getElementsByTagName('LinearRing')[0];
      if (linearRing) {
        coordinatesElement = linearRing.getElementsByTagName('coordinates')[0];
      }
    }
    
    let points: { lat: number; lng: number }[] = [];
    
    if (coordinatesElement) {
      const coordText = coordinatesElement.textContent || '';
      const coordPairs = coordText.trim().split(/\s+/);
      
      points = coordPairs
        .filter(pair => pair.trim().length > 0)
        .map(pair => {
          const parts = pair.split(',').map(Number);
          return { lat: parts[1], lng: parts[0] };
        })
        .filter(p => !isNaN(p.lat) && !isNaN(p.lng));
    }
    
    // Se não tiver polígono, usar o ponto de partida como centro
    const center = points.length > 0 
      ? calculateCenter(points) 
      : (startingPoint ? { lat: startingPoint.lat, lng: startingPoint.lng } : { lat: 0, lng: 0 });
    
    const bounds = points.length > 0 ? calculateBounds(points) : { north: 0, south: 0, east: 0, west: 0 };
    
    // Se não tiver ponto de partida mas tiver centro, usar o centro
    if (!startingPoint && points.length > 0) {
      startingPoint = { lat: center.lat, lng: center.lng };
      console.log(`📍 Usando centro como ponto de partida para território ${number}: ${center.lat}, ${center.lng}`);
    }
    
    territories.push({
      id: `territory-${number}`,
      number,
      name: cleanName,
      description,
      coordinates: points,
      center,
      bounds,
      startingPoint,
      borders,
      areaKm2: areaInfo.km2,
      perimeterKm: areaInfo.perimeter,
      googleMapsUrl,
    });
  }
  
  return territories;
};

/**
 * Extrair bordas da descrição
 */
const extractBorders = (description: string): { north: string; south: string; east: string; west: string } => {
  const borders = { north: '', south: '', east: '', west: '' };
  
  const northMatch = description.match(/BorderNorth[:：]\s*([^\n<]+)/i);
  const southMatch = description.match(/BorderSouth[:：]\s*([^\n<]+)/i);
  const eastMatch = description.match(/BorderEast[:：]\s*([^\n<]+)/i);
  const westMatch = description.match(/BorderWest[:：]\s*([^\n<]+)/i);
  
  if (northMatch) borders.north = northMatch[1].trim();
  if (southMatch) borders.south = southMatch[1].trim();
  if (eastMatch) borders.east = eastMatch[1].trim();
  if (westMatch) borders.west = westMatch[1].trim();
  
  return borders;
};

/**
 * Extrair área da descrição
 */
const extractArea = (description: string): { km2: number; perimeter: number } => {
  let km2 = 0;
  let perimeter = 0;
  
  const areaMatch = description.match(/([\d.]+)\s*km²/i);
  if (areaMatch) km2 = parseFloat(areaMatch[1]);
  
  const perimeterMatch = description.match(/([\d.]+)\s*km(?!²)/i);
  if (perimeterMatch) perimeter = parseFloat(perimeterMatch[1]);
  
  return { km2, perimeter };
};

/**
 * Calcular o centro de um polígono
 */
const calculateCenter = (points: { lat: number; lng: number }[]) => {
  const total = points.length;
  const sum = points.reduce((acc, p) => ({
    lat: acc.lat + p.lat,
    lng: acc.lng + p.lng
  }), { lat: 0, lng: 0 });
  
  return {
    lat: sum.lat / total,
    lng: sum.lng / total
  };
};

/**
 * Calcular os bounds do polígono
 */
const calculateBounds = (points: { lat: number; lng: number }[]) => {
  let north = -90, south = 90, east = -180, west = 180;
  
  points.forEach(p => {
    if (p.lat > north) north = p.lat;
    if (p.lat < south) south = p.lat;
    if (p.lng > east) east = p.lng;
    if (p.lng < west) west = p.lng;
  });
  
  return { north, south, east, west };
};

/**
 * Carregar KML a partir de uma URL (Google My Maps)
 * Usa LID específico para pontos de partida
 */
export const loadKMLFromUrl = async (url: string, useLid: boolean = true): Promise<KMLTerritory[]> => {
  try {
    let mid = '';
    let lid = '';
    
    // Extrair MID
    const midMatch = url.match(/mid=([^&]+)/);
    if (midMatch) mid = midMatch[1];
    
    // Extrair LID
    const lidMatch = url.match(/lid=([^&]+)/);
    if (lidMatch) lid = lidMatch[1];
    
    if (!mid) {
      console.error('❌ Não foi possível extrair o ID do mapa');
      return [];
    }
    
    // Construir URL do KML
    let kmlUrl = `https://www.google.com/maps/d/u/0/kml?forcekml=1&mid=${mid}`;
    
    // Adicionar LID se disponível e solicitado
    if (lid && useLid) {
      kmlUrl += `&lid=${lid}`;
      console.log(`📡 Usando LID específico para pontos de partida: ${lid}`);
    }
    
    console.log('📡 Carregando KML:', kmlUrl);
    
    const response = await fetch(kmlUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const kmlText = await response.text();
    console.log('📄 KML carregado, tamanho:', kmlText.length);
    
    // Verificar se é um NetworkLink
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlText, 'text/xml');
    const networkLink = xmlDoc.getElementsByTagName('NetworkLink')[0];
    
    if (networkLink) {
      const hrefElement = networkLink.getElementsByTagName('href')[0];
      if (hrefElement) {
        const href = hrefElement.textContent || '';
        console.log('🔗 Seguindo NetworkLink:', href);
        const response2 = await fetch(href);
        const kmlText2 = await response2.text();
        console.log('📄 KML real carregado, tamanho:', kmlText2.length);
        return parseKML(kmlText2);
      }
    }
    
    const result = parseKML(kmlText);
    console.log('✅ Territórios encontrados:', result.length);
    
    // Log dos pontos de partida encontrados
    result.forEach(t => {
      if (t.startingPoint) {
        console.log(`📍 Território ${t.number}: Ponto de partida (${t.startingPoint.lat}, ${t.startingPoint.lng})`);
      }
    });
    
    return result;
  } catch (error) {
    console.error('❌ Erro ao carregar KML:', error);
    return [];
  }
};

/**
 * Carregar pontos de partida específicos usando LID
 */
export const loadStartingPoints = async (mid: string, lid: string): Promise<KMLTerritory[]> => {
  const url = `https://www.google.com/maps/d/u/0/kml?forcekml=1&mid=${mid}&lid=${lid}`;
  return loadKMLFromUrl(url, true);
};

/**
 * Buscar um território específico por número
 */
export const findTerritoryByNumber = (territories: KMLTerritory[], number: number): KMLTerritory | undefined => {
  return territories.find(t => t.number === number);
};