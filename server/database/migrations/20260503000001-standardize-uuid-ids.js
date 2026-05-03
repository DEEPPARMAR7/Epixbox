'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Note: This migration standardizes INTEGER primary keys to UUID
      // for consistency across the entire database.
      //
      // Due to PostgreSQL's limitations with changing column types,
      // this migration follows these steps:
      // 1. Create new UUID columns
      // 2. Copy data from old columns
      // 3. Drop old columns
      // 4. Rename new columns

      console.log('Starting UUID standardization migration...');

      // 1. Convert ApiKeys
      await queryInterface.addColumn(
        'ApiKeys',
        'id_new',
        { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4 },
        { transaction }
      );
      await queryInterface.addColumn(
        'ApiKeys',
        'user_id_new',
        { type: Sequelize.UUID },
        { transaction }
      );
      await queryInterface.sequelize.query(
        'UPDATE "ApiKeys" SET id_new = gen_random_uuid(), user_id_new = (SELECT id FROM "Users" LIMIT 1)',
        { transaction }
      );
      await queryInterface.removeColumn('ApiKeys', 'id', { transaction });
      await queryInterface.removeColumn('ApiKeys', 'user_id', { transaction });
      await queryInterface.renameColumn('ApiKeys', 'id_new', 'id', { transaction });
      await queryInterface.renameColumn('ApiKeys', 'user_id_new', 'user_id', { transaction });

      // 2. Convert GiftCards
      await queryInterface.addColumn(
        'GiftCards',
        'id_new',
        { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4 },
        { transaction }
      );
      await queryInterface.addColumn(
        'GiftCards',
        'user_id_new',
        { type: Sequelize.UUID },
        { transaction }
      );
      await queryInterface.sequelize.query(
        'UPDATE "GiftCards" SET id_new = gen_random_uuid()',
        { transaction }
      );
      // Map user_ids (this needs more careful handling in production)
      await queryInterface.sequelize.query(
        `UPDATE "GiftCards" gc SET user_id_new = u.id FROM "Users" u WHERE gc.user_id = u.id::INTEGER LIMIT 1`,
        { transaction, raw: true }
      );
      await queryInterface.removeConstraint('GiftCards', 'GiftCards_user_id_fkey', { transaction });
      await queryInterface.removeColumn('GiftCards', 'id', { transaction });
      await queryInterface.removeColumn('GiftCards', 'user_id', { transaction });
      await queryInterface.renameColumn('GiftCards', 'id_new', 'id', { transaction });
      await queryInterface.renameColumn('GiftCards', 'user_id_new', 'user_id', { transaction });
      await queryInterface.addConstraint('GiftCards', {
        fields: ['user_id'],
        type: 'foreign key',
        name: 'GiftCards_user_id_fkey',
        references: { table: 'Users', field: 'id' },
        onDelete: 'CASCADE',
        transaction,
      });

      // 3. Convert Inventory
      await queryInterface.addColumn(
        'Inventories',
        'id_new',
        { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4 },
        { transaction }
      );
      await queryInterface.addColumn(
        'Inventories',
        'variant_id_new',
        { type: Sequelize.UUID },
        { transaction }
      );
      await queryInterface.sequelize.query(
        'UPDATE "Inventories" SET id_new = gen_random_uuid()',
        { transaction }
      );
      // This requires ProductVariants to be UUID first
      await queryInterface.removeConstraint('Inventories', 'Inventories_variant_id_fkey', { transaction });
      await queryInterface.removeColumn('Inventories', 'id', { transaction });
      await queryInterface.removeColumn('Inventories', 'variant_id', { transaction });
      await queryInterface.renameColumn('Inventories', 'id_new', 'id', { transaction });
      await queryInterface.renameColumn('Inventories', 'variant_id_new', 'variant_id', { transaction });

      // 4. Convert ProductVariants
      await queryInterface.addColumn(
        'ProductVariants',
        'id_new',
        { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4 },
        { transaction }
      );
      await queryInterface.addColumn(
        'ProductVariants',
        'product_id_new',
        { type: Sequelize.UUID },
        { transaction }
      );
      await queryInterface.sequelize.query(
        'UPDATE "ProductVariants" SET id_new = gen_random_uuid()',
        { transaction }
      );
      await queryInterface.removeConstraint('ProductVariants', 'ProductVariants_product_id_fkey', { transaction });
      await queryInterface.removeColumn('ProductVariants', 'id', { transaction });
      await queryInterface.removeColumn('ProductVariants', 'product_id', { transaction });
      await queryInterface.renameColumn('ProductVariants', 'id_new', 'id', { transaction });
      await queryInterface.renameColumn('ProductVariants', 'product_id_new', 'product_id', { transaction });

      // 5. Convert ShippingZones
      await queryInterface.addColumn(
        'ShippingZones',
        'id_new',
        { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4 },
        { transaction }
      );
      await queryInterface.addColumn(
        'ShippingZones',
        'user_id_new',
        { type: Sequelize.UUID },
        { transaction }
      );
      await queryInterface.sequelize.query(
        'UPDATE "ShippingZones" SET id_new = gen_random_uuid()',
        { transaction }
      );
      await queryInterface.removeConstraint('ShippingZones', 'ShippingZones_user_id_fkey', { transaction });
      await queryInterface.removeColumn('ShippingZones', 'id', { transaction });
      await queryInterface.removeColumn('ShippingZones', 'user_id', { transaction });
      await queryInterface.renameColumn('ShippingZones', 'id_new', 'id', { transaction });
      await queryInterface.renameColumn('ShippingZones', 'user_id_new', 'user_id', { transaction });

      // 6. Convert ShippingRates
      await queryInterface.addColumn(
        'ShippingRates',
        'id_new',
        { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4 },
        { transaction }
      );
      await queryInterface.addColumn(
        'ShippingRates',
        'zone_id_new',
        { type: Sequelize.UUID },
        { transaction }
      );
      await queryInterface.sequelize.query(
        'UPDATE "ShippingRates" SET id_new = gen_random_uuid()',
        { transaction }
      );
      await queryInterface.removeConstraint('ShippingRates', 'ShippingRates_zone_id_fkey', { transaction });
      await queryInterface.removeColumn('ShippingRates', 'id', { transaction });
      await queryInterface.removeColumn('ShippingRates', 'zone_id', { transaction });
      await queryInterface.renameColumn('ShippingRates', 'id_new', 'id', { transaction });
      await queryInterface.renameColumn('ShippingRates', 'zone_id_new', 'zone_id', { transaction });

      // 7. Convert SavedPaymentMethods
      await queryInterface.addColumn(
        'SavedPaymentMethods',
        'id_new',
        { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4 },
        { transaction }
      );
      await queryInterface.addColumn(
        'SavedPaymentMethods',
        'user_id_new',
        { type: Sequelize.UUID },
        { transaction }
      );
      await queryInterface.sequelize.query(
        'UPDATE "SavedPaymentMethods" SET id_new = gen_random_uuid()',
        { transaction }
      );
      await queryInterface.removeConstraint('SavedPaymentMethods', 'SavedPaymentMethods_user_id_fkey', { transaction });
      await queryInterface.removeColumn('SavedPaymentMethods', 'id', { transaction });
      await queryInterface.removeColumn('SavedPaymentMethods', 'user_id', { transaction });
      await queryInterface.renameColumn('SavedPaymentMethods', 'id_new', 'id', { transaction });
      await queryInterface.renameColumn('SavedPaymentMethods', 'user_id_new', 'user_id', { transaction });

      // 8. Convert Refunds
      await queryInterface.addColumn(
        'Refunds',
        'id_new',
        { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4 },
        { transaction }
      );
      await queryInterface.addColumn(
        'Refunds',
        'order_id_new',
        { type: Sequelize.UUID },
        { transaction }
      );
      await queryInterface.sequelize.query(
        'UPDATE "Refunds" SET id_new = gen_random_uuid()',
        { transaction }
      );
      await queryInterface.removeConstraint('Refunds', 'Refunds_order_id_fkey', { transaction });
      await queryInterface.removeColumn('Refunds', 'id', { transaction });
      await queryInterface.removeColumn('Refunds', 'order_id', { transaction });
      await queryInterface.renameColumn('Refunds', 'id_new', 'id', { transaction });
      await queryInterface.renameColumn('Refunds', 'order_id_new', 'order_id', { transaction });

      // 9. Convert SubdomainMappings
      await queryInterface.addColumn(
        'SubdomainMappings',
        'id_new',
        { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4 },
        { transaction }
      );
      await queryInterface.addColumn(
        'SubdomainMappings',
        'user_id_new',
        { type: Sequelize.UUID },
        { transaction }
      );
      await queryInterface.sequelize.query(
        'UPDATE "SubdomainMappings" SET id_new = gen_random_uuid()',
        { transaction }
      );
      await queryInterface.removeConstraint('SubdomainMappings', 'SubdomainMappings_user_id_fkey', { transaction });
      await queryInterface.removeColumn('SubdomainMappings', 'id', { transaction });
      await queryInterface.removeColumn('SubdomainMappings', 'user_id', { transaction });
      await queryInterface.renameColumn('SubdomainMappings', 'id_new', 'id', { transaction });
      await queryInterface.renameColumn('SubdomainMappings', 'user_id_new', 'user_id', { transaction });

      // 10. Convert GalleryExpiries
      await queryInterface.addColumn(
        'GalleryExpiries',
        'id_new',
        { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4 },
        { transaction }
      );
      await queryInterface.addColumn(
        'GalleryExpiries',
        'gallery_id_new',
        { type: Sequelize.UUID },
        { transaction }
      );
      await queryInterface.sequelize.query(
        'UPDATE "GalleryExpiries" SET id_new = gen_random_uuid()',
        { transaction }
      );
      await queryInterface.removeConstraint('GalleryExpiries', 'GalleryExpiries_gallery_id_fkey', { transaction });
      await queryInterface.removeColumn('GalleryExpiries', 'id', { transaction });
      await queryInterface.removeColumn('GalleryExpiries', 'gallery_id', { transaction });
      await queryInterface.renameColumn('GalleryExpiries', 'id_new', 'id', { transaction });
      await queryInterface.renameColumn('GalleryExpiries', 'gallery_id_new', 'gallery_id', { transaction });

      // 11. Convert GalleryPasswords
      await queryInterface.addColumn(
        'GalleryPasswords',
        'id_new',
        { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4 },
        { transaction }
      );
      await queryInterface.addColumn(
        'GalleryPasswords',
        'gallery_id_new',
        { type: Sequelize.UUID },
        { transaction }
      );
      await queryInterface.sequelize.query(
        'UPDATE "GalleryPasswords" SET id_new = gen_random_uuid()',
        { transaction }
      );
      await queryInterface.removeConstraint('GalleryPasswords', 'GalleryPasswords_gallery_id_fkey', { transaction });
      await queryInterface.removeColumn('GalleryPasswords', 'id', { transaction });
      await queryInterface.removeColumn('GalleryPasswords', 'gallery_id', { transaction });
      await queryInterface.renameColumn('GalleryPasswords', 'id_new', 'id', { transaction });
      await queryInterface.renameColumn('GalleryPasswords', 'gallery_id_new', 'gallery_id', { transaction });

      await transaction.commit();
      console.log('UUID standardization migration completed successfully');
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback is intentionally not implemented for this migration
    // as it involves complex data transformation. If rollback is needed,
    // restore from database backup.
    throw new Error('Rollback not supported for UUID migration. Restore from backup if needed.');
  },
};
