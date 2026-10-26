import * as React from "react";
export type ProgressBarColor = "coin" | "green" | "purple";
export type ProgressBarHeight = "sm" | "md";
export type ProgressBarProps = {
    value: number;
    color?: ProgressBarColor;
    height?: ProgressBarHeight;
    className?: string;
    "aria-label"?: string;
};
declare function ProgressBar({ value, color, height, className, "aria-label": ariaLabel, }: ProgressBarProps): React.JSX.Element;
export { ProgressBar };
