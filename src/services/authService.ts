
import { User, IUser, Role } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// DTO types
interface SignupDTO {
  fullName: string;
  email: string;
  password: string;
  role?: Role;
}
interface user{
  id: string;
  fullName: string;
  email: string;
  password: string;
  role?: Role;
}

interface LoginDTO {
  email: string;
  password: string;
}

interface TokenResponse {
  token: string;
}

interface SignupResponse {
  message: string;
}

// Signup a new user
export async function signup(dto: SignupDTO): Promise<SignupResponse> {
  // Check if user already exists
  const existing = await User.findOne({ email: dto.email });
  if (existing) throw new Error('User already exists');

  // Hash password
  const hashed = await bcrypt.hash(dto.password, 10);

  // Create user
  const user = new User({
    fullName: dto.fullName,
    email: dto.email,
    password: hashed,
    role: dto.role || 'user',
  });

  await user.save();
  return { message: 'User registered' };
}

// Login existing user
export async function login(dto: LoginDTO): Promise<TokenResponse> {
  const user = await User.findOne({ email: dto.email });
  if (!user) throw new Error('Invalid credentials');

  const match = await bcrypt.compare(dto.password, user.password);
  if (!match) throw new Error('Invalid credentials');

  const token = jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  return { token };
}

// Get all users
export async function getAllUsers(): Promise<Array<{ id: string; fullName: string; email: string; role: Role }>> {
  const users = await User.find({});
  return users.map((u: user ) => ({
    id: u._id.toString(),
    fullName: u.fullName,
    email: u.email,
    role: u.role,
  }));
}

// Count all users
export async function countUsers(): Promise<number> {
  return User.countDocuments();
}
