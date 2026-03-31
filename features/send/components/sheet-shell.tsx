import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import type { PropsWithChildren } from "react";

type SheetShellProps = PropsWithChildren<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  className?: string;
  showHandle?: boolean;
}>;

export default function SheetShell({
  open,
  onOpenChange,
  title,
  description,
  className,
  children,
  showHandle = false,
}: SheetShellProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} modal dismissible={true}>
      <DrawerContent className={cn("border-none bg-[#06070b] text-white", className)}>
        <div className="relative mx-auto flex max-h-[78vh] w-full max-w-md flex-col px-5 pb-8 pt-5">
          {showHandle ? (
            <div className="mx-auto mb-5 h-1.5 w-14 rounded-full bg-white/50" />
          ) : null}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-5 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-zinc-300 transition hover:bg-white/20"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="mb-5 pt-2 text-center">
            <DrawerTitle className="text-[30px] font-semibold text-white">{title}</DrawerTitle>
            {description ? (
              <DrawerDescription className="mx-auto mt-3 max-w-[280px] text-sm text-zinc-400">
                {description}
              </DrawerDescription>
            ) : null}
          </div>
          <div className="overflow-y-auto pr-1">{children}</div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
