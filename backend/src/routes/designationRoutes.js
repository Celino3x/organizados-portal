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
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
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
    const rtfContent = req.file.buffer.toString('utf-8');
    const parsedData = parser.parseRTF(rtfContent);

    console.log('📊 Dados extraídos:', {
      date: parsedData.date,
      sections: parsedData.sections.length
    });

    // Salvar no banco
    const designs = [];
    let order = 0;

    for (const section of parsedData.sections) {
      for (const part of section.parts) {
        // Verificar se já existe designação para esta parte na mesma data
        const existing = await prisma.meetingDesignation.findFirst({
          where: {
            date: parsedData.date,
            section: section.name,
            partNumber: part.number
          }
        });

        if (existing) {
          // Atualizar existente
          const updated = await prisma.meetingDesignation.update({
            where: { id: existing.id },
            data: {
              partName: part.name,
              speaker: part.speaker || '',
              assistant: part.assistant || null,
              time: part.time || null,
              song: section.song || null,
              order: order++
            }
          });
          designs.push(updated);
        } else {
          // Criar novo
          const created = await prisma.meetingDesignation.create({
            data: {
              date: parsedData.date,
              meetingType: parsedData.meetingType,
              section: section.name,
              partNumber: part.number,
              partName: part.name,
              speaker: part.speaker || '',
              assistant: part.assistant || null,
              time: part.time || null,
              song: section.song || null,
              order: order++
            }
          });
          designs.push(created);
        }
      }
    }

    res.json({
      message: 'Designações importadas com sucesso',
      count: designs.length,
      date: parsedData.date,
      designs
    });

  } catch (error) {
    console.error('❌ Erro ao importar RTF:', error);
    res.status(500).json({ error: 'Erro ao importar arquivo: ' + error.message });
  }
});

// Listar designações por data
router.get('/by-date/:date', async (req, res) => {
  try {
    const date = new Date(req.params.date);
    
    // Criar range de datas (início e fim do dia)
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

    res.json(designs);
  } catch (error) {
    console.error('❌ Erro ao buscar designações:', error);
    res.status(500).json({ error: 'Erro ao buscar designações' });
  }
});

// Criar designação manualmente
router.post('/', async (req, res) => {
  try {
    const { date, meetingType, section, partNumber, partName, speaker, assistant, time, song, order } = req.body;

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
        song: song || null,
        order: order || 0
      }
    });

    res.status(201).json(designation);
  } catch (error) {
    console.error('❌ Erro ao criar designação:', error);
    res.status(500).json({ error: 'Erro ao criar designação' });
  }
});

// Atualizar designação
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { partName, speaker, assistant, time, song, order } = req.body;

    const designation = await prisma.meetingDesignation.update({
      where: { id: parseInt(id) },
      data: {
        partName,
        speaker,
        assistant: assistant || null,
        time: time || null,
        song: song || null,
        order: order || 0
      }
    });

    res.json(designation);
  } catch (error) {
    console.error('❌ Erro ao atualizar designação:', error);
    res.status(500).json({ error: 'Erro ao atualizar designação' });
  }
});

// Excluir designação
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.meetingDesignation.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Designação excluída com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao excluir designação:', error);
    res.status(500).json({ error: 'Erro ao excluir designação' });
  }
});

// Listar designações por mês
router.get('/by-month/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);

    const designs = await prisma.meetingDesignation.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'asc' }
    });

    res.json(designs);
  } catch (error) {
    console.error('❌ Erro ao buscar designações por mês:', error);
    res.status(500).json({ error: 'Erro ao buscar designações' });
  }
});

module.exports = router;