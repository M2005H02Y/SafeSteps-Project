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
    // This component runs only on the client, so `window` is safe to use.
    if (typeof window !== 'undefined' && data) {
      const { protocol, hostname } = window.location;
      
      // For cloud development environments, the public URL is just the protocol and hostname.
      // For local development, it would include the port.
      const isCloudDevEnv = hostname.includes('cloudworkstations.dev') || hostname.includes('app.goog');
      const baseUrl = isCloudDevEnv ? `${protocol}//${hostname}` : window.location.origin;

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
        console.error("Could not encode data for QR code.", error);
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
