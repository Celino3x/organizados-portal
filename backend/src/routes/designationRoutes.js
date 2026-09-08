const express = require('express');
const router = express.Router();
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const RTFParser = require('../services/rtf-parser');

const prisma = new PrismaClient();
const parser = new RTFParser();

// Configurar multer para upload de arquivos
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/rtf', 'text/rtf', 'application/msword'];
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.rtf')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos RTF são permitidos'));
    }
  }
});

// ============================================
// ROTAS DE DESIGNAÇÕES DE REUNIÃO
// ============================================

// Importar RTF
router.post('/import-rtf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    console.log('📄 Processando arquivo RTF...');
    console.log(`📄 Nome: ${req.file.originalname}`);
    console.log(`📄 Tamanho: ${(req.file.size / 1024).toFixed(2)} KB`);

    const rtfContent = req.file.buffer.toString('utf-8');
    const parsedData = parser.parseRTF(rtfContent);

    console.log('📊 Dados extraídos:', {
      date: parsedData.date,
      sections: parsedData.sections.length,
      totalParts: parsedData.sections.reduce((acc, s) => acc + s.parts.length, 0)
    });

    if (!parsedData.date) {
      return res.status(400).json({ 
        error: 'Não foi possível identificar a data no arquivo RTF' 
      });
    }

    if (parsedData.sections.length === 0) {
      return res.status(400).json({ 
        error: 'Nenhuma seção de reunião encontrada no arquivo' 
      });
    }

    const meetingDate = new Date(parsedData.date);
    
    if (isNaN(meetingDate.getTime())) {
      console.error('❌ Data inválida:', parsedData.date);
      return res.status(400).json({ 
        error: 'Data inválida extraída do arquivo' 
      });
    }

    console.log(`📅 Data da reunião: ${meetingDate.toISOString()}`);

    const designs = [];
    let order = 0;

    const result = await prisma.$transaction(async (tx) => {
      const startDate = new Date(meetingDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(meetingDate);
      endDate.setHours(23, 59, 59, 999);

      await tx.meetingDesignation.deleteMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate
          }
        }
      });

      const created = [];
      for (const section of parsedData.sections) {
        for (const part of section.parts) {
          const createdItem = await tx.meetingDesignation.create({
            data: {
              date: meetingDate,
              meetingType: parsedData.meetingType || 'midweek',
              section: section.name,
              partNumber: part.number,
              partName: part.name,
              speaker: part.speaker || 'Não designado',
              assistant: part.assistant || null,
              time: part.time || null,
              song: section.song ? String(section.song) : null,
              order: order++
            }
          });
          created.push(createdItem);
        }
      }
      return created;
    });

    designs.push(...result);

    res.json({
      message: 'Designações importadas com sucesso',
      count: designs.length,
      date: parsedData.date,
      sections: parsedData.sections.map(s => ({
        name: s.name,
        parts: s.parts.length,
        song: s.song
      })),
      designs
    });

  } catch (error) {
    console.error('❌ Erro ao importar RTF:', error);
    
    if (error.message === 'Apenas arquivos RTF são permitidos') {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ 
      error: 'Erro ao importar arquivo: ' + error.message 
    });
  }
});

// ============================================
// ROTAS DE SEMANAS (TEMPLATES)
// ============================================

// Listar semanas disponíveis
router.get('/weeks', async (req, res) => {
  try {
    const weeks = await prisma.weekTemplate.findMany({
      orderBy: { data_inicio: 'desc' }
    });
    res.json(weeks);
  } catch (error) {
    console.error('❌ Erro ao buscar semanas:', error);
    res.status(500).json({ error: 'Erro ao buscar semanas' });
  }
});

// Buscar semana por ID
router.get('/weeks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const week = await prisma.weekTemplate.findUnique({
      where: { id: parseInt(id) }
    });
    if (!week) {
      return res.status(404).json({ error: 'Semana não encontrada' });
    }
    res.json(week);
  } catch (error) {
    console.error('❌ Erro ao buscar semana:', error);
    res.status(500).json({ error: 'Erro ao buscar semana' });
  }
});

// ============================================
// ROTAS DE REUNIÕES
// ============================================

// Listar reuniões
router.get('/meetings', async (req, res) => {
  try {
    const { search, year, month } = req.query;
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { semana: { contains: search, mode: 'insensitive' } },
        { texto_biblia: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (year) {
      where.data_reuniao = {
        gte: new Date(parseInt(year), 0, 1),
        lt: new Date(parseInt(year) + 1, 0, 1)
      };
    }
    
    if (month) {
      const yearNum = year ? parseInt(year) : new Date().getFullYear();
      where.data_reuniao = {
        gte: new Date(yearNum, parseInt(month) - 1, 1),
        lt: new Date(yearNum, parseInt(month), 1)
      };
    }

    const meetings = await prisma.meeting.findMany({
      where,
      include: { semana: true },
      orderBy: { data_reuniao: 'desc' }
    });
    
    res.json(meetings);
  } catch (error) {
    console.error('❌ Erro ao buscar reuniões:', error);
    res.status(500).json({ error: 'Erro ao buscar reuniões' });
  }
});

// Criar reunião
router.post('/meetings', async (req, res) => {
  try {
    const { semana_id, data_reuniao, congregacao, designacoes } = req.body;
    
    const meeting = await prisma.meeting.create({
      data: {
        semana_id: parseInt(semana_id),
        data_reuniao: new Date(data_reuniao),
        congregacao,
        designacoes_json: designacoes || []
      }
    });
    
    res.status(201).json(meeting);
  } catch (error) {
    console.error('❌ Erro ao criar reunião:', error);
    res.status(500).json({ error: 'Erro ao criar reunião: ' + error.message });
  }
});

// Buscar designações de uma reunião
router.get('/meeting/:id/designations', async (req, res) => {
  try {
    const { id } = req.params;
    const meeting = await prisma.meeting.findUnique({
      where: { id: parseInt(id) },
      include: { semana: true }
    });
    
    if (!meeting) {
      return res.status(404).json({ error: 'Reunião não encontrada' });
    }
    
    const partes = meeting.semana?.partes_json || [];
    const designacoes = meeting.designacoes_json || [];
    
    const result = partes.map((parte: any) => {
      const designacao = designacoes.find((d: any) => d.parte_id === parte.id);
      return {
        ...parte,
        publicador_id: designacao?.publicador_id || null,
        publicador_nome: designacao?.publicador_nome || '',
        ajudante_id: designacao?.ajudante_id || null,
        ajudante_nome: designacao?.ajudante_nome || ''
      };
    });
    
    res.json(result);
  } catch (error) {
    console.error('❌ Erro ao buscar designações:', error);
    res.status(500).json({ error: 'Erro ao buscar designações' });
  }
});

// Salvar designações de uma reunião
router.put('/meeting/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { assignments } = req.body;
    
    const designacoes = assignments.map((a: any) => ({
      parte_id: a.id,
      publicador_id: a.publicador_id || null,
      publicador_nome: a.publicador_nome || '',
      ajudante_id: a.ajudante_id || null,
      ajudante_nome: a.ajudante_nome || ''
    }));
    
    const meeting = await prisma.meeting.update({
      where: { id: parseInt(id) },
      data: { designacoes_json: designacoes }
    });
    
    res.json({ message: 'Designações salvas com sucesso', meeting });
  } catch (error) {
    console.error('❌ Erro ao salvar designações:', error);
    res.status(500).json({ error: 'Erro ao salvar designações' });
  }
});

// Excluir reunião
router.delete('/meetings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const meeting = await prisma.meeting.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!meeting) {
      return res.status(404).json({ error: 'Reunião não encontrada' });
    }
    
    await prisma.meeting.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: 'Reunião excluída com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao excluir reunião:', error);
    res.status(500).json({ error: 'Erro ao excluir reunião' });
  }
});

// Listar designações por data
router.get('/by-date/:date', async (req, res) => {
  try {
    const date = new Date(req.params.date);
    
    if (isNaN(date.getTime())) {
      return res.status(400).json({ error: 'Data inválida' });
    }

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const designs = await prisma.meetingDesignation.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { order: 'asc' }
    });

    const grouped = designs.reduce((acc, d) => {
      if (!acc[d.section]) acc[d.section] = [];
      acc[d.section].push(d);
      return acc;
    }, {});

    res.json({
      date: date,
      total: designs.length,
      sections: Object.keys(grouped),
      grouped: grouped,
      designs: designs
    });

  } catch (error) {
    console.error('❌ Erro ao buscar designações:', error);
    res.status(500).json({ error: 'Erro ao buscar designações' });
  }
});

// Criar designação manualmente
router.post('/', async (req, res) => {
  try {
    const { 
      date, 
      meetingType, 
      section, 
      partNumber, 
      partName, 
      speaker, 
      assistant, 
      time, 
      song, 
      order 
    } = req.body;

    if (!date || !section || !partNumber || !partName || !speaker) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios: date, section, partNumber, partName, speaker' 
      });
    }

    const designation = await prisma.meetingDesignation.create({
      data: {
        date: new Date(date),
        meetingType: meetingType || 'midweek',
        section,
        partNumber,
        partName,
        speaker,
        assistant: assistant || null,
        time: time || null,
        song: song ? String(song) : null,
        order: order || 0
      }
    });

    res.status(201).json(designation);

  } catch (error) {
    console.error('❌ Erro ao criar designação:', error);
    res.status(500).json({ error: 'Erro ao criar designação: ' + error.message });
  }
});

// Atualizar designação
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { partName, speaker, assistant, time, song, order } = req.body;

    const existing = await prisma.meetingDesignation.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Designação não encontrada' });
    }

    const designation = await prisma.meetingDesignation.update({
      where: { id: parseInt(id) },
      data: {
        partName: partName || existing.partName,
        speaker: speaker || existing.speaker,
        assistant: assistant !== undefined ? assistant : existing.assistant,
        time: time || existing.time,
        song: song !== undefined && song !== null ? String(song) : existing.song,
        order: order || existing.order
      }
    });

    res.json(designation);

  } catch (error) {
    console.error('❌ Erro ao atualizar designação:', error);
    res.status(500).json({ error: 'Erro ao atualizar designação: ' + error.message });
  }
});

// Excluir designação
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.meetingDesignation.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Designação não encontrada' });
    }

    await prisma.meetingDesignation.delete({
      where: { id: parseInt(id) }
    });

    res.json({ 
      message: 'Designação excluída com sucesso',
      id: parseInt(id)
    });

  } catch (error) {
    console.error('❌ Erro ao excluir designação:', error);
    res.status(500).json({ error: 'Erro ao excluir designação: ' + error.message });
  }
});

// Listar designações por mês
router.get('/by-month/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    
    const yearNum = parseInt(year);
    const monthNum = parseInt(month) - 1;

    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 0 || monthNum > 11) {
      return res.status(400).json({ error: 'Ano ou mês inválido' });
    }

    const startDate = new Date(yearNum, monthNum, 1);
    const endDate = new Date(yearNum, monthNum + 1, 0);

    const designs = await prisma.meetingDesignation.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'asc' }
    });

    const groupedByDate = designs.reduce((acc, d) => {
      const dateKey = d.date.toISOString().split('T')[0];
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(d);
      return acc;
    }, {});

    res.json({
      year: yearNum,
      month: monthNum + 1,
      total: designs.length,
      dates: Object.keys(groupedByDate),
      groupedByDate: groupedByDate,
      designs: designs
    });

  } catch (error) {
    console.error('❌ Erro ao buscar designações por mês:', error);
    res.status(500).json({ error: 'Erro ao buscar designações' });
  }
});

// Buscar designação por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const designation = await prisma.meetingDesignation.findUnique({
      where: { id: parseInt(id) }
    });

    if (!designation) {
      return res.status(404).json({ error: 'Designação não encontrada' });
    }

    res.json(designation);

  } catch (error) {
    console.error('❌ Erro ao buscar designação:', error);
    res.status(500).json({ error: 'Erro ao buscar designação' });
  }
});

// Listar todas as datas com designações
router.get('/dates', async (req, res) => {
  try {
    const designs = await prisma.meetingDesignation.findMany({
      select: {
        date: true
      },
      distinct: ['date'],
      orderBy: { date: 'desc' }
    });

    const dates = designs.map(d => d.date.toISOString().split('T')[0]);
    
    res.json({
      count: dates.length,
      dates: dates
    });

  } catch (error) {
    console.error('❌ Erro ao listar datas:', error);
    res.status(500).json({ error: 'Erro ao listar datas' });
  }
});

// Exportar programa da reunião para JSON
router.get('/export/:date', async (req, res) => {
  try {
    const date = new Date(req.params.date);
    
    if (isNaN(date.getTime())) {
      return res.status(400).json({ error: 'Data inválida' });
    }

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const designs = await prisma.meetingDesignation.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { order: 'asc' }
    });

    const program = {
      date: date,
      meetingType: designs.length > 0 ? designs[0].meetingType : 'midweek',
      sections: designs.reduce((acc, d) => {
        if (!acc[d.section]) acc[d.section] = [];
        acc[d.section].push({
          partNumber: d.partNumber,
          partName: d.partName,
          speaker: d.speaker,
          assistant: d.assistant,
          time: d.time,
          song: d.song
        });
        return acc;
      }, {}),
      total: designs.length
    };

    res.json(program);

  } catch (error) {
    console.error('❌ Erro ao exportar programa:', error);
    res.status(500).json({ error: 'Erro ao exportar programa' });
  }
});

module.exports = router;