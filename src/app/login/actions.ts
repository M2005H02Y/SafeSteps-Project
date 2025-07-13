
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const USERNAME = 'admin';
const PASSWORD = 'safesteps123';
const SESSION_COOKIE_NAME = 'safesteps_session';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (username === USERNAME && password === PASSWORD) {
      const sessionData = { user: username, loggedIn: true };
      cookies().set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });
      redirect('/dashboard');
    } else {
      return 'Identifiants incorrects. Veuillez réessayer.';
    }
  } catch (error) {
    if ((error as Error).message.includes('NEXT_REDIRECT')) {
        throw error;
    }
    console.error('Authentication error:', error);
    return 'Une erreur est survenue. Veuillez réessayer.';
  }
}

export async function logout() {
    cookies().delete(SESSION_COOKIE_NAME);
    redirect('/login');
}
