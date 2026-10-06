import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';
import { initialData } from './initialData.js';
import { UserModel, JuniorModel, CaseModel, AmountModel, HearingModel, SettingModel } from './models.js';

dotenv.config();

// Ensure reliable SRV DNS resolution on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Ignore if cannot override DNS
}

let isConnected = false;

export const isMongoConnected = () => isConnected;

/**
 * Seed MongoDB with initial collections if empty
 */
async function seedMongoDBIfEmpty() {
  try {
    const userCount = await UserModel.countDocuments();
    if (userCount === 0 && initialData.users?.length) {
      await UserModel.insertMany(initialData.users);
      console.log(`📦 Seeded ${initialData.users.length} default users into MongoDB`);
    }

    const juniorCount = await JuniorModel.countDocuments();
    if (juniorCount === 0 && initialData.juniors?.length) {
      await JuniorModel.insertMany(initialData.juniors);
      console.log(`📦 Seeded ${initialData.juniors.length} default juniors into MongoDB`);
    }

    const caseCount = await CaseModel.countDocuments();
    if (caseCount === 0 && initialData.cases?.length) {
      await CaseModel.insertMany(initialData.cases);
      console.log(`📦 Seeded ${initialData.cases.length} default cases into MongoDB`);
    }

    const amountCount = await AmountModel.countDocuments();
    if (amountCount === 0 && initialData.amounts?.length) {
      await AmountModel.insertMany(initialData.amounts);
      console.log(`📦 Seeded ${initialData.amounts.length} default amount entries into MongoDB`);
    }

    const hearingCount = await HearingModel.countDocuments();
    if (hearingCount === 0 && initialData.hearings?.length) {
      await HearingModel.insertMany(initialData.hearings);
      console.log(`📦 Seeded ${initialData.hearings.length} default hearings into MongoDB`);
    }

    const settingCount = await SettingModel.countDocuments();
    if (settingCount === 0 && initialData.settings) {
      const settingEntries = Object.entries(initialData.settings).map(([key, value]) => ({ key, value }));
      if (settingEntries.length) {
        await SettingModel.insertMany(settingEntries);
        console.log(`📦 Seeded default settings into MongoDB`);
      }
    }
  } catch (err) {
    console.error('⚠️ Error seeding MongoDB initial data:', err.message);
  }
}

/**
 * Connect to MongoDB Atlas Cloud Database
 */
export async function connectDB() {
  const rawUri = process.env.MONGODB_URI;

  if (!rawUri || !rawUri.trim()) {
    console.log('ℹ️  No MONGODB_URI provided in .env -> using local storage');
    isConnected = false;
    return false;
  }

  // Ensure URI has database name layer_erp
  let uri = rawUri.trim();
  if (uri.startsWith('"') && uri.endsWith('"')) {
    uri = uri.slice(1, -1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    isConnected = true;
    console.log(`=========================================`);
    console.log(`🍃 MongoDB connected successfully!`);
    console.log(`🌐 Cluster Host: ${conn.connection.host}`);
    console.log(`📁 Database: ${conn.connection.name}`);
    console.log(`=========================================`);

    // Auto-seed initial data to MongoDB if fresh cluster
    await seedMongoDBIfEmpty();

    return true;
  } catch (error) {
    isConnected = false;
    console.error(`=========================================`);
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (error.message.includes('whitelist') || error.name === 'MongooseServerSelectionError') {
      console.warn(`💡 Tip: Check MongoDB Atlas Network Access whitelist:`);
      console.warn(`   Add IP 0.0.0.0/0 (Allow Access from Anywhere) in MongoDB Atlas -> Security -> Network Access`);
    }
    console.log(`⚠️  Operating in resilient offline-first mode with local storage`);
    console.log(`=========================================`);
    return false;
  }
}
