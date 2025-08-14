import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./Dialog";
import { Button } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div>{children}</div>

        {footer && <DialogFooter>{footer}</DialogFooter>}

        {!footer && (
            <DialogFooter>
                <Button variant="outline" onClick={onClose}>Close</Button>
            </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
