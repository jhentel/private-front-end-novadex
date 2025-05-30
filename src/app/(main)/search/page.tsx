// ######## Components 🧩 ########
import NoScrollLayout from "@/components/layouts/NoScrollLayout";
import PageHeading from "@/components/customs/headings/PageHeading";
import { generateMetadata } from "@/utils/generateMetadata";
import SearchPageClient from "@/components/customs/search/SearchPageClient";

export const metadata = generateMetadata({
  title: "Search",
});

export default async function SearchPage() {
  return (
    <NoScrollLayout>
      <SearchPageClient />
    </NoScrollLayout>
  );
}
