
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = `
  ERREUR DE CONFIGURATION SUPABASE : Clés manquantes.

  L'application n'a pas pu trouver les clés de connexion pour Supabase.
  Veuillez vérifier les points suivants :

  1.  Assurez-vous qu'un fichier nommé ".env.local" existe à la racine de votre projet (au même niveau que package.json).

  2.  Vérifiez que le contenu du fichier .env.local ressemble à ceci, avec vos vraies clés :

      NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
      NEXT_PUBLIC_SUPABASE_ANON_KEY=eyyyyyyyyyyy...
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
      NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=...

  3.  Après avoir créé ou modifié le fichier, essayez de redémarrer le serveur de développement.

  Consultez le guide ARCHITECTURE.md pour des instructions détaillées.
  `;
  throw new Error(errorMessage);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
