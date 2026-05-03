module.exports = (sequelize, DataTypes) => {
  const Coupon = sequelize.define(
    'Coupon',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Unique coupon code (e.g., "WELCOME10", "SAVE5")',
      },
      discount_type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: 'Type of discount: "percentage" or "fixed_amount"',
      },
      discount_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Discount value (percentage or amount in dollars)',
      },
      max_uses: {
        type: DataTypes.INTEGER,
        defaultValue: 999,
        comment: 'Maximum number of times this coupon can be used',
      },
      used_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Number of times this coupon has been used',
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Optional expiration date for the coupon',
      },
      apply_to: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Target: "subscriptions", "products", "orders", or null for all',
      },
      gallery_ids: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Optional array of gallery IDs this coupon applies to',
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Whether this coupon is currently active',
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW,
      },
    },
    {
      tableName: 'Coupons',
      timestamps: false,
      indexes: [
        { fields: ['code'] },
        { fields: ['is_active'] },
        { fields: ['expires_at'] },
      ],
    }
  );

  Coupon.associate = (models) => {
    // Coupons don't belong to a specific user - they're system-wide
  };

  /**
   * Check if coupon is valid for use
   * @param {Date} currentDate - Current date for expiration check
   * @returns {boolean} - Whether coupon can be used
   */
  Coupon.prototype.isValid = function (currentDate = new Date()) {
    if (!this.is_active) return false;
    if (this.used_count >= this.max_uses) return false;
    if (this.expires_at && new Date(this.expires_at) < currentDate) return false;
    return true;
  };

  /**
   * Apply coupon discount to an amount
   * @param {number} amount - Original amount in dollars
   * @returns {object} - { discount_amount, final_amount }
   */
  Coupon.prototype.calculateDiscount = function (amount) {
    let discountAmount = 0;

    if (this.discount_type === 'percentage') {
      discountAmount = amount * (this.discount_value / 100);
    } else if (this.discount_type === 'fixed_amount') {
      discountAmount = this.discount_value;
    }

    // Ensure discount doesn't exceed original amount
    discountAmount = Math.min(discountAmount, amount);

    return {
      discount_amount: parseFloat(discountAmount.toFixed(2)),
      final_amount: parseFloat((amount - discountAmount).toFixed(2)),
    };
  };

  /**
   * Increment usage count
   * @returns {Promise<Coupon>} - Updated coupon
   */
  Coupon.prototype.incrementUsage = function () {
    this.used_count += 1;
    return this.save();
  };

  return Coupon;
};
