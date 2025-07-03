"use client";

import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type QRCodeProps = {
  type: 'workstation' | 'standard' | 'form';
  id: string;
  data?: any;
};

export default function QRCode({ type, id, data }: QRCodeProps) {
  const [publicUrl, setPublicUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && data) {
      const devHostnameOverride = process.env.NEXT_PUBLIC_DEV_HOSTNAME;
      const isDevWithOverride = process.env.NODE_ENV === 'development' && devHostnameOverride;

      let baseUrl = '';
      if (isDevWithOverride) {
        baseUrl = devHostnameOverride;
      } else {
        const { protocol, hostname, port } = window.location;
        baseUrl = `${protocol}//${hostname}${port ? `:${port}` : ''}`;
      }

      let url = `${baseUrl}/public/${type}/${id}`;

      try {
        const encodedData = btoa(JSON.stringify(data));
        url += `?data=${encodeURIComponent(encodedData)}`;
      } catch (error) {
        console.error("Could not encode data for QR code", error);
      }
      
      setPublicUrl(url);
    }
  }, [type, id, data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accès rapide</CardTitle>
        <CardDescription>Scannez pour afficher la page publique sur un autre appareil.</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center items-center">
        {publicUrl ? (
          <QRCodeCanvas
            value={publicUrl}
            size={150}
            bgColor={"#ffffff"}
            fgColor={"#000000"}
            level={"L"}
            includeMargin={false}
          />
        ) : (
          <Skeleton className="h-[150px] w-[150px]" />
        )}
      </CardContent>
    </Card>
  );
}
