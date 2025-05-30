import NoScrollLayout from "@/components/layouts/NoScrollLayout";
import PageHeading from "@/components/customs/headings/PageHeading";
import ComingSoon from "@/components/customs/ComingSoon";

const PointsClient = () => {
  return (
    <NoScrollLayout>
      <div className="flex w-full items-center justify-between px-4 pb-2 pt-4 lg:px-0 lg:pt-3">
        <div className="flex items-center gap-x-3">
          <PageHeading
            title="Points"
            description="Analyse your points accumulation."
            line={1}
            showDescriptionOnMobile
          />
        </div>
      </div>
      <span className="hidden">Coming soon... 🪂</span>
      <div className="flex w-full flex-grow flex-col items-center justify-center">
        <ComingSoon customText="Your points are being taken into consideration based off volume metrics since December 2024." />
      </div>
    </NoScrollLayout>
  );
};

export default PointsClient;
