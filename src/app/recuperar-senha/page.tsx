import type { Metadata } from "next";
import AuthPage from "@/components/AuthPage";

export const metadata: Metadata = { title: "Recuperar senha | Clube WPI3D" };
export default function RecuperarPage() { return <AuthPage mode="recuperar" />; }
