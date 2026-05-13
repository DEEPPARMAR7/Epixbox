'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Create SubdomainMappings table
      await queryInterface.createTable('SubdomainMappings', {
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
        subdomain: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true,
        },
        domain: {
          type: Sequelize.STRING(255),
          defaultValue: 'epixbox.com',
        },
        ssl_certificate_path: Sequelize.STRING(500),
        is_verified: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
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

      await queryInterface.addIndex('SubdomainMappings', ['user_id'], {
        name: 'idx_subdomains_user_id',
        transaction,
      });

      await queryInterface.addIndex('SubdomainMappings', ['subdomain'], {
        name: 'idx_subdomains_subdomain',
        transaction,
      });

      await queryInterface.addIndex('SubdomainMappings', ['is_active'], {
        name: 'idx_subdomains_active',
        transaction,
      });

      // Create GalleryPasswords table
      await queryInterface.createTable('GalleryPasswords', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        gallery_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: true,
          references: { model: 'Galleries', key: 'id' },
          onDelete: 'CASCADE',
        },
        password_hash: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        hint: Sequelize.STRING(255),
        is_enabled: {
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

      await queryInterface.addIndex('GalleryPasswords', ['gallery_id'], {
        name: 'idx_gallery_passwords_gallery_id',
        transaction,
      });

      // Create GalleryExpiries table
      await queryInterface.createTable('GalleryExpiries', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        gallery_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: true,
          references: { model: 'Galleries', key: 'id' },
          onDelete: 'CASCADE',
        },
        expires_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        download_limit: Sequelize.INTEGER,
        downloads_remaining: Sequelize.INTEGER,
        send_expiry_reminder_at: Sequelize.DATE,
        is_enabled: {
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

      await queryInterface.addIndex('GalleryExpiries', ['gallery_id'], {
        name: 'idx_gallery_expiries_gallery_id',
        transaction,
      });

      await queryInterface.addIndex('GalleryExpiries', ['expires_at'], {
        name: 'idx_gallery_expiries_expires_at',
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('GalleryExpiries', { transaction });
      await queryInterface.dropTable('GalleryPasswords', { transaction });
      await queryInterface.dropTable('SubdomainMappings', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
