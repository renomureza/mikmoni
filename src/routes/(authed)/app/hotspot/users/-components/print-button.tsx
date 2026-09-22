import { PopoverTriggerProps } from "@base-ui/react";
import { LoaderIcon } from "lucide-react";
import { useState } from "react";
import Input from "~/components/input";
import Popover from "~/components/popover";
import useDebounceValue from "~/hooks/use-debounce-value";
import { useGetVoucherTemplatesInfiniteQuery } from "~/serverfns/vouer-templates";

function PrintTemplateLists({
  onClickTemplate,
}: {
  onClickTemplate: (id: number) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounceValue(searchQuery);
  const templatesQuery = useGetVoucherTemplatesInfiniteQuery({
    query: debouncedSearchQuery || undefined,
  });

  return (
    <div className="flex w-full flex-col">
      <div className="border-b p-1 pb-2">
        <Input
          placeholder="Search Template..."
          value={searchQuery}
          autoComplete="off"
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
        />
      </div>
      <div className="flex flex-col gap-0.5 pt-1">
        {templatesQuery.isPending ? (
          <div className="flex items-center justify-center py-10">
            <LoaderIcon className="size-4 animate-spin" />
          </div>
        ) : !templatesQuery.data?.length ? (
          <div className="py-10 text-center font-medium">No Results Found</div>
        ) : (
          <>
            {templatesQuery.data.map((template) => (
              <button
                key={template.id}
                type="button"
                className="h-8 rounded-lg px-3 text-left font-medium hover:bg-neutral-100"
                onClick={() => {
                  onClickTemplate(template.id);
                }}
              >
                {template.name}
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default function PrintButton({
  onClickTemplate,
  ...props
}: PopoverTriggerProps & { onClickTemplate: (id: number) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover popoverTrigger={props} root={{ open, onOpenChange: setOpen }}>
      <PrintTemplateLists
        onClickTemplate={(templateId) => {
          onClickTemplate(templateId);
          setOpen(false);
        }}
      />
    </Popover>
  );
}
