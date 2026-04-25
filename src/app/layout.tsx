import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Provider } from '@/components/ui/provider';
import { Toaster } from '@/components/ui/toaster';
import HeaderBar from '@/components/HeaderBar';
import { Container } from '@chakra-ui/react';

export const metadata: Metadata = {
  title: 'Xteink Flash Tools',
  description: 'Web based tool to help flash the Xteink device',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Provider>
          <HeaderBar />
          <Container as="main" maxW="3xl" mt={5} mb={5}>
            {children}
          </Container>
          <Toaster />
        </Provider>
      </body>
    </html>
  );
}
