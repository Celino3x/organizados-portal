// backend/src/services/rtf-parser.js

class RTFParser {
  constructor() {
    // Mesmo padrão do PHP
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
   * Parse o conteúdo RTF - similar ao PHP
   */
  parseRTF(rtfContent) {
    // 1. Converter RTF para texto (igual ao PHP)
    const text = this.rtfToText(rtfContent);
    
    console.log('📄 === INÍCIO PARSE RTF ===');
    console.log(`📄 Tamanho do texto: ${text.length} caracteres`);
    console.log('📄 Primeiros 500 caracteres:');
    console.log(text.substring(0, 500));
    
    // 2. Extrair dados como o PHP faz
    const result = {
      date: this.extractSemanaTextual(text),
      meetingType: 'midweek',
      sections: [],
      songs: this.extractCanticos(text)
    };
    
    console.log(`📅 Semana textual: ${result.date}`);
    console.log(`🎵 Cânticos: abertura=${result.songs.abertura}, meio=${result.songs.meio}, final=${result.songs.final}`);

    // 3. Detectar blocos (igual ao PHP)
    const blocks = this.detectBlocks(text);
    
    // 4. Extrair partes de cada bloco
    const allParts = [];
    for (const [sectionName, blockLines] of Object.entries(blocks)) {
      const parts = this.extractPartsFromBlock(blockLines, sectionName);
      allParts.push(...parts);
      
      if (parts.length > 0) {
        console.log(`📂 Seção ${sectionName}: ${parts.length} partes encontradas`);
        // Adicionar seção ao resultado
        const section = {
          name: this.getSectionDisplayName(sectionName),
          parts: parts.map(p => ({
            number: p.numero.toString(),
            name: p.tema,
            time: p.minutos ? `${p.minutos} min` : null,
            speaker: null, // Será preenchido depois se disponível
            assistant: null
          })),
          song: sectionName === 'CRISTA' ? result.songs.final : 
                sectionName === 'MINISTERIO' ? result.songs.meio : 
                result.songs.abertura
        };
        result.sections.push(section);
      }
    }
    
    // 5. Se não encontrou seções, tentar detectar partes soltas
    if (result.sections.length === 0) {
      console.log('⚠️ Nenhuma seção encontrada, tentando detectar partes soltas...');
      const looseParts = this.extractLooseParts(text);
      if (looseParts.length > 0) {
        result.sections.push({
          name: 'Tesouros da Palavra de Deus',
          parts: looseParts.map(p => ({
            number: p.numero.toString(),
            name: p.tema,
            time: p.minutos ? `${p.minutos} min` : null,
            speaker: null,
            assistant: null
          })),
          song: result.songs.abertura
        });
        console.log(`📌 ${looseParts.length} partes soltas encontradas`);
      }
    }

    // 6. Se ainda não encontrou data, usar a data atual
    if (!result.date) {
      const now = new Date();
      result.date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      console.log('⚠️ Nenhuma data encontrada, usando data atual');
    }

    console.log('📊 === RESUMO ===');
    console.log(`  📅 Data: ${result.date}`);
    console.log(`  📂 Seções: ${result.sections.length}`);
    result.sections.forEach(s => {
      console.log(`    - ${s.name}: ${s.parts.length} partes`);
    });

    return result;
  }

  /**
   * Converter RTF para texto (igual ao PHP)
   */
  rtfToText(rtf) {
    let s = rtf;
    
    // Converter \par para quebras de linha
    s = s.replace(/\\par[d]?/gi, '\n');
    
    // Converter caracteres Unicode (\uXXXX)
    s = s.replace(/\\u(-?\d+)\??/g, (match, code) => {
      const num = parseInt(code);
      return String.fromCharCode(num < 0 ? num + 65536 : num);
    });
    
    // Converter caracteres acentuados (\'XX)
    s = s.replace(/\\'([0-9a-fA-F]{2})/g, (match, hex) => {
      return Buffer.from(hex, 'hex').toString('latin1');
    });
    
    // Remover comandos RTF
    s = s.replace(/\\[a-zA-Z]+-?\d*/g, '');
    
    // Remover chaves
    s = s.replace(/[{}]/g, '');
    
    // Remover espaços excessivos
    s = s.replace(/[ \t]+\n/g, '\n');
    s = s.replace(/\n{3,}/g, '\n\n');
    
    return s.trim();
  }

  /**
   * Extrair semana textual (igual ao PHP)
   */
  extractSemanaTextual(text) {
    const normalized = text.replace(/\s+/g, ' ');
    
    // Padrão: "28 DE SETEMBRO - 4 DE OUTUBRO"
    const match1 = normalized.match(/(\d{1,2})\s*(?:a|–|-)\s*(\d{1,2})\s+de\s+([a-zçãéíóú]+)/i);
    if (match1) {
      return `${match1[1]}–${match1[2]} DE ${match1[3].toUpperCase()}`;
    }
    
    // Padrão: "28 DE SETEMBRO–4 DE OUTUBRO"
    const match2 = normalized.match(/(\d{1,2})\s+de\s+([a-zçãéíóú]+)\s*(?:–|-)\s*(\d{1,2})\s+de\s+([a-zçãéíóú]+)/i);
    if (match2) {
      return `${match2[1]} DE ${match2[2].toUpperCase()}–${match2[3]} DE ${match2[4].toUpperCase()}`;
    }
    
    return null;
  }

  /**
   * Extrair cânticos (igual ao PHP)
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
   * Detectar blocos (igual ao PHP)
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
    
    // Se nenhum bloco foi encontrado, tentar detectar partes soltas
    if (Object.keys(blocks).length === 0) {
      console.log('⚠️ Nenhum bloco encontrado, tentando detectar partes soltas...');
      // Verificar se há partes numeradas
      const hasParts = lines.some(l => /^\s*\d+\./.test(l));
      if (hasParts) {
        blocks['TESOUROS'] = lines;
      }
    }
    
    return blocks;
  }

  /**
   * Extrair partes de um bloco (igual ao PHP)
   */
  extractPartsFromBlock(lines, sectionName) {
    const parts = [];
    let ordem = 1;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      // Padrão: "1. Nome da parte (10 min)"
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
   * Extrair partes soltas (fallback)
   */
  extractLooseParts(text) {
    const lines = text.split('\n').map(l => l.trim());
    const parts = [];
    let ordem = 1;
    
    for (const line of lines) {
      if (!line) continue;
      
      // Tentar diferentes padrões
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
      
      // Tentar sem minutos
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
   * Remover acentos (igual ao PHP)
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
   * Obter nome da seção para exibição
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