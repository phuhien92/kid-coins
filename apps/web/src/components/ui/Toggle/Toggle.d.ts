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
declare function Toggle({ checked, defaultChecked, onChange, disabled, label, id, className, }: ToggleProps): React.JSX.Element;
export { Toggle };
