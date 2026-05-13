'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Add 2FA columns to Users table
      await queryInterface.sequelize.query(
        'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "two_factor_enabled" BOOLEAN DEFAULT false',
        { transaction }
      );

      await queryInterface.sequelize.query(
        'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "two_fa_secret" VARCHAR(255)',
        { transaction }
      );

      await queryInterface.sequelize.query(
        'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "two_fa_backup_codes" TEXT',
        { transaction }
      );

      // Add photo editing tracking to Photos table (if table exists)
      try {
        await queryInterface.sequelize.query(
          'ALTER TABLE "Photos" ADD COLUMN IF NOT EXISTS "original_s3_key" VARCHAR(500)',
          { transaction }
        );
        await queryInterface.sequelize.query(
          'ALTER TABLE "Photos" ADD COLUMN IF NOT EXISTS "edit_history" JSON DEFAULT \'[]\'',
          { transaction }
        );
      } catch (err) {
        // Table may not exist yet - that's OK, will be created by other migrations
      }

      // Add rating_reason to ProofingSelections (if table exists)
      try {
        await queryInterface.sequelize.query(
          'ALTER TABLE "ProofingSelections" ADD COLUMN IF NOT EXISTS "rating_reason" TEXT',
          { transaction }
        );
      } catch (err) {
        // Table may not exist yet - that's OK, will be created by other migrations
      }

      // Create WatermarkTemplates table
      await queryInterface.createTable('WatermarkTemplates', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE',
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        type: Sequelize.STRING(50),
        position: Sequelize.STRING(50),
        opacity: {
          type: Sequelize.FLOAT,
          defaultValue: 0.7,
        },
        size_percentage: {
          type: Sequelize.INTEGER,
          defaultValue: 20,
        },
        font_family: {
          type: Sequelize.STRING(100),
          defaultValue: 'Arial',
        },
        text_content: Sequelize.TEXT,
        image_s3_key: Sequelize.STRING(500),
        color: {
          type: Sequelize.STRING(7),
          defaultValue: '#FFFFFF',
        },
        font_size: {
          type: Sequelize.INTEGER,
          defaultValue: 24,
        },
        rotation: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        createdAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
        updatedAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
      }, { transaction });

      await queryInterface.addIndex('WatermarkTemplates', ['user_id'], {
        name: 'idx_watermark_templates_user_id',
        transaction,
      });

      // Create Themes table
      await queryInterface.createTable('Themes', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true,
        },
        category: Sequelize.STRING(50),
        is_builtin: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        css_variables: Sequelize.JSON,
        preview_image_url: Sequelize.STRING(500),
        createdAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
        updatedAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
      }, { transaction });

      await queryInterface.addIndex('Themes', ['name'], {
        name: 'idx_themes_name',
        transaction,
      });

      // Create Coupons table
      await queryInterface.createTable('Coupons', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        code: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: true,
        },
        discount_type: Sequelize.STRING(20),
        discount_value: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
        },
        max_uses: {
          type: Sequelize.INTEGER,
          defaultValue: 999,
        },
        used_count: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        expires_at: Sequelize.DATE,
        apply_to: Sequelize.STRING(50),
        gallery_ids: Sequelize.JSON,
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
        updatedAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
      }, { transaction });

      await queryInterface.addIndex('Coupons', ['code'], {
        name: 'idx_coupons_code',
        transaction,
      });

      await queryInterface.addIndex('Coupons', ['is_active'], {
        name: 'idx_coupons_active',
        transaction,
      });

      // Add photo indexes for performance (if Photos table exists)
      try {
        await queryInterface.addIndex('Photos', ['exif_make'], {
          name: 'idx_photos_camera',
          transaction,
        });

        await queryInterface.addIndex('Photos', ['exif_model'], {
          name: 'idx_photos_lens',
          transaction,
        });

        await queryInterface.addIndex('Photos', ['exif_iso'], {
          name: 'idx_photos_iso',
          transaction,
        });

        await queryInterface.addIndex('Photos', ['exif_aperture'], {
          name: 'idx_photos_aperture',
          transaction,
        });

        await queryInterface.addIndex('Photos', ['exif_focal_length'], {
          name: 'idx_photos_focal_length',
          transaction,
        });

        await queryInterface.addIndex('Photos', ['createdAt'], {
          name: 'idx_photos_created_at',
          transaction,
        });
      } catch (err) {
        // Photos table may not exist yet - that's OK
      }

      // Insert pre-built themes
      await queryInterface.bulkInsert('Themes', [
        {
          name: 'Minimal Light',
          category: 'light',
          is_builtin: true,
          css_variables: { primary: '#000000', secondary: '#666666', background: '#FFFFFF', accent: '#CCCCCC' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Dark Elegance',
          category: 'dark',
          is_builtin: true,
          css_variables: { primary: '#FFFFFF', secondary: '#BBBBBB', background: '#1a1a1a', accent: '#333333' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Bold Vibrant',
          category: 'vibrant',
          is_builtin: true,
          css_variables: { primary: '#FF6B6B', secondary: '#4ECDC4', background: '#FFFFFF', accent: '#FFE66D' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Professional',
          category: 'professional',
          is_builtin: true,
          css_variables: { primary: '#003D7A', secondary: '#666666', background: '#F5F5F5', accent: '#0066CC' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Artistic',
          category: 'artistic',
          is_builtin: true,
          css_variables: { primary: '#8B4789', secondary: '#D4A5A5', background: '#F9F7F4', accent: '#E0B0B0' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ], { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('Coupons', { transaction });
      await queryInterface.dropTable('Themes', { transaction });
      await queryInterface.dropTable('WatermarkTemplates', { transaction });

      await queryInterface.removeColumn('ProofingSelections', 'rating_reason', { transaction });
      await queryInterface.removeColumn('Photos', 'edit_history', { transaction });
      await queryInterface.removeColumn('Photos', 'original_s3_key', { transaction });
      await queryInterface.removeColumn('users', 'two_fa_backup_codes', { transaction });
      await queryInterface.removeColumn('users', 'two_fa_secret', { transaction });
      await queryInterface.removeColumn('users', 'two_factor_enabled', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
