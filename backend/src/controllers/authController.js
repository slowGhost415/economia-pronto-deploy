import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import prisma from '../services/prismaClient.js';

dotenv.config();

const parseRequiredString = (value) => (typeof value === 'string' ? value.trim() : '');

const isStrongPassword = (value) =>
  typeof value === 'string'
  && value.length >= 8
  && value.length <= 128
  && /[A-Za-z]/.test(value)
  && /\d/.test(value);

const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;

const signToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET nao configurado');
  }

  return jwt.sign(
    { id: user.id, nome: user.nome, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '8h' },
  );
};

export const signup = async (req, res) => {
  try {
    const nome = parseRequiredString(req.body?.nome);
    const email = parseRequiredString(req.body?.email).toLowerCase();
    const senha = parseRequiredString(req.body?.senha);

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Preencha todos os campos' });
    }

    if (nome.length > 80) {
      return res.status(400).json({ error: 'Nome muito longo' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Email invalido' });
    }

    if (!isStrongPassword(senha)) {
      return res.status(400).json({ error: 'Use uma senha com 8 a 128 caracteres, letras e numeros' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email ja cadastrado' });
    }

    const hashed = await bcrypt.hash(senha, 10);
    const user = await prisma.user.create({ data: { nome, email, senha: hashed } });
    const token = signToken(user);

    return res.status(201).json({
      message: 'Usuario criado',
      user: { id: user.id, nome: user.nome, email: user.email },
      token,
    });
  } catch (err) {
    console.error('signup error:', err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const login = async (req, res) => {
  try {
    const email = parseRequiredString(req.body?.email).toLowerCase();
    const senha = parseRequiredString(req.body?.senha);

    if (!email || !senha) {
      return res.status(400).json({ error: 'Preencha todos os campos' });
    }

    if (!isValidEmail(email) || senha.length > 128) {
      return res.status(401).json({ error: 'Credenciais invalidas' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciais invalidas' });
    }

    const isValid = await bcrypt.compare(senha, user.senha);
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciais invalidas' });
    }

    const token = signToken(user);
    return res.json({
      message: 'Login bem-sucedido',
      user: { id: user.id, nome: user.nome, email: user.email },
      token,
    });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const profile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ error: 'Usuario nao encontrado' });
    }

    return res.json({
      id: user.id,
      nome: user.nome,
      email: user.email,
      data_criacao: user.data_criacao,
    });
  } catch (err) {
    console.error('profile error:', err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};
