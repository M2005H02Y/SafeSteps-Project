import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const storage = getStorage(app);

/**
 * Uploads a file to Firebase Storage.
 * @param file The file to upload.
 * @param path The path where the file will be stored in the bucket (e.g., 'workstations/image.jpg').
 * @returns A promise that resolves with the public download URL of the file.
 */
export async function uploadFile(file: File, path: string): Promise<string> {
  // A check to ensure firebase is configured before trying to upload
  if (!firebaseConfig.apiKey) {
    throw new Error("Firebase config is not set. Please update .env.local file.");
  }
  
  const storageRef = ref(storage, path);
  
  try {
    // Upload the file to the specified path
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the public URL of the uploaded file
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file:", error);
    // Depending on your error handling strategy, you might want to re-throw the error
    // or return a specific error message.
    throw new Error("File upload failed.");
  }
}
