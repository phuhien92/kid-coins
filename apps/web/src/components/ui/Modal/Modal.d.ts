import * as React from "react";
export type ModalWidth = "sm" | "md";
export type ModalProps = {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    width?: ModalWidth;
    className?: string;
    "aria-label"?: string;
    "aria-labelledby"?: string;
};
/**
 * App-wide modal dialog built on Base UI Dialog.
 * Handles focus trap, scroll lock, Escape key, and backdrop dismiss automatically.
 * Framer Motion entrance is replaced by CSS data-attribute transitions supplied
 * by Base UI (data-starting-style / data-ending-style).
 */
declare function Modal({ open, onClose, children, width, className, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby, }: ModalProps): React.JSX.Element;
declare namespace Modal {
    var Close: typeof ModalClose;
    var Title: typeof ModalTitle;
}
/**
 * Convenience close button — renders inside a Modal panel.
 */
declare function ModalClose({ children, className, }: {
    children?: React.ReactNode;
    className?: string;
}): React.JSX.Element;
/**
 * Renders a styled <Dialog.Title> so consumers don't need to import Base UI directly.
 */
declare function ModalTitle({ children, className, }: {
    children: React.ReactNode;
    className?: string;
}): React.JSX.Element;
export { Modal };
