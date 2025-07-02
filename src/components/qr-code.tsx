"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function QRCode() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pageUrl = window.location.href;
      const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(pageUrl)}`;
      setQrCodeUrl(apiUrl);
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accès rapide</CardTitle>
        <CardDescription>Scannez pour afficher cette page sur n'importe quel appareil.</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center items-center">
        {qrCodeUrl ? (
          <Image
            src={qrCodeUrl}
            alt="Code QR pour cette page"
            width={150}
            height={150}
            unoptimized
          />
        ) : (
          <Skeleton className="h-[150px] w-[150px]" />
        )}
      </CardContent>
    </Card>
  );
}
