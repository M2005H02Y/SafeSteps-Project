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

// Helper function to safely encode a UTF-8 string to Base64
function utf8_to_b64(str: string): string {
    return btoa(unescape(encodeURIComponent(str)));
}

export default function QRCode({ type, id, data }: QRCodeProps) {
  const [publicUrl, setPublicUrl] = useState<string | null>(null);

  useEffect(() => {
    // This component runs only on the client, so `window` is safe to use.
    if (typeof window !== 'undefined' && data) {
      const { protocol, hostname } = window.location;
      
      const isCloudDevEnv = hostname.includes('cloudworkstations.dev') || hostname.includes('app.goog');
      const baseUrl = isCloudDevEnv ? `${protocol}//${hostname}` : window.location.origin;

      let url = `${baseUrl}/public/${type}/${id}`;

      try {
        const dataForQr = JSON.parse(JSON.stringify(data));
        
        if(Object.keys(dataForQr).length > 0) {
            const jsonString = JSON.stringify(dataForQr);
            const encodedData = utf8_to_b64(jsonString);
            url += `?data=${encodeURIComponent(encodedData)}`;
        }
      } catch (error) {
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
