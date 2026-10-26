import * as React from "react";
export type AvatarSize = "sm" | "md" | "lg";
export type AvatarColor = "mint" | "lemon" | "peach" | "coral" | "sky" | "lav" | "coin";
export type AvatarProps = React.ComponentPropsWithoutRef<"div"> & {
    size?: AvatarSize;
    color?: AvatarColor;
};
declare const Avatar: React.ForwardRefExoticComponent<Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "ref"> & {
    size?: AvatarSize;
    color?: AvatarColor;
} & React.RefAttributes<HTMLDivElement>>;
export { Avatar };
