import * as React from "react";
export type InputProps = {
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    onSubmit?: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
};
declare function Input({ value, defaultValue, onChange, onSubmit, placeholder, disabled, className, }: InputProps): React.JSX.Element;
export { Input };
