import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initialData } from './initialData.js';
import { isMongoConnected } from './connectDB.js';
import { UserModel, JuniorModel, CaseModel, AmountModel, HearingModel, SettingModel } from './models.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure database file exists
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
}

// Model lookup map
const getModelForCollection = (collectionName) => {
  switch (collectionName) {
    case 'users': return UserModel;
    case 'juniors': return JuniorModel;
    case 'cases': return CaseModel;
    case 'amounts': return AmountModel;
    case 'hearings': return HearingModel;
    case 'settings': return SettingModel;
    default: return null;
  }
};

/**
 * Read the entire database from local cache
 */
export const readDB = () => {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database file, restoring initial data:', err);
    return initialData;
  }
};

/**
 * Write the entire database safely to local cache
 */
export const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing to database file:', err);
    return false;
  }
};

/**
 * Sync MongoDB to Local Cache on Startup
 */
export const syncFromMongo = async () => {
  if (!isMongoConnected()) return;
  try {
    const [users, juniors, cases, amounts, hearings, settings] = await Promise.all([
      UserModel.find({}).lean(),
      JuniorModel.find({}).lean(),
      CaseModel.find({}).lean(),
      AmountModel.find({}).lean(),
      HearingModel.find({}).lean(),
      SettingModel.find({}).lean()
    ]);

    const db = readDB();
    if (users.length) db.users = users;
    if (juniors.length) db.juniors = juniors;
    if (cases.length) db.cases = cases;
    if (amounts.length) db.amounts = amounts;
    if (hearings.length) db.hearings = hearings;
    
    if (settings.length) {
      db.settings = settings.reduce((acc, s) => {
        acc[s.key] = s.value;
        return acc;
      }, {});
    }

    writeDB(db);
    console.log('🔄 Synced all data from MongoDB Atlas into active runtime database');
  } catch (err) {
    console.error('Error syncing from MongoDB:', err.message);
  }
};

/**
 * Collection Helpers
 */
export const getCollection = (name) => {
  const db = readDB();
  return db[name] || [];
};

export const setCollection = (name, items) => {
  const db = readDB();
  db[name] = items;
  writeDB(db);

  // Sync to MongoDB
  if (isMongoConnected()) {
    const Model = getModelForCollection(name);
    if (Model) {
      Model.deleteMany({}).then(() => Model.insertMany(items)).catch(e => console.error(`MongoDB sync error on ${name}:`, e.message));
    }
  }
  return db[name];
};

export const findById = (collectionName, id) => {
  const items = getCollection(collectionName);
  return items.find((item) => item.id === id);
};

export const insert = (collectionName, item) => {
  const db = readDB();
  if (!db[collectionName]) db[collectionName] = [];
  db[collectionName].unshift(item);
  writeDB(db);

  // Write directly to MongoDB
  if (isMongoConnected()) {
    const Model = getModelForCollection(collectionName);
    if (Model) {
      Model.create(item)
        .then(() => console.log(`💾 Saved new document in MongoDB [${collectionName}]: ${item.id || ''}`))
        .catch(e => console.error(`MongoDB insert error [${collectionName}]:`, e.message));
    }
  }

  return item;
};

export const update = (collectionName, id, updates) => {
  const db = readDB();
  if (!db[collectionName]) return null;
  const index = db[collectionName].findIndex((item) => item.id === id);
  if (index === -1) return null;

  db[collectionName][index] = { ...db[collectionName][index], ...updates };
  writeDB(db);

  // Update in MongoDB
  if (isMongoConnected()) {
    const Model = getModelForCollection(collectionName);
    if (Model) {
      Model.findOneAndUpdate({ id }, { $set: updates }, { new: true })
        .then(() => console.log(`💾 Updated document in MongoDB [${collectionName}]: ${id}`))
        .catch(e => console.error(`MongoDB update error [${collectionName}]:`, e.message));
    }
  }

  return db[collectionName][index];
};

export const remove = (collectionName, id) => {
  const db = readDB();
  if (!db[collectionName]) return false;
  const initialLength = db[collectionName].length;
  db[collectionName] = db[collectionName].filter((item) => item.id !== id);
  writeDB(db);

  // Remove from MongoDB
  if (isMongoConnected()) {
    const Model = getModelForCollection(collectionName);
    if (Model) {
      Model.deleteOne({ id })
        .then(() => console.log(`🗑️ Deleted document from MongoDB [${collectionName}]: ${id}`))
        .catch(e => console.error(`MongoDB delete error [${collectionName}]:`, e.message));
    }
  }

  return db[collectionName].length < initialLength;
};

export const resetDatabase = () => {
  writeDB(initialData);
  if (isMongoConnected()) {
    Promise.all([
      UserModel.deleteMany({}).then(() => UserModel.insertMany(initialData.users || [])),
      JuniorModel.deleteMany({}).then(() => JuniorModel.insertMany(initialData.juniors || [])),
      CaseModel.deleteMany({}).then(() => CaseModel.insertMany(initialData.cases || [])),
      AmountModel.deleteMany({}).then(() => AmountModel.insertMany(initialData.amounts || [])),
      HearingModel.deleteMany({}).then(() => HearingModel.insertMany(initialData.hearings || []))
    ]).catch(e => console.error('MongoDB reset error:', e.message));
  }
  return initialData;
};
