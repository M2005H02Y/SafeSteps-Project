
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { authenticate } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, LogIn } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";
import OcpLogo from '@/app/ocplogo.png';

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" aria-disabled={pending}>
       {pending ? 'Connexion en cours...' : <><LogIn className="mr-2 h-4 w-4" /> Se connecter</>}
    </Button>
  );
}

export default function LoginPage() {
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-white shadow-md p-4">
                <Image src={OcpLogo} alt="SafeSteps Logo" width={96} height={96} className="h-full w-full object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">SafeSteps</h1>
            <p className="text-muted-foreground">Procédures & Sécurité</p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Connexion</CardTitle>
                <CardDescription>Veuillez entrer vos identifiants pour accéder à l'application.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={dispatch} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Nom d'utilisateur</Label>
                        <Input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="admin"
                        required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Code d'accès</Label>
                        <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        />
                    </div>

                    {errorMessage && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Erreur de connexion</AlertTitle>
                        <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                    )}
                    
                    <LoginButton />
                </form>
            </CardContent>
        </Card>
      </div>
    </main>
  );
}
