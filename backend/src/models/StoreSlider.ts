import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@config/database';

interface StoreSliderAttributes {
  id: string;
  storeId: number;
  title: string;
  subtitle?: string;
  buttonText?: string;
  imagePath: string;
  placement: string;
  sortOrder: number;
  metadata: Record<string, any> | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type StoreSliderCreationAttributes = Optional<
  StoreSliderAttributes,
  'id' | 'subtitle' | 'buttonText' | 'metadata' | 'createdAt' | 'updatedAt' | 'placement' | 'sortOrder'
>;

class StoreSlider extends Model<StoreSliderAttributes, StoreSliderCreationAttributes> implements StoreSliderAttributes {
  declare id: string;
  declare storeId: number;
  declare title: string;
  declare subtitle?: string;
  declare buttonText?: string;
  declare imagePath: string;
  declare placement: string;
  declare sortOrder: number;
  declare metadata: Record<string, any> | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

StoreSlider.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    storeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'store_id',
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    subtitle: {
      type: DataTypes.STRING(512),
      allowNull: true,
    },
    buttonText: {
      type: DataTypes.STRING(128),
      allowNull: true,
      field: 'button_text',
    },
    imagePath: {
      type: DataTypes.STRING(1024),
      allowNull: false,
      field: 'image_path',
    },
    placement: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'slider',
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'sort_order',
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'store_sliders',
    timestamps: true,
    underscored: false,
    indexes: [{ fields: ['store_id'] }, { fields: ['sort_order'] }],
  }
);

export default StoreSlider;
