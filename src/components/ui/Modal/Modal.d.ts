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
declare function Modal({ open, onClose, children, width, className, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby }: ModalProps): React.JSX.Element;
export { Modal };
