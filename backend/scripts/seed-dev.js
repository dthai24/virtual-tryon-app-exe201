const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const User = require('../models/User');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const Order = require('../models/Order');
const TryonHistory = require('../models/TryonHistory');
const CreditTransaction = require('../models/CreditTransaction');
const { publicUploadUrl } = require('../utils/publicUrl');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/virtual_tryon_db';
const PASSWORD = 'defaultpassword123';

const uploadRoot = path.join(__dirname, '..', 'public', 'uploads');
const productsDir = path.join(uploadRoot, 'products');
const facesDir = path.join(uploadRoot, 'faces');

const accounts = [
  { username: 'Seed Buyer One', email: 'buyer1@smartfit.vn', role: 'buyer', credits: 12 },
  { username: 'Seed Buyer Two', email: 'buyer2@smartfit.vn', role: 'buyer', credits: 7 },
  { username: 'Routine Owner', email: 'owner_routine@smartfit.vn', role: 'shop_owner', credits: 0 },
  { username: 'Sporty Owner', email: 'owner_sporty@smartfit.vn', role: 'shop_owner', credits: 0 },
  { username: 'SmartFit Admin', email: 'admin@smartfit.vn', role: 'admin', credits: 0 },
];

const sourceImages = [
  '1781682607832-Screenshot_2026-06-17_144954.png',
  '1781679493475.jpg',
  '1781679839661.jpg',
  '1781680030317.jpg',
  '1781680931997.jpg',
  '1779888429550.jpg',
  '1779888562171.jpg',
  '1779888710751.jpg',
];

function ensureProductImage(fileName) {
  fs.mkdirSync(productsDir, { recursive: true });

  const existingProductPath = path.join(productsDir, fileName);
  if (fs.existsSync(existingProductPath)) {
    return path.resolve(existingProductPath).replace(/\\/g, '/');
  }

  const sourcePath = path.join(uploadRoot, fileName);
  if (fs.existsSync(sourcePath)) {
    const seedFileName = `seed-${fileName}`;
    const destinationPath = path.join(productsDir, seedFileName);
    if (!fs.existsSync(destinationPath)) {
      fs.copyFileSync(sourcePath, destinationPath);
    }
    return path.resolve(destinationPath).replace(/\\/g, '/');
  }

  const fallback = fs.readdirSync(productsDir).find((name) => /\.(png|jpe?g|webp)$/i.test(name));
  if (!fallback) {
    throw new Error('No product images found in backend/public/uploads/products');
  }
  return path.resolve(path.join(productsDir, fallback)).replace(/\\/g, '/');
}

function findFaceUrl(index = 0) {
  const faceFiles = fs.existsSync(facesDir)
    ? fs.readdirSync(facesDir).filter((name) => /\.(png|jpe?g|webp)$/i.test(name))
    : [];
  const selected = faceFiles[index % Math.max(faceFiles.length, 1)];
  if (selected) {
    return publicUploadUrl('faces', selected);
  }
  return publicUploadUrl('1779888429544.jpg');
}

async function upsertUser(account) {
  return User.findOneAndUpdate(
    { email: account.email },
    {
      $set: {
        username: account.username,
        email: account.email,
        password: PASSWORD,
        role: account.role,
        credits: account.credits,
      },
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  );
}

async function upsertShop(owner, data) {
  return Shop.findOneAndUpdate(
    { owner_id: owner._id },
    {
      $set: {
        owner_id: owner._id,
        name: data.name,
        logo: data.logo || '',
        cover_image: data.cover_image || '',
        description: data.description,
        status: 'active',
      },
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  );
}

async function upsertProduct(shop, data, imagePath) {
  return Product.findOneAndUpdate(
    { shop_id: shop._id, name: data.name },
    {
      $set: {
        shop_id: shop._id,
        name: data.name,
        price: data.price,
        description: data.description,
        garment_image_url: imagePath,
        category: data.category,
        stock: data.stock,
        status: data.status || 'available',
      },
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  );
}

async function main() {
  await mongoose.connect(MONGO_URI);

  const users = {};
  for (const account of accounts) {
    users[account.email] = await upsertUser(account);
  }

  const routineShop = await upsertShop(users['owner_routine@smartfit.vn'], {
    name: 'Routine Studio',
    description: 'Everyday fashion test shop for SmartFit local development.',
  });
  const sportyShop = await upsertShop(users['owner_sporty@smartfit.vn'], {
    name: 'Sporty Lab',
    description: 'Sport and jersey catalog for AI try-on testing.',
  });

  const imagePaths = sourceImages.map(ensureProductImage);
  const productSeeds = [
    {
      shop: routineShop,
      name: 'Seed Green V-Neck Tee',
      price: 189000,
      category: 'male',
      stock: 42,
      description: 'Green V-neck shirt mapped to the saved product image.',
      imagePath: imagePaths[0],
    },
    {
      shop: sportyShop,
      name: 'Seed Vietnam Red Jersey',
      price: 259000,
      category: 'male',
      stock: 35,
      description: 'Red Vietnam football kit mapped to an uploaded garment image.',
      imagePath: imagePaths[1],
    },
    {
      shop: sportyShop,
      name: 'Seed Sport Jersey Away',
      price: 269000,
      category: 'unisex',
      stock: 28,
      description: 'Away sport jersey mapped to an uploaded garment image.',
      imagePath: imagePaths[2],
    },
    {
      shop: sportyShop,
      name: 'Seed Training Set Blue',
      price: 299000,
      category: 'unisex',
      stock: 18,
      description: 'Training set for checkout and seller dashboard testing.',
      imagePath: imagePaths[3],
    },
    {
      shop: sportyShop,
      name: 'Seed Sport Jersey Black',
      price: 279000,
      category: 'male',
      stock: 24,
      description: 'Dark sport jersey for product grid testing.',
      imagePath: imagePaths[4],
    },
    {
      shop: routineShop,
      name: 'Seed Pink Floral Dress',
      price: 349000,
      category: 'female',
      stock: 16,
      description: 'Dress image copied from saved uploads into the products folder.',
      imagePath: imagePaths[5],
    },
    {
      shop: routineShop,
      name: 'Seed Casual Dress Cream',
      price: 329000,
      category: 'female',
      stock: 20,
      description: 'Casual dress for buyer catalog and order tests.',
      imagePath: imagePaths[6],
    },
    {
      shop: routineShop,
      name: 'Seed Office Dress Pattern',
      price: 379000,
      category: 'female',
      stock: 14,
      description: 'Office dress item with saved image mapping.',
      imagePath: imagePaths[7],
    },
  ];

  const products = [];
  for (const productSeed of productSeeds) {
    products.push(await upsertProduct(productSeed.shop, productSeed, productSeed.imagePath));
  }

  const seededUserIds = Object.values(users).map((user) => user._id);
  const productIds = products.map((product) => product._id);
  const shopIds = [routineShop._id, sportyShop._id];

  await Promise.all([
    Order.deleteMany({ buyer_id: { $in: seededUserIds }, shop_id: { $in: shopIds } }),
    TryonHistory.deleteMany({ user_id: { $in: seededUserIds }, product_id: { $in: productIds } }),
    CreditTransaction.deleteMany({ user_id: { $in: seededUserIds } }),
  ]);

  await CreditTransaction.insertMany([
    {
      user_id: users['buyer1@smartfit.vn']._id,
      amount: 10,
      type: 'bonus',
      description: 'Seed bonus credits for local testing.',
    },
    {
      user_id: users['buyer1@smartfit.vn']._id,
      amount: -1,
      type: 'usage_deduction',
      description: 'Seed AI try-on usage deduction.',
    },
    {
      user_id: users['buyer2@smartfit.vn']._id,
      amount: 5,
      type: 'purchase',
      description: 'Seed credit recharge transaction.',
    },
  ]);

  await TryonHistory.insertMany([
    {
      user_id: users['buyer1@smartfit.vn']._id,
      product_id: products[0]._id,
      user_face_url: findFaceUrl(0),
      result_image_url: publicUploadUrl('ai_output_1779888924603.png'),
      result_video_url: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-woman-with-silver-dress-walking-in-studio-41480-large.mp4',
      status: 'video_ready',
      video_status: 'ready',
      measurements: { height: 172, weight: 66, gender: 'male' },
    },
    {
      user_id: users['buyer1@smartfit.vn']._id,
      product_id: products[5]._id,
      user_face_url: findFaceUrl(1),
      result_image_url: publicUploadUrl('ai_output_1779888924603.png'),
      result_video_url: '',
      status: 'image_ready',
      video_status: 'pending',
      measurements: { height: 162, weight: 50, gender: 'female' },
    },
    {
      user_id: users['buyer2@smartfit.vn']._id,
      product_id: products[1]._id,
      user_face_url: findFaceUrl(2),
      result_image_url: publicUploadUrl('ai_output_1779888924603.png'),
      result_video_url: '',
      status: 'processing_video',
      video_status: 'processing',
      measurements: { height: 178, weight: 73, gender: 'male' },
    },
  ]);

  await Order.insertMany([
    {
      buyer_id: users['buyer1@smartfit.vn']._id,
      shop_id: routineShop._id,
      items: [
        { product_id: products[0]._id, name: products[0].name, quantity: 1, price: products[0].price, size: 'L' },
        { product_id: products[5]._id, name: products[5].name, quantity: 1, price: products[5].price, size: 'M' },
      ],
      total_amount: products[0].price + products[5].price,
      shipping_info: {
        name: 'Nguyen Van Test',
        phone: '0900000001',
        address: '12 Nguyen Hue, Quan 1, TP HCM',
      },
      status: 'pending',
    },
    {
      buyer_id: users['buyer1@smartfit.vn']._id,
      shop_id: sportyShop._id,
      items: [
        { product_id: products[1]._id, name: products[1].name, quantity: 2, price: products[1].price, size: 'XL' },
      ],
      total_amount: products[1].price * 2,
      shipping_info: {
        name: 'Nguyen Van Test',
        phone: '0900000001',
        address: '12 Nguyen Hue, Quan 1, TP HCM',
      },
      status: 'shipping',
    },
    {
      buyer_id: users['buyer2@smartfit.vn']._id,
      shop_id: routineShop._id,
      items: [
        { product_id: products[6]._id, name: products[6].name, quantity: 1, price: products[6].price, size: 'S' },
      ],
      total_amount: products[6].price,
      shipping_info: {
        name: 'Tran Thi Test',
        phone: '0900000002',
        address: '25 Le Loi, Quan 3, TP HCM',
      },
      status: 'delivered',
    },
    {
      buyer_id: users['buyer2@smartfit.vn']._id,
      shop_id: sportyShop._id,
      items: [
        { product_id: products[3]._id, name: products[3].name, quantity: 1, price: products[3].price, size: 'M' },
      ],
      total_amount: products[3].price,
      shipping_info: {
        name: 'Tran Thi Test',
        phone: '0900000002',
        address: '25 Le Loi, Quan 3, TP HCM',
      },
      status: 'cancelled',
    },
  ]);

  const summary = {
    database: mongoose.connection.name,
    accounts: accounts.map((account) => ({
      email: account.email,
      password: PASSWORD,
      role: account.role,
    })),
    shops: [routineShop.name, sportyShop.name],
    products: products.length,
    orders: 4,
    tryonHistories: 3,
    creditTransactions: 3,
    productImages: products.map((product) => product.garment_image_url),
  };

  console.log(JSON.stringify(summary, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
