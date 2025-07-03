"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type QRCodeProps = {
  type: 'workstation' | 'standard' | 'form';
  id: string;
  data?: any;
};

export default function QRCode({ type, id, data }: QRCodeProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const devHostnameOverride = process.env.NEXT_PUBLIC_DEV_HOSTNAME;
      const isDevWithOverride = process.env.NODE_ENV === 'development' && devHostnameOverride;

      let baseUrl = '';
      if (isDevWithOverride) {
        baseUrl = devHostnameOverride;
      } else {
        const { protocol, hostname, port } = window.location;
        baseUrl = `${protocol}//${hostname}${port ? `:${port}` : ''}`;
      }

      let publicUrl = `${baseUrl}/public/${type}/${id}`;

      if (data) {
        try {
          const encodedData = btoa(JSON.stringify(data));
          // We need to encode the base64 string to make it URL-safe
          publicUrl += `?data=${encodeURIComponent(encodedData)}`;
        } catch (error) {
          console.error("Could not encode data for QR code", error);
        }
      }

      const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(publicUrl)}`;
      setQrCodeUrl(apiUrl);
    }
  }, [type, id, data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accès rapide</CardTitle>
        <CardDescription>Scannez pour afficher la page publique sur un autre appareil.</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center items-center">
        {qrCodeUrl ? (
          <Image
            src={qrCodeUrl}
            alt="Code QR pour la page publique"
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
