import { FormField } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { memo } from "react";

const SortBySelect = memo(({ form }: { form: any }) => (
  <FormField
    control={form.control}
    name="sortBy"
    render={({ field }) => (
      <Select
        value={field.value as string}
        defaultValue={field.value as string}
        onValueChange={field.onChange}
        disabled={form.watch("isOg")}
      >
        <SelectTrigger className="h-[32px] max-w-[200px]">
          <span className="inline-block space-x-1 text-nowrap font-geistSemiBold text-fontColorPrimary">
            <span className="text-sm text-[#9191A4]">Sort by:</span>
            <SelectValue className="text-sm" />
          </span>
        </SelectTrigger>
        <SelectContent className="z-[1000]">
          <SelectItem value="marketCap" className="font-geistSemiBold">
            Market Cap
          </SelectItem>
          <SelectItem value="lastTrade" className="font-geistSemiBold">
            Last Trade
          </SelectItem>
          <SelectItem value="creationDate" className="font-geistSemiBold">
            Creation Time
          </SelectItem>
        </SelectContent>
      </Select>
    )}
  />
));

SortBySelect.displayName = "SortBySelect";

export default SortBySelect;
