
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
import { cn } from "@/lib/utils";

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white" aria-disabled={pending}>
       {pending ? 'Connexion en cours...' : <><LogIn className="mr-2 h-4 w-4" /> Se connecter</>}
    </Button>
  );
}

export default function LoginPage() {
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-login-background bg-cover bg-center">
      <div className="absolute inset-0 bg-slate-900/50 z-0"/>
      <div className="relative z-10 w-full max-w-sm space-y-6 text-center">
        <div className="flex flex-col items-center">
            <div className="mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-white p-4 shadow-md">
                <Image src={OcpLogo} alt="SafeSteps Logo" width={128} height={128} className="h-full w-full object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-white drop-shadow-md">SafeSteps</h1>
            <p className="text-slate-200 mt-2">Votre Sécurité, Notre Priorité</p>
        </div>
        <Card className="bg-slate-800/50 backdrop-blur-sm border-white/20">
            <CardHeader>
                {/* Titles removed as requested */}
            </CardHeader>
            <CardContent>
                <form action={dispatch} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username" className="text-white">Nom d'utilisateur</Label>
                        <Input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="admin"
                        required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-white">Code d'accès</Label>
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
