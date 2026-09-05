const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Listar todos os usuários (admin pode tudo, support pode ver)
router.get('/', protect, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    
    // Verificar se é admin ou support
    if (currentUser.accessLevel !== 'admin' && currentUser.accessLevel !== 'support') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Você não tem permissão para listar usuários.'
      });
    }

    const users = await User.find({})
      .select('-password')
      .sort({ name: 1 });

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar usuários'
    });
  }
});

// Buscar um usuário por ID (qualquer usuário logado pode ver seu próprio perfil)
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar permissão: admin pode ver todos, outros apenas o próprio
    const currentUser = await User.findById(req.userId);
    if (currentUser.accessLevel !== 'admin' && req.userId !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuário'
    });
  }
});

// Criar usuário (apenas admin)
router.post('/', protect, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    if (currentUser.accessLevel !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores podem criar usuários.'
      });
    }

    const { name, email, password, accessLevel, permissions, phone, cellphone, address, birthDate, baptismDate, gender, class: userClass, privileges, congregation, group } = req.body;

    // Verificar se email já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'E-mail já cadastrado'
      });
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      accessLevel: accessLevel || 'viewer',
      permissions: permissions || {},
      phone,
      cellphone,
      address,
      birthDate: birthDate ? new Date(birthDate) : null,
      baptismDate: baptismDate ? new Date(baptismDate) : null,
      gender: gender || 'male',
      class: userClass || 'other_sheep',
      privileges: privileges || ['publisher'],
      congregation,
      group,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        accessLevel: user.accessLevel,
        permissions: user.permissions
      }
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar usuário: ' + error.message
    });
  }
});

// Atualizar usuário
router.put('/:id', protect, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    const isAdmin = currentUser.accessLevel === 'admin';
    const isSupport = currentUser.accessLevel === 'support';
    const isSelf = req.userId === req.params.id;

    // Verificar permissão
    if (!isAdmin && !isSelf) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const { name, email, phone, cellphone, address, birthDate, baptismDate, gender, class: userClass, privileges, congregation, group, accessLevel, permissions, isActive } = req.body;

    // Se for admin, pode atualizar tudo
    if (isAdmin) {
      if (accessLevel) user.accessLevel = accessLevel;
      if (permissions) user.permissions = permissions;
      if (isActive !== undefined) user.isActive = isActive;
      if (privileges) user.privileges = privileges;
      if (gender) user.gender = gender;
      if (userClass) user.class = userClass;
      if (birthDate) user.birthDate = new Date(birthDate);
      if (baptismDate) user.baptismDate = new Date(baptismDate);
    }

    // Campos que qualquer um pode atualizar (incluindo suporte)
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (cellphone !== undefined) user.cellphone = cellphone;
    if (address !== undefined) user.address = address;
    if (congregation) user.congregation = congregation;
    if (group !== undefined) user.group = group;

    await user.save();

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        accessLevel: user.accessLevel,
        permissions: user.permissions
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar usuário: ' + error.message
    });
  }
});

// Excluir usuário (apenas admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    if (currentUser.accessLevel !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores podem excluir usuários.'
      });
    }

    if (req.userId === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível excluir o próprio usuário'
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Usuário excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao excluir usuário: ' + error.message
    });
  }
});

module.exports = router;