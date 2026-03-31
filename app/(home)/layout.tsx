import HomeLayout from "@/components/layouts/HomeLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <HomeLayout>{children}</HomeLayout>;
}
