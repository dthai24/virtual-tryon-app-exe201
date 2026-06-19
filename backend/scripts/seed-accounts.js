require('dotenv').config();
const mongoose = require('mongoose');

const User = require('../models/User');
const Shop = require('../models/Shop');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/virtual_tryon_db';
const PASSWORD = 'defaultpassword123';

const accounts = [
  { username: 'Seed Buyer One', email: 'buyer1@smartfit.vn', role: 'buyer', credits: 20 },
  { username: 'Seed Buyer Two', email: 'buyer2@smartfit.vn', role: 'buyer', credits: 10 },
  { username: 'Routine Owner', email: 'owner_routine@smartfit.vn', role: 'shop_owner', credits: 0 },
  { username: 'Sporty Owner', email: 'owner_sporty@smartfit.vn', role: 'shop_owner', credits: 0 },
  { username: 'SmartFit Admin', email: 'admin@smartfit.vn', role: 'admin', credits: 0 },
];

const shopsByOwnerEmail = {
  'owner_routine@smartfit.vn': {
    name: 'Routine Studio',
    description: 'Shop thời trang nam nữ hiện đại.',
  },
  'owner_sporty@smartfit.vn': {
    name: 'Sporty Lab',
    description: 'Shop đồ thể thao và jersey.',
  },
};

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

async function seedAccounts() {
  await mongoose.connect(MONGO_URI);
  console.log(`[seed:accounts] Connected to ${MONGO_URI}`);

  for (const account of accounts) {
    const user = await upsertUser(account);
    console.log(`[seed:accounts] ${account.role}: ${account.email} / ${PASSWORD}`);

    const shopData = shopsByOwnerEmail[account.email];
    if (shopData) {
      await Shop.findOneAndUpdate(
        { owner_id: user._id },
        {
          $set: {
            owner_id: user._id,
            name: shopData.name,
            description: shopData.description,
            logo: '',
            cover_image: '',
            status: 'active',
          },
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );
      console.log(`[seed:accounts] shop: ${shopData.name}`);
    }
  }

  await mongoose.disconnect();
  console.log('[seed:accounts] Done.');
}

seedAccounts().catch(async (error) => {
  console.error('[seed:accounts] Failed:', error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
