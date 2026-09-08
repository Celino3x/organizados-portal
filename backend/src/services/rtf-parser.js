// backend/src/services/rtf-parser.js

class RTFParser {
  constructor() {
    this.sectionPatterns = [
      { 
        patterns: ['TESOUROS DA PALAVRA DE DEUS', 'TESOUROS', 'TESOUROS DA PALAVRA'],
        name: 'Tesouros da Palavra de Deus'
      },
      { 
        patterns: ['FAÇA SEU MELHOR NO MINISTÉRIO', 'FAÇA SEU MELHOR', 'MINISTÉRIO', 'FAÇA O SEU MELHOR'],
        name: 'Faça seu melhor no ministério'
      },
      { 
        patterns: ['NOSSA VIDA CRISTÃ', 'VIDA CRISTÃ', 'NOSSA VIDA'],
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
   * Parse o conteúdo RTF e extrai as designações
   */
  parseRTF(rtfContent) {
    // Extrair texto do RTF
    const plainText = this.extractTextFromRTF(rtfContent);
    const lines = plainText.split('\n').map(l => l.trim()).filter(l => l);

    console.log('📄 === INÍCIO DO PARSE RTF ===');
    console.log(`📄 Total de linhas extraídas: ${lines.length}`);
    console.log('📄 Primeiras 20 linhas:');
    lines.slice(0, 20).forEach((line, idx) => {
      console.log(`  ${idx + 1}: "${line}"`);
    });
    console.log('📄 Últimas 10 linhas:');
    lines.slice(-10).forEach((line, idx) => {
      console.log(`  ${lines.length - 10 + idx + 1}: "${line}"`);
    });

    const result = {
      date: null,
      meetingType: 'midweek',
      sections: []
    };

    let currentSection = null;
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const upperLine = line.toUpperCase();
      
      // Detectar data
      if (this.isDateLine(line)) {
        result.date = this.parseDate(line);
        console.log(`📅 Data encontrada: "${line}" -> ${result.date}`);
        i++;
        continue;
      }

      // Detectar seção
      const sectionMatch = this.detectSection(line);
      if (sectionMatch) {
        console.log(`📂 Seção encontrada: "${line}" -> ${sectionMatch}`);
        currentSection = {
          name: sectionMatch,
          parts: [],
          song: null
        };
        result.sections.push(currentSection);
        i++;
        continue;
      }

      // Detectar Cântico
      const songMatch = line.match(/Cântico\s+(\d+)/i);
      if (songMatch && currentSection) {
        currentSection.song = songMatch[1];
        console.log(`🎵 Cântico: ${songMatch[1]}`);
        i++;
        continue;
      }

      // Detectar parte da reunião
      const partMatch = this.detectPart(line);
      if (partMatch && currentSection) {
        console.log(`📌 Parte encontrada: ${partMatch.number}. ${partMatch.name} (${partMatch.time || 'sem tempo'})`);
        const part = {
          number: partMatch.number,
          name: partMatch.name,
          time: partMatch.time,
          speaker: null,
          assistant: null
        };

        // Procurar pelo designado nas próximas linhas
        const speakerInfo = this.findSpeaker(lines, i + 1);
        if (speakerInfo) {
          part.speaker = speakerInfo.speaker;
          part.assistant = speakerInfo.assistant;
          console.log(`  👤 Designado: ${part.speaker || 'não encontrado'}`);
          if (part.assistant) {
            console.log(`  👥 Ajudante: ${part.assistant}`);
          }
          if (speakerInfo.linesSkipped > 0) {
            i += speakerInfo.linesSkipped;
          }
        }

        currentSection.parts.push(part);
        i++;
        continue;
      }

      i++;
    }

    // Se não encontrou data, usar a data atual
    if (!result.date) {
      result.date = new Date();
      console.log('⚠️ Nenhuma data encontrada, usando data atual');
    }

    console.log('📊 === RESUMO DO PARSE ===');
    console.log(`  📅 Data: ${result.date.toISOString().split('T')[0]}`);
    console.log(`  📂 Seções encontradas: ${result.sections.length}`);
    if (result.sections.length === 0) {
      console.log('  ⚠️ NENHUMA SEÇÃO ENCONTRADA!');
      console.log('  🔍 Verifique se o texto contém:');
      console.log('     - "Tesouros da Palavra de Deus"');
      console.log('     - "Faça seu melhor no ministério"');
      console.log('     - "Nossa vida cristã"');
    }
    result.sections.forEach(s => {
      console.log(`    - ${s.name}: ${s.parts.length} partes`);
      s.parts.forEach(p => {
        console.log(`      ${p.number}. ${p.name} (${p.speaker || 'sem designado'})`);
      });
    });
    console.log('📄 === FIM DO PARSE RTF ===');

    return result;
  }

  /**
   * Extrai texto puro do RTF
   */
  extractTextFromRTF(rtf) {
    let text = rtf;
    
    // Remover cabeçalho RTF
    text = text.replace(/{\\rtf[^}]*}/i, '');
    
    // Remover comandos RTF
    text = text.replace(/\\[a-z]+(?:\s*[-]?\d+)?/g, '');
    text = text.replace(/\\'[0-9a-f]{2}/g, (match) => {
      const code = parseInt(match.substring(2), 16);
      return String.fromCharCode(code);
    });
    
    // Remover chaves
    text = text.replace(/[{}]/g, '');
    
    // Substituir quebras de linha
    text = text.replace(/\\par/g, '\n');
    text = text.replace(/\\line/g, '\n');
    text = text.replace(/\\tab/g, ' ');
    
    // Remover espaços extras e normalizar
    text = text.replace(/\s+/g, ' ');
    text = text.split('\n').map(line => line.trim()).join('\n');
    
    return text.trim();
  }

  /**
   * Verifica se a linha contém a data
   */
  isDateLine(line) {
    return line.match(/\d+\s+DE\s+\w+/i) !== null;
  }

  /**
   * Parse da data
   */
  parseDate(dateStr) {
    const parts = dateStr.split('-').map(s => s.trim());
    
    const match = parts[0].match(/(\d+)\s+DE\s+(\w+)/i);
    if (match) {
      const day = parseInt(match[1]);
      const monthName = match[2].toUpperCase();
      const month = this.months[monthName] || 1;
      const year = new Date().getFullYear();
      
      const date = new Date(year, month - 1, day);
      
      if (date > new Date()) {
        date.setFullYear(year - 1);
      }
      
      return date;
    }
    
    return new Date();
  }

  /**
   * Detecta se a linha é uma seção
   */
  detectSection(line) {
    const upperLine = line.toUpperCase();
    
    for (const pattern of this.sectionPatterns) {
      for (const p of pattern.patterns) {
        if (upperLine.includes(p)) {
          return pattern.name;
        }
      }
    }
    
    return null;
  }

  /**
   * Detecta se a linha é uma parte da reunião
   */
  detectPart(line) {
    // Padrão: "1. Nome da parte (10 min)"
    const match = line.match(/^(\d+)\.\s+(.+?)(?:\s*\((\d+)\s*min\))?\s*$/i);
    if (match) {
      return {
        number: match[1],
        name: match[2].trim(),
        time: match[3] ? `${match[3]} min` : null
      };
    }
    return null;
  }

  /**
   * Encontra o nome do designado nas próximas linhas
   */
  findSpeaker(lines, startIndex) {
    let speaker = null;
    let assistant = null;
    let linesSkipped = 0;

    for (let i = startIndex; i < Math.min(startIndex + 5, lines.length); i++) {
      const line = lines[i];
      
      if (!line) break;
      
      // Pular linhas com parte ou seção
      if (this.detectPart(line) || this.detectSection(line)) {
        break;
      }

      // Verificar se tem ajudante
      const assistantMatch = line.match(/^(.+?)\s*,\s*(.+?)(?:\s*\(ajudante\))?$/i);
      if (assistantMatch) {
        speaker = assistantMatch[1].trim();
        assistant = assistantMatch[2].trim();
        linesSkipped = 1;
        break;
      }

      // Apenas o designado
      if (line.length > 2 && !line.match(/^\d/) && !this.isDateLine(line)) {
        speaker = line.trim();
        linesSkipped = 1;
        break;
      }
    }

    return { speaker, assistant, linesSkipped };
  }
}

module.exports = RTFParser;