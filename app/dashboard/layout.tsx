import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { getProfile } from "@/lib/data";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="mx-auto flex w-full max-w-container-max flex-1">
        <Sidebar userName={profile?.first_name ?? "משתמש"} />
        <main className="w-full flex-1 px-5 py-8 md:px-8">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
