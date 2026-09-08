class RTFParser {
  constructor() {
    this.sections = {
      TESOUROS: 'Tesouros da Palavra de Deus',
      MINISTERIO: 'Faça seu melhor no ministério',
      VIDA_CRISTA: 'Nossa vida cristã'
    };
    
    // Mapeamento de meses
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

    const result = {
      date: null,
      meetingType: 'midweek',
      sections: []
    };

    let currentSection = null;
    let currentPart = null;
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      
      // Detectar data
      if (this.isDateLine(line)) {
        result.date = this.parseDate(line);
        i++;
        continue;
      }

      // Detectar seção
      const sectionMatch = this.detectSection(line);
      if (sectionMatch) {
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
        i++;
        continue;
      }

      // Detectar parte da reunião
      const partMatch = this.detectPart(line);
      if (partMatch && currentSection) {
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
          // Pular linhas que contêm o nome do designado
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
    }

    return result;
  }

  /**
   * Extrai texto puro do RTF
   */
  extractTextFromRTF(rtf) {
    return rtf
      // Remover comandos RTF
      .replace(/\\[a-z]+(?:\s*[-]?\d+)?/g, '')
      // Remover chaves
      .replace(/[{}]/g, '')
      // Converter caracteres acentuados
      .replace(/\\'[0-9a-f]{2}/g, (match) => {
        const code = parseInt(match.substring(2), 16);
        return String.fromCharCode(code);
      })
      // Substituir quebras de linha
      .replace(/\\par/g, '\n')
      .replace(/\\line/g, '\n')
      // Remover espaços extras
      .replace(/\s+/g, ' ')
      .trim();
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
    
    // Tentar extrair mês e dia
    const match = parts[0].match(/(\d+)\s+DE\s+(\w+)/i);
    if (match) {
      const day = parseInt(match[1]);
      const monthName = match[2].toUpperCase();
      const month = this.months[monthName] || 1;
      const year = new Date().getFullYear();
      
      // Ajustar ano se necessário
      const date = new Date(year, month - 1, day);
      
      // Se a data for no futuro, usar ano anterior
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
    const sectionNames = Object.values(this.sections);
    for (const name of sectionNames) {
      if (line.includes(name)) {
        return name;
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

    for (let i = startIndex; i < Math.min(startIndex + 4, lines.length); i++) {
      const line = lines[i];
      
      // Pular linhas vazias ou que são continuações do texto
      if (!line || this.detectPart(line) || this.detectSection(line)) {
        break;
      }

      // Verificar se tem ajudante
      // Padrões: "Nome, Nome (ajudante)" ou "Nome, Nome"
      const assistantMatch = line.match(/^(.+?)\s*,\s*(.+?)(?:\s*\(ajudante\))?$/i);
      if (assistantMatch) {
        speaker = assistantMatch[1].trim();
        assistant = assistantMatch[2].trim();
        linesSkipped = 1;
        break;
      }

      // Apenas o designado
      if (line.length > 2 && !line.match(/^\d/)) {
        speaker = line.trim();
        linesSkipped = 1;
        break;
      }
    }

    return { speaker, assistant, linesSkipped };
  }
}

module.exports = RTFParser;