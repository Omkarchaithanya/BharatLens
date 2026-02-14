import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get } from 'firebase/database';
import { getStorage, ref as storageRef, uploadString } from 'firebase/storage';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const storage = getStorage(app);

export async function saveBusiness(businessData: any) {
    const businessRef = ref(database, `businesses/${businessData.id}`);
    await set(businessRef, businessData);
}

export async function uploadVideo(videoBlob: Blob, businessId: string) {
    const videoRef = storageRef(storage, `videos/${businessId}.mp4`);
    await uploadString(videoRef, videoBlob, 'data_url');
}