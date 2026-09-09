import { MongoClient, Db } from 'mongodb';

let clientPromise: Promise<MongoClient> | null = null;

function getClientPromise(): Promise<MongoClient> {
  if (clientPromise) return clientPromise;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Missing environment variable: "MONGODB_URI".');
  }

  if (process.env.NODE_ENV === 'development') {
    const g = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };
    if (!g._mongoClientPromise) {
      g._mongoClientPromise = new MongoClient(uri).connect();
    }
    clientPromise = g._mongoClientPromise;
  } else {
    clientPromise = new MongoClient(uri).connect();
  }

  return clientPromise;
}

const clientProxy = { then: (...args: Parameters<Promise<MongoClient>['then']>) => getClientPromise().then(...args) };
export default clientProxy;

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(process.env.MONGODB_DB || 'adventures');
}
