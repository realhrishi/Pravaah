import {inter} from "@/lib/fronts";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";
import { AlertToastListener } from "@/components/AlertToastListener";

export const metadata = {
  title: "Pravaah",
  description: "Hyper-local flash flood prediction for hilly-region villages",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AlertToastListener />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
