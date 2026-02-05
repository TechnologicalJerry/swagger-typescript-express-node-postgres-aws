import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './user.model';

export type SessionStatus = 'active' | 'logged_out';

export interface SessionAttributes {
  id: number;
  userId: number;
  tokenId: string; // JWT jti - links this record to the issued token
  status: SessionStatus;
  loginAt: Date;
  logoutAt: Date | null;
  ip: string | null;
  userAgent: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SessionCreationAttributes
  extends Optional<SessionAttributes, 'id' | 'logoutAt' | 'ip' | 'userAgent' | 'createdAt' | 'updatedAt'> {}

export class Session
  extends Model<SessionAttributes, SessionCreationAttributes>
  implements SessionAttributes
{
  public id!: number;
  public userId!: number;
  public tokenId!: string;
  public status!: SessionStatus;
  public loginAt!: Date;
  public logoutAt!: Date | null;
  public ip!: string | null;
  public userAgent!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Session.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: 'id' },
      onDelete: 'CASCADE',
    },
    tokenId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      field: 'token_id',
    },
    status: {
      type: DataTypes.ENUM('active', 'logged_out'),
      allowNull: false,
      defaultValue: 'active',
    },
    loginAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'login_at',
    },
    logoutAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'logout_at',
    },
    ip: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'user_agent',
    },
  },
  {
    sequelize,
    tableName: 'user_sessions',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['token_id'] },   // DB column name (model attr tokenId has field: 'token_id')
      { fields: ['status'] },
      { fields: ['login_at'] },  // DB column name (model attr loginAt has field: 'login_at')
    ],
  }
);

User.hasMany(Session, { foreignKey: 'userId', as: 'sessions' });
Session.belongsTo(User, { foreignKey: 'userId', as: 'user' });
