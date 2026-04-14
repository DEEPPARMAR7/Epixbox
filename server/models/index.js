const sequelize = require('../config/database');

const User = require('./User');
const Gallery = require('./Gallery');
const GallerySetting = require('./GallerySetting');
const Photo = require('./Photo');
const Tag = require('./Tag');
const PhotoTag = require('./PhotoTag');
const ProofingSession = require('./ProofingSession');
const ProofingSelection = require('./ProofingSelection');
const ProofingComment = require('./ProofingComment');
const ProofingDownload = require('./ProofingDownload');
const PriceList = require('./PriceList');
const Product = require('./Product');
const GalleryPriceList = require('./GalleryPriceList');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const CustomDomain = require('./CustomDomain');
const WatermarkTemplate = require('./WatermarkTemplate');
const Theme = require('./Theme');

// Phase 4: Products & Inventory
const ProductVariant = require('./ProductVariant');
const Inventory = require('./Inventory');

// Phase 5: Shipping
const ShippingZone = require('./ShippingZone');
const ShippingRate = require('./ShippingRate');

// Phase 7: Advanced Portfolio
const SubdomainMapping = require('./SubdomainMapping');
const GalleryPassword = require('./GalleryPassword');
const GalleryExpiry = require('./GalleryExpiry');

// Phase 8: Advanced E-Commerce
const ApiKey = require('./ApiKey');
const GiftCard = require('./GiftCard');
const SubscriptionPlan = require('./SubscriptionPlan');
const Subscription = require('./Subscription');
const SavedPaymentMethod = require('./SavedPaymentMethod');
const Refund = require('./Refund');

// User associations
User.hasMany(Gallery, { foreignKey: 'user_id', onDelete: 'CASCADE' });
User.hasMany(Photo, { foreignKey: 'user_id' });
User.hasMany(ProofingSession, { foreignKey: 'user_id' });
User.hasMany(PriceList, { foreignKey: 'user_id' });
User.hasMany(Order, { as: 'orders', foreignKey: 'photographer_id' });
User.hasOne(CustomDomain, { foreignKey: 'user_id' });
User.hasMany(WatermarkTemplate, { foreignKey: 'user_id', onDelete: 'CASCADE' });

// Gallery associations
Gallery.belongsTo(User, { foreignKey: 'user_id' });
Gallery.hasOne(GallerySetting, { as: 'settings', foreignKey: 'gallery_id', onDelete: 'CASCADE' });
Gallery.hasMany(Photo, { foreignKey: 'gallery_id', onDelete: 'CASCADE' });
Gallery.hasMany(ProofingSession, { foreignKey: 'gallery_id', onDelete: 'CASCADE' });
Gallery.belongsTo(Gallery, { as: 'parent', foreignKey: 'parent_id', constraints: false });
Gallery.hasMany(Gallery, { as: 'children', foreignKey: 'parent_id' });
Gallery.belongsTo(Photo, { as: 'coverPhoto', foreignKey: 'cover_photo_id', constraints: false });
Gallery.belongsToMany(PriceList, { through: GalleryPriceList, foreignKey: 'gallery_id' });

GallerySetting.belongsTo(Gallery, { foreignKey: 'gallery_id' });

// Photo associations
Photo.belongsTo(Gallery, { foreignKey: 'gallery_id' });
Photo.belongsTo(User, { foreignKey: 'user_id' });
Photo.belongsToMany(Tag, { through: PhotoTag, foreignKey: 'photo_id' });

// Tag associations
Tag.belongsTo(User, { foreignKey: 'user_id' });
Tag.belongsToMany(Photo, { through: PhotoTag, foreignKey: 'tag_id' });

// Proofing associations
ProofingSession.belongsTo(Gallery, { foreignKey: 'gallery_id' });
ProofingSession.belongsTo(User, { foreignKey: 'user_id' });
ProofingSession.hasMany(ProofingSelection, { foreignKey: 'session_id', onDelete: 'CASCADE' });
ProofingSession.hasMany(ProofingComment, { foreignKey: 'session_id', onDelete: 'CASCADE' });
ProofingSession.hasMany(ProofingDownload, { foreignKey: 'session_id', onDelete: 'CASCADE' });
ProofingSelection.belongsTo(ProofingSession, { foreignKey: 'session_id' });
ProofingSelection.belongsTo(Photo, { foreignKey: 'photo_id' });
ProofingComment.belongsTo(ProofingSession, { foreignKey: 'session_id' });
ProofingComment.belongsTo(Photo, { foreignKey: 'photo_id' });
ProofingDownload.belongsTo(ProofingSession, { foreignKey: 'session_id' });
ProofingDownload.belongsTo(Photo, { foreignKey: 'photo_id' });

// Pricing associations
PriceList.belongsTo(User, { foreignKey: 'user_id' });
PriceList.hasMany(Product, { foreignKey: 'price_list_id', onDelete: 'CASCADE' });
PriceList.belongsToMany(Gallery, { through: GalleryPriceList, foreignKey: 'price_list_id' });
Product.belongsTo(PriceList, { foreignKey: 'price_list_id' });

// Order associations
Order.belongsTo(User, { as: 'photographer', foreignKey: 'photographer_id' });
Order.hasMany(OrderItem, { foreignKey: 'order_id', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });
OrderItem.belongsTo(Photo, { foreignKey: 'photo_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id' });

// CustomDomain associations
CustomDomain.belongsTo(User, { foreignKey: 'user_id' });

// Phase 4: Product Variants & Inventory
ProductVariant.associate({ Product, Inventory });
Inventory.associate({ ProductVariant });
Product.hasMany(ProductVariant, { foreignKey: 'product_id', onDelete: 'CASCADE' });

// Phase 5: Shipping
ShippingZone.associate({ User, ShippingRate });
ShippingRate.associate({ ShippingZone });
User.hasMany(ShippingZone, { foreignKey: 'user_id', onDelete: 'CASCADE' });

// Phase 7: Portfolio Features
SubdomainMapping.associate({ User });
GalleryPassword.associate({ Gallery });
GalleryExpiry.associate({ Gallery });
User.hasMany(SubdomainMapping, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Gallery.hasOne(GalleryPassword, { foreignKey: 'gallery_id', onDelete: 'CASCADE' });
Gallery.hasOne(GalleryExpiry, { foreignKey: 'gallery_id', onDelete: 'CASCADE' });

// Phase 8: Advanced E-Commerce
ApiKey.associate({ User });
GiftCard.associate({ User });
SubscriptionPlan.associate({ User, Subscription });
Subscription.associate({ SubscriptionPlan });
SavedPaymentMethod.associate({ User });
Refund.associate({ Order, User });
User.hasMany(ApiKey, { foreignKey: 'user_id', onDelete: 'CASCADE' });
User.hasMany(GiftCard, { foreignKey: 'user_id', onDelete: 'CASCADE' });
User.hasMany(SubscriptionPlan, { foreignKey: 'user_id', onDelete: 'CASCADE' });
User.hasMany(SavedPaymentMethod, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Order.hasMany(Refund, { foreignKey: 'order_id', onDelete: 'CASCADE' });

// Sync database
sequelize
  .sync({ alter: process.env.NODE_ENV === 'development' })
  .then(() => console.log('Database synced'))
  .catch((err) => console.error('Database sync error:', err));

module.exports = {
  sequelize,
  User,
  Gallery,
  GallerySetting,
  Photo,
  Tag,
  PhotoTag,
  ProofingSession,
  ProofingSelection,
  ProofingComment,
  ProofingDownload,
  PriceList,
  Product,
  GalleryPriceList,
  Order,
  OrderItem,
  CustomDomain,
  WatermarkTemplate,
  Theme,
  // Phase 4
  ProductVariant,
  Inventory,
  // Phase 5
  ShippingZone,
  ShippingRate,
  // Phase 7
  SubdomainMapping,
  GalleryPassword,
  GalleryExpiry,
  // Phase 8
  ApiKey,
  GiftCard,
  SubscriptionPlan,
  Subscription,
  SavedPaymentMethod,
  Refund,
};
