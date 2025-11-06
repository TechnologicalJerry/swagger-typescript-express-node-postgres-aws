import { User, UserCreationAttributes } from '../models/user.model';
import { hashPassword, comparePassword } from '../utils/password.util';
import { generateToken, TokenPayload } from '../utils/jwt.util';
import { logger } from '../config/logger';

export interface RegisterUserData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  gender?: string;
  dob?: Date | string;
  phone?: string;
}

export interface LoginUserData {
  email: string;
  password: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export class UserService {
  async register(data: RegisterUserData): Promise<{ user: User; token: string }> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ where: { email: data.email } });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await hashPassword(data.password);

      // Check if userName already exists (if provided)
      if (data.userName) {
        const existingUserName = await User.findOne({ where: { userName: data.userName } });
        if (existingUserName) {
          throw new Error('Username already taken');
        }
      }

      // Create user
      const userData: UserCreationAttributes = {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName?.trim() || undefined,
        lastName: data.lastName?.trim() || undefined,
        userName: data.userName?.trim() || undefined,
        gender: data.gender?.trim() || undefined,
        dob: data.dob ? new Date(data.dob) : undefined,
        phone: data.phone?.trim() || undefined,
        isActive: true,
      };

      const user = await User.create(userData);

      // Generate token
      const token = generateToken({ userId: user.id, email: user.email });

      // Remove password from response
      const userResponse = user.toJSON();
      delete (userResponse as { password?: string }).password;

      return { user: userResponse as User, token };
    } catch (error) {
      logger.error('Error registering user', error);
      throw error;
    }
  }

  async login(data: LoginUserData): Promise<{ user: User; token: string }> {
    try {
      // Find user
      const user = await User.findOne({ where: { email: data.email } });
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await comparePassword(data.password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Generate token
      const token = generateToken({ userId: user.id, email: user.email });

      // Remove password from response
      const userResponse = user.toJSON();
      delete (userResponse as { password?: string }).password;

      return { user: userResponse as User, token };
    } catch (error) {
      logger.error('Error logging in user', error);
      throw error;
    }
  }

  async getUserById(id: number): Promise<User | null> {
    try {
      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] },
      });
      return user;
    } catch (error) {
      logger.error('Error getting user by ID', error);
      throw error;
    }
  }

  async updateUser(id: number, data: UpdateUserData): Promise<User> {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new Error('User not found');
      }

      // Update user
      await user.update(data);

      // Remove password from response
      const userResponse = user.toJSON();
      delete (userResponse as { password?: string }).password;

      return userResponse as User;
    } catch (error) {
      logger.error('Error updating user', error);
      throw error;
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new Error('User not found');
      }

      await user.destroy();
    } catch (error) {
      logger.error('Error deleting user', error);
      throw error;
    }
  }
}

export const userService = new UserService();

