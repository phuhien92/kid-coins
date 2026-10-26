import * as React from "react";
export type ToggleProps = {
    checked?: boolean;
    defaultChecked?: boolean;
    onChange?: (checked: boolean) => void;
    disabled?: boolean;
    label?: string;
    id?: string;
    className?: string;
};
/**
 * Accessible toggle switch built on Base UI Switch.
 * Handles all keyboard/ARIA automatically; styling maps to design tokens.
 */
declare function Toggle({ checked, defaultChecked, onChange, disabled, label, id, className, }: ToggleProps): React.JSX.Element;
export { Toggle };
