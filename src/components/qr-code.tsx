"use client";

import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

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

  const handleDownload = () => {
    const canvas = document.getElementById(`qr-canvas-${id}`) as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream"); // This forces the download
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `${type}-${id}-qrcode.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accès rapide</CardTitle>
        <CardDescription>Scannez ou téléchargez le code QR pour un accès rapide.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-4">
        {publicUrl ? (
          <>
            <QRCodeCanvas
              id={`qr-canvas-${id}`}
              value={publicUrl}
              size={150}
              bgColor={"#ffffff"}
              fgColor={"#000000"}
              level={"L"}
              includeMargin={false}
            />
            <Button variant="outline" onClick={handleDownload} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Télécharger
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 w-full">
            <Skeleton className="h-[150px] w-[150px]" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
