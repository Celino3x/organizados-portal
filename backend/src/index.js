const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'organizados_secret_key';

// ============================================
// CONFIGURAÇÃO CORS ATUALIZADA
// ============================================
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5000',
  'https://organizados-portal.vercel.app',
  'https://organizados-portal.vercel.app/',
  'https://organizados-portal.onrender.com',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ Origem bloqueada pelo CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

console.log('🔥 Servidor iniciando...');
console.log('📋 Origens permitidas:', allowedOrigins);

// ============================================
// ROTA DE TESTE
// ============================================
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando!' });
});

// ============================================
// ROTAS DE AUTENTICAÇÃO
// ============================================

// Registrar usuário
app.post('/api/auth/register', async (req, res) => {
  console.log('📝 POST /api/auth/register');
  console.log('Body recebido:', req.body);
  
  try {
    const { name, email, password, congregation } = req.body;

    if (!name || !email || !password || !congregation) {
      return res.status(400).json({ 
        error: 'Todos os campos são obrigatórios'
      });
    }

    const existingUser = await prisma.user.findUnique({ 
      where: { email } 
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        congregation,
        accessLevel: 'admin',
        privileges: ['publisher', 'elder']
      }
    });

    console.log('✅ Usuário criado:', user.email);

    const token = jwt.sign(
      { id: user.id, email: user.email, accessLevel: user.accessLevel },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        accessLevel: user.accessLevel,
        privileges: user.privileges
      }
    });
  } catch (error) {
    console.error('❌ Erro no registro:', error);
    res.status(500).json({ error: 'Erro ao criar usuário: ' + error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  console.log('🔑 POST /api/auth/login');
  console.log('Email:', req.body.email);
  
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const user = await prisma.user.findUnique({ 
      where: { email } 
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, accessLevel: user.accessLevel },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Login bem-sucedido:', email);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        accessLevel: user.accessLevel,
        privileges: user.privileges
      }
    });
  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Verificação de Token
app.get('/api/auth/verify', async (req, res) => {
  console.log('🔍 GET /api/auth/verify');
  
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      console.log('❌ Token não fornecido');
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token decodificado:', decoded.email);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        accessLevel: true,
        privileges: true,
        isActive: true
      }
    });

    if (!user) {
      console.log('❌ Usuário não encontrado');
      return res.status(401).json({ error: 'Usuário inválido' });
    }

    if (!user.isActive) {
      console.log('❌ Usuário inativo');
      return res.status(401).json({ error: 'Usuário inativo' });
    }

    console.log('✅ Token válido para:', user.email);
    res.json({ valid: true, user });
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
});

// ============================================
// ROTAS DE USUÁRIOS (CONGREGAÇÃO)
// ============================================

// Middleware de autenticação
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Middleware de autorização (apenas admin)
const authorizeAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  if (req.user.accessLevel !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }

  next();
};

// Listar todos os usuários
app.get('/api/users', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        congregation: true,
        phone: true,
        gender: true,
        accessLevel: true,
        privileges: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { name: 'asc' }
    });
    res.json(users);
  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
});

// Buscar usuário por ID
app.get('/api/users/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        name: true,
        email: true,
        congregation: true,
        phone: true,
        gender: true,
        accessLevel: true,
        privileges: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('❌ Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

// Criar usuário
app.post('/api/users', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      congregation, 
      phone, 
      gender, 
      accessLevel, 
      privileges,
      isActive 
    } = req.body;

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Validar privilégios para mulheres
    if (gender === 'female') {
      const invalidPrivileges = ['ministerial', 'elder'];
      const hasInvalid = privileges.some(p => invalidPrivileges.includes(p));
      if (hasInvalid) {
        return res.status(400).json({ 
          error: 'Mulheres não podem ser designadas como Servos Ministeriais ou Anciãos' 
        });
      }
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        congregation,
        phone: phone || null,
        gender: gender || 'male',
        accessLevel: accessLevel || 'viewer',
        privileges: privileges || ['publisher'],
        isActive: isActive !== undefined ? isActive : true
      }
    });

    // Remover senha da resposta
    const { password: _, ...userWithoutPassword } = user;
    console.log('✅ Usuário criado pelo admin:', user.email);
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário: ' + error.message });
  }
});

// Atualizar usuário
app.put('/api/users/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      email, 
      password, 
      congregation, 
      phone, 
      gender, 
      accessLevel, 
      privileges,
      isActive 
    } = req.body;

    // Verificar se usuário existe
    const existingUser = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!existingUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar se email já está em uso por outro usuário
    if (email && email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } });
      if (emailTaken) {
        return res.status(400).json({ error: 'Email já está em uso' });
      }
    }

    // Validar privilégios para mulheres
    const userGender = gender || existingUser.gender;
    if (userGender === 'female') {
      const invalidPrivileges = ['ministerial', 'elder'];
      const hasInvalid = (privileges || existingUser.privileges).some(p => invalidPrivileges.includes(p));
      if (hasInvalid) {
        return res.status(400).json({ 
          error: 'Mulheres não podem ser designadas como Servos Ministeriais ou Anciãos' 
        });
      }
    }

    // Preparar dados para atualização
    const updateData = {
      name: name || existingUser.name,
      email: email || existingUser.email,
      congregation: congregation || existingUser.congregation,
      phone: phone !== undefined ? phone : existingUser.phone,
      gender: gender || existingUser.gender,
      accessLevel: accessLevel || existingUser.accessLevel,
      privileges: privileges || existingUser.privileges,
      isActive: isActive !== undefined ? isActive : existingUser.isActive
    };

    // Atualizar senha se fornecida
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: updateData
    });

    // Remover senha da resposta
    const { password: _, ...userWithoutPassword } = user;
    console.log('✅ Usuário atualizado:', user.email);
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('❌ Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário: ' + error.message });
  }
});

// Excluir usuário
app.delete('/api/users/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    await prisma.user.delete({ where: { id: Number(id) } });
    console.log('✅ Usuário excluído:', user.email);
    res.json({ message: 'Usuário excluído com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao excluir usuário:', error);
    res.status(500).json({ error: 'Erro ao excluir usuário' });
  }
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================

console.log('📋 Rotas registradas:');
console.log('  GET  /api/test');
console.log('  GET  /api/health');
console.log('  POST /api/auth/register');
console.log('  POST /api/auth/login');
console.log('  GET  /api/auth/verify');
console.log('  GET  /api/users');
console.log('  GET  /api/users/:id');
console.log('  POST /api/users');
console.log('  PUT  /api/users/:id');
console.log('  DELETE /api/users/:id');

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});