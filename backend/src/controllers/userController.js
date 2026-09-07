const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Listar todos os usuários
exports.getAllUsers = async (req, res) => {
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
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
};

// Buscar usuário por ID
exports.getUserById = async (req, res) => {
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
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
};

// Criar usuário
exports.createUser = async (req, res) => {
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
        phone,
        gender,
        accessLevel: accessLevel || 'viewer',
        privileges: privileges || ['publisher'],
        isActive: isActive !== undefined ? isActive : true
      }
    });

    // Remover senha da resposta
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
};

// Atualizar usuário
exports.updateUser = async (req, res) => {
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
    const updateData: any = {
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
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
};

// Excluir usuário (soft delete)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    await prisma.user.delete({ where: { id: Number(id) } });
    res.json({ message: 'Usuário excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ error: 'Erro ao excluir usuário' });
  }
};