import * as React from "react";
export type CoinIconSize = "sm" | "md" | "lg";
export type CoinIconProps = {
    size?: CoinIconSize;
    className?: string;
};
declare function CoinIcon({ size, className }: CoinIconProps): React.JSX.Element;
export { CoinIcon };
