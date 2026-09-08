// backend/src/services/rtf-parser.js

class RTFParser {
  constructor() {
    this.sectionPatterns = [
      { 
        patterns: ['TESOUROS DA PALAVRA DE DEUS', 'TESOUROS'],
        name: 'Tesouros da Palavra de Deus'
      },
      { 
        patterns: ['FAÇA SEU MELHOR NO MINISTÉRIO', 'FACA SEU MELHOR NO MINISTERIO', 'MINISTÉRIO', 'MINISTERIO'],
        name: 'Faça seu melhor no ministério'
      },
      { 
        patterns: ['NOSSA VIDA CRISTÃ', 'NOSSA VIDA CRISTA'],
        name: 'Nossa vida cristã'
      }
    ];
    
    this.months = {
      'JANEIRO': 1, 'FEVEREIRO': 2, 'MARÇO': 3, 'ABRIL': 4,
      'MAIO': 5, 'JUNHO': 6, 'JULHO': 7, 'AGOSTO': 8,
      'SETEMBRO': 9, 'OUTUBRO': 10, 'NOVEMBRO': 11, 'DEZEMBRO': 12
    };
  }

  /**
   * Parse o conteúdo RTF
   */
  parseRTF(rtfContent) {
    const text = this.rtfToText(rtfContent);
    
    console.log('📄 === INÍCIO PARSE RTF ===');
    console.log(`📄 Tamanho do texto: ${text.length} caracteres`);
    console.log('📄 Primeiros 1000 caracteres:');
    console.log(text.substring(0, 1000));
    console.log('📄 Últimos 500 caracteres:');
    console.log(text.substring(Math.max(0, text.length - 500)));
    
    // Extrair data (como string)
    const dateString = this.extractSemanaTextual(text);
    console.log(`📅 Semana textual encontrada: "${dateString}"`);
    
    // Converter para objeto Date
    let dateObj = null;
    if (dateString) {
      dateObj = this.parseDateString(dateString);
      console.log(`📅 Data convertida: ${dateObj ? dateObj.toISOString() : 'null'}`);
    }
    
    if (!dateObj) {
      // Tentar encontrar data no formato "28 DE SETEMBRO - 4 DE OUTUBRO" de forma mais flexível
      console.log('⚠️ Tentando encontrar data com padrão alternativo...');
      const altDate = this.extractDateAlternative(text);
      if (altDate) {
        dateObj = altDate;
        console.log(`📅 Data alternativa encontrada: ${dateObj.toISOString()}`);
      }
    }
    
    if (!dateObj) {
      dateObj = new Date();
      console.log('⚠️ Nenhuma data encontrada, usando data atual');
    }
    console.log(`📅 Data final: ${dateObj.toISOString()}`);

    // Extrair cânticos
    const songs = this.extractCanticos(text);
    console.log(`🎵 Cânticos: abertura=${songs.abertura}, meio=${songs.meio}, final=${songs.final}`);

    // Detectar blocos
    const blocks = this.detectBlocks(text);
    console.log(`📂 Blocos encontrados: ${Object.keys(blocks).join(', ')}`);
    
    // Extrair partes
    const sections = [];
    for (const [sectionName, blockLines] of Object.entries(blocks)) {
      const parts = this.extractPartsFromBlock(blockLines, sectionName);
      if (parts.length > 0) {
        console.log(`📂 Seção ${sectionName}: ${parts.length} partes encontradas`);
        const section = {
          name: this.getSectionDisplayName(sectionName),
          parts: parts.map(p => ({
            number: p.numero.toString(),
            name: p.tema,
            time: p.minutos ? `${p.minutos} min` : null,
            speaker: null,
            assistant: null
          })),
          song: sectionName === 'CRISTA' ? songs.final : 
                sectionName === 'MINISTERIO' ? songs.meio : 
                songs.abertura
        };
        sections.push(section);
      }
    }

    // Fallback: partes soltas
    if (sections.length === 0) {
      console.log('⚠️ Nenhuma seção encontrada, tentando detectar partes soltas...');
      const looseParts = this.extractLooseParts(text);
      if (looseParts.length > 0) {
        sections.push({
          name: 'Tesouros da Palavra de Deus',
          parts: looseParts.map(p => ({
            number: p.numero.toString(),
            name: p.tema,
            time: p.minutos ? `${p.minutos} min` : null,
            speaker: null,
            assistant: null
          })),
          song: songs.abertura
        });
        console.log(`📌 ${looseParts.length} partes soltas encontradas`);
      }
    }

    console.log('📊 === RESUMO ===');
    console.log(`  📅 Data: ${dateObj.toISOString()}`);
    console.log(`  📂 Seções: ${sections.length}`);
    sections.forEach(s => {
      console.log(`    - ${s.name}: ${s.parts.length} partes`);
    });

    return {
      date: dateObj,
      meetingType: 'midweek',
      sections: sections,
      songs: songs
    };
  }

  /**
   * Converter RTF para texto
   */
  rtfToText(rtf) {
    let s = rtf;
    s = s.replace(/\\par[d]?/gi, '\n');
    s = s.replace(/\\u(-?\d+)\??/g, (match, code) => {
      const num = parseInt(code);
      return String.fromCharCode(num < 0 ? num + 65536 : num);
    });
    s = s.replace(/\\'([0-9a-fA-F]{2})/g, (match, hex) => {
      try {
        return Buffer.from(hex, 'hex').toString('latin1');
      } catch {
        return '';
      }
    });
    s = s.replace(/\\[a-zA-Z]+-?\d*/g, '');
    s = s.replace(/[{}]/g, '');
    s = s.replace(/[ \t]+\n/g, '\n');
    s = s.replace(/\n{3,}/g, '\n\n');
    return s.trim();
  }

  /**
   * Extrair semana textual
   */
  extractSemanaTextual(text) {
    const normalized = text.replace(/\s+/g, ' ');
    
    console.log('🔍 Procurando data com padrão 1: /(\\d{1,2})\\s*(?:a|–|-)\\s*(\\d{1,2})\\s+de\\s+([a-zçãéíóú]+)/i');
    const match1 = normalized.match(/(\d{1,2})\s*(?:a|–|-)\s*(\d{1,2})\s+de\s+([a-zçãéíóú]+)/i);
    if (match1) {
      console.log(`✅ Padrão 1 encontrado: ${match1[1]}–${match1[2]} DE ${match1[3].toUpperCase()}`);
      return `${match1[1]}–${match1[2]} DE ${match1[3].toUpperCase()}`;
    }
    
    console.log('🔍 Procurando data com padrão 2: /(\\d{1,2})\\s+de\\s+([a-zçãéíóú]+)\\s*(?:–|-)\\s*(\\d{1,2})\\s+de\\s+([a-zçãéíóú]+)/i');
    const match2 = normalized.match(/(\d{1,2})\s+de\s+([a-zçãéíóú]+)\s*(?:–|-)\s*(\d{1,2})\s+de\s+([a-zçãéíóú]+)/i);
    if (match2) {
      console.log(`✅ Padrão 2 encontrado: ${match2[1]} DE ${match2[2].toUpperCase()}–${match2[3]} DE ${match2[4].toUpperCase()}`);
      return `${match2[1]} DE ${match2[2].toUpperCase()}–${match2[3]} DE ${match2[4].toUpperCase()}`;
    }
    
    console.log('❌ Nenhum padrão de data encontrado');
    return null;
  }

  /**
   * Extrair data alternativa - mais flexível
   */
  extractDateAlternative(text) {
    // Procurar por padrões de data mais flexíveis
    const patterns = [
      // "28 DE SETEMBRO"
      /(\d{1,2})\s+DE\s+([A-ZÇÃÉÍÓÚ]{3,})/i,
      // "SETEMBRO 28"
      /([A-ZÇÃÉÍÓÚ]{3,})\s+(\d{1,2})/i,
      // "28/09" ou "28-09"
      /(\d{1,2})[\/\-](\d{1,2})/
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        console.log(`✅ Padrão alternativo encontrado: ${match[0]}`);
        if (pattern === patterns[0]) {
          const day = parseInt(match[1]);
          const monthName = match[2].toUpperCase();
          const month = this.months[monthName];
          if (month) {
            const year = new Date().getFullYear();
            const date = new Date(year, month - 1, day);
            if (date > new Date()) {
              date.setFullYear(year - 1);
            }
            return date;
          }
        } else if (pattern === patterns[1]) {
          const monthName = match[1].toUpperCase();
          const day = parseInt(match[2]);
          const month = this.months[monthName];
          if (month) {
            const year = new Date().getFullYear();
            const date = new Date(year, month - 1, day);
            if (date > new Date()) {
              date.setFullYear(year - 1);
            }
            return date;
          }
        } else if (pattern === patterns[2]) {
          const day = parseInt(match[1]);
          const month = parseInt(match[2]);
          if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
            const year = new Date().getFullYear();
            const date = new Date(year, month - 1, day);
            if (date > new Date()) {
              date.setFullYear(year - 1);
            }
            return date;
          }
        }
      }
    }
    
    return null;
  }

  /**
   * Converter string de data para objeto Date
   */
  parseDateString(dateStr) {
    console.log(`🔍 Parseando data: "${dateStr}"`);
    
    // Exemplo: "28–29 DE SETEMBRO"
    const match1 = dateStr.match(/(\d{1,2})[–\-](\d{1,2})\s+DE\s+([A-ZÇÃÉÍÓÚ]+)/i);
    if (match1) {
      const day = parseInt(match1[1]);
      const monthName = match1[3].toUpperCase();
      const month = this.months[monthName];
      if (month) {
        const year = new Date().getFullYear();
        const date = new Date(year, month - 1, day);
        if (date > new Date()) {
          date.setFullYear(year - 1);
        }
        console.log(`✅ Data parseada: ${date.toISOString()}`);
        return date;
      }
    }
    
    // Exemplo: "28 DE SETEMBRO–4 DE OUTUBRO"
    const match2 = dateStr.match(/(\d{1,2})\s+DE\s+([A-ZÇÃÉÍÓÚ]+)/i);
    if (match2) {
      const day = parseInt(match2[1]);
      const monthName = match2[2].toUpperCase();
      const month = this.months[monthName];
      if (month) {
        const year = new Date().getFullYear();
        const date = new Date(year, month - 1, day);
        if (date > new Date()) {
          date.setFullYear(year - 1);
        }
        console.log(`✅ Data parseada: ${date.toISOString()}`);
        return date;
      }
    }
    
    console.log('❌ Falha ao parsear data');
    return null;
  }

  /**
   * Extrair cânticos
   */
  extractCanticos(text) {
    const matches = text.match(/C[âa]ntico\s*(\d{1,3})/gi);
    const numbers = [];
    if (matches) {
      for (const m of matches) {
        const num = m.match(/\d+/);
        if (num) numbers.push(parseInt(num[0]));
      }
    }
    return {
      abertura: numbers[0] || null,
      meio: numbers[1] || null,
      final: numbers[2] || null
    };
  }

  /**
   * Detectar blocos
   */
  detectBlocks(text) {
    const lines = text.split('\n').map(l => l.trim());
    const upperLines = lines.map(l => this.removeAccents(l.toUpperCase()));
    
    let iTes = -1, iMin = -1, iCri = -1;
    
    for (let i = 0; i < upperLines.length; i++) {
      const line = upperLines[i];
      if (iTes === -1 && (line.includes('TESOUROS DA PALAVRA DE DEUS') || line.includes('TESOUROS'))) {
        iTes = i;
      }
      if (iMin === -1 && (line.includes('FACA SEU MELHOR NO MINISTERIO') || line.includes('FAÇA SEU MELHOR NO MINISTÉRIO') || line.includes('MINISTERIO'))) {
        iMin = i;
      }
      if (iCri === -1 && (line.includes('NOSSA VIDA CRISTA') || line.includes('NOSSA VIDA CRISTÃ'))) {
        iCri = i;
      }
    }
    
    const L = lines.length;
    const blocks = {};
    
    if (iTes !== -1) {
      blocks['TESOUROS'] = lines.slice(iTes, (iMin !== -1 ? iMin : (iCri !== -1 ? iCri : L)));
    }
    if (iMin !== -1) {
      blocks['MINISTERIO'] = lines.slice(iMin, (iCri !== -1 ? iCri : L));
    }
    if (iCri !== -1) {
      blocks['CRISTA'] = lines.slice(iCri);
    }
    
    if (Object.keys(blocks).length === 0) {
      const hasParts = lines.some(l => /^\s*\d+\./.test(l));
      if (hasParts) {
        blocks['TESOUROS'] = lines;
      }
    }
    
    return blocks;
  }

  /**
   * Extrair partes de um bloco
   */
  extractPartsFromBlock(lines, sectionName) {
    const parts = [];
    let ordem = 1;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      const match = trimmed.match(/^\s*(\d+)\.\s+(.+?)\s*\((\d{1,2})\s*min\)/i);
      if (match) {
        parts.push({
          secao: sectionName,
          ordem: ordem++,
          numero: parseInt(match[1]),
          tema: match[2].trim(),
          minutos: parseInt(match[3])
        });
      }
    }
    
    return parts;
  }

  /**
   * Extrair partes soltas
   */
  extractLooseParts(text) {
    const lines = text.split('\n').map(l => l.trim());
    const parts = [];
    let ordem = 1;
    
    for (const line of lines) {
      if (!line) continue;
      
      let match = line.match(/^\s*(\d+)\.\s+(.+?)\s*\((\d{1,2})\s*min\)/i);
      if (match) {
        parts.push({
          secao: 'TESOUROS',
          ordem: ordem++,
          numero: parseInt(match[1]),
          tema: match[2].trim(),
          minutos: parseInt(match[3])
        });
        continue;
      }
      
      match = line.match(/^\s*(\d+)\.\s+(.+?)$/i);
      if (match && !match[1].match(/^\d+$/)) {
        parts.push({
          secao: 'TESOUROS',
          ordem: ordem++,
          numero: parseInt(match[1]),
          tema: match[2].trim(),
          minutos: null
        });
      }
    }
    
    return parts;
  }

  /**
   * Remover acentos
   */
  removeAccents(str) {
    const accents = {
      'Á': 'A', 'À': 'A', 'Â': 'A', 'Ã': 'A', 'Ä': 'A',
      'É': 'E', 'È': 'E', 'Ê': 'E', 'Ë': 'E',
      'Í': 'I', 'Ì': 'I', 'Î': 'I', 'Ï': 'I',
      'Ó': 'O', 'Ò': 'O', 'Ô': 'O', 'Õ': 'O', 'Ö': 'O',
      'Ú': 'U', 'Ù': 'U', 'Û': 'U', 'Ü': 'U',
      'Ç': 'C',
      'á': 'a', 'à': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a',
      'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
      'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
      'ó': 'o', 'ò': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o',
      'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
      'ç': 'c'
    };
    return str.replace(/[ÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇáàâãäéèêëíìîïóòôõöúùûüç]/g, 
      match => accents[match] || match);
  }

  /**
   * Obter nome da seção
   */
  getSectionDisplayName(sectionKey) {
    const map = {
      'TESOUROS': 'Tesouros da Palavra de Deus',
      'MINISTERIO': 'Faça seu melhor no ministério',
      'CRISTA': 'Nossa vida cristã'
    };
    return map[sectionKey] || sectionKey;
  }
}

module.exports = RTFParser;