export const metadata = {
  title: 'Epicycles Collaborative',
  description: 'Real-time collaborative Fourier epicycles playground',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui' }}>{children}</body>
    </html>
  );
}