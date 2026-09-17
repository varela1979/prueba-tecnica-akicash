import * as DialogPrimitive from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'motion/react';
import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

interface DialogContentProps extends ComponentProps<typeof DialogPrimitive.Content> {
  open: boolean;
}

export function DialogContent({ open, className, children, ...props }: DialogContentProps) {
  return (
    <AnimatePresence>
      {open && (
        <DialogPrimitive.Portal forceMount>
          <DialogPrimitive.Overlay asChild forceMount>
            <motion.div
              className="fixed inset-0 z-40 bg-ak-ink/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            />
          </DialogPrimitive.Overlay>
          <DialogPrimitive.Content asChild forceMount {...props}>
            <motion.div
              className={cn(
                'fixed left-1/2 top-1/2 z-50 w-[calc(100%-32px)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-6 shadow-2xl focus:outline-none sm:p-8',
                className,
              )}
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

export function DialogHeader({ children }: { children: ReactNode }) {
  return <div className="mb-5 flex items-start justify-between">{children}</div>;
}

export function DialogTitle({ children }: { children: ReactNode }) {
  return (
    <DialogPrimitive.Title className="text-xl font-bold text-ak-ink">{children}</DialogPrimitive.Title>
  );
}

export function DialogDescription({ children }: { children: ReactNode }) {
  return (
    <DialogPrimitive.Description className="mt-1 text-sm text-ak-muted">
      {children}
    </DialogPrimitive.Description>
  );
}

export const DialogClose = DialogPrimitive.Close;
