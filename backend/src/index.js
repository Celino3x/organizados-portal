const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Importar rotas
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ============================================
// ROTAS DIRETAS
// ============================================

// Rota raiz
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Portal Organizados API',
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

// Rota de saúde
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Portal Organizados API - Rodando!',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado'
  });
});

// ============================================
// ROTA DE REGISTRO
// ============================================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, congregation, phone } = req.body;
    
    // Validação básica
    if (!name || !email || !password || !congregation) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nome, email, senha e congregação são obrigatórios' 
      });
    }

    // Verificar se o modelo User existe
    let User;
    try {
      User = require('./models/User');
    } catch (e) {
      // Se o modelo não existir, retorna sucesso simulado
      return res.status(201).json({ 
        success: true, 
        message: 'Usuário criado com sucesso (modo simulado - sem banco)!',
        data: { name, email, congregation }
      });
    }

    // Verificar se usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'E-mail já cadastrado'
      });
    }

    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      congregation,
      phone: phone || null
    });

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        congregation: user.congregation
      }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao registrar usuário: ' + error.message 
    });
  }
});

// ============================================
// ROTA DE LOGIN
// ============================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    // Credenciais de teste para desenvolvimento
    if (email === 'admin@organizados.com' && password === 'Admin@123') {
      return res.json({
        success: true,
        token: 'token_simulado_' + Date.now(),
        user: {
          id: '123',
          name: 'Admin Teste',
          email: 'admin@organizados.com',
          congregation: 'Vilar Guanabara',
          role: 'admin'
        }
      });
    }

    // Tenta buscar no banco
    let User;
    try {
      User = require('./models/User');
    } catch (e) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'organizados_secret',
      { expiresIn: '7d' }
    );

    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        congregation: user.congregation
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer login: ' + error.message
    });
  }
});

// ============================================
// ROTA DE PERFIL
// ============================================
app.get('/api/auth/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      });
    }

    // Token simulado para desenvolvimento
    if (token.startsWith('token_simulado_')) {
      return res.json({
        success: true,
        user: {
          id: '123',
          name: 'Admin Teste',
          email: 'admin@organizados.com',
          congregation: 'Vilar Guanabara',
          role: 'admin'
        }
      });
    }

    let User;
    try {
      User = require('./models/User');
    } catch (e) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'organizados_secret');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
});

// ============================================
// ROTAS DE USUÁRIOS (CRUD)
// ============================================
app.use('/api/users', userRoutes);

// ============================================
// CONEXÃO COM MONGODB
// ============================================
console.log('🔄 Tentando conectar ao MongoDB...');
console.log(`📡 URI: ${process.env.MONGODB_URI ? process.env.MONGODB_URI.replace(/:[^:]*@/, ':****@') : 'NÃO DEFINIDA'}`);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado ao MongoDB com sucesso!');
    console.log(`📊 Banco de dados: ${mongoose.connection.db.databaseName}`);
  })
  .catch((err) => {
    console.error('❌ Erro ao conectar ao MongoDB:', err.message);
    console.log('⚠️ O servidor vai rodar mesmo sem MongoDB (modo limitado)');
  });

// ============================================
// INICIAR SERVIDOR
// ============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📍 Registro: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`📍 Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`📍 Usuários: GET/POST http://localhost:${PORT}/api/users`);
  console.log(`\n📝 Credenciais de teste:`);
  console.log(`   Email: admin@organizados.com`);
  console.log(`   Senha: Admin@123\n`);
});