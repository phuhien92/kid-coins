import * as React from "react";
export type ToastProps = {
    message: string;
    visible: boolean;
    onDismiss?: () => void;
    className?: string;
};
declare function Toast({ message, visible, onDismiss, className }: ToastProps): React.JSX.Element;
export { Toast };
