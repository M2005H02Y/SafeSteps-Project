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
        // In some cloud dev environments (like Cloud Workstations), the hostname is a proxy
        // and the port should not be included in the public URL.
        if (hostname.includes('cloudworkstations.dev')) {
          baseUrl = `${protocol}//${hostname}`;
        } else {
          baseUrl = `${protocol}//${hostname}${port ? `:${port}` : ''}`;
        }
      }

      let url = `${baseUrl}/public/${type}/${id}`;

      try {
        // Create a deep copy to avoid mutating the original data object
        const dataForQr = JSON.parse(JSON.stringify(data));
        
        // Remove potentially large fields that cause the "Data too long" error.
        // The public page will gracefully handle their absence.
        delete dataForQr.image;
        delete dataForQr.files;
        delete dataForQr.tableData;

        if(Object.keys(dataForQr).length > 0) {
            const encodedData = btoa(JSON.stringify(dataForQr));
            url += `?data=${encodeURIComponent(encodedData)}`;
        }
      } catch (error) {
        // If encoding fails, log it, but don't crash.
        // The QR code will just link to the public page without data.
        console.error("Could not encode data for QR code. It might still be too large.", error);
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
