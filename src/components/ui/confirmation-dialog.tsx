import { ReactNode } from "react";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface OptionButton {
  text: string;
  action: () => unknown;
}

export const ConfirmationDialog = ({
  title,
  description,
  action,
  options,
}: {
  title: ReactNode;
  description?: ReactNode;
  action: () => void;
  options?: OptionButton[];
}) => {
  return (
    <DialogContent className="lg:max-w-120">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
      </DialogHeader>
      <DialogFooter className="justify-start! flex-row gap-2 md:gap-1">
        <DialogClose>
          <Button variant={"outline"}>Cancel</Button>
        </DialogClose>
        {options?.map((option) => (
          <DialogClose onClick={option.action} key={option.text}>
            <Button variant={"outline"}>{option.text}</Button>
          </DialogClose>
        ))}
        <DialogClose onClick={action}>
          <DialogClose>
            <Button>Continue</Button>
          </DialogClose>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};
