// ######## Components 🧩 ########
import EmptyState from "@/components/customs/EmptyState";
import MainLayout from "@/components/layouts/MainLayout";

export default function NotFoundPage() {
  return (
    <MainLayout>
      <div className="flex w-full flex-grow flex-col items-center justify-center bg-[#080811]">
        <EmptyState state="404" />
      </div>
    </MainLayout>
  );
}
