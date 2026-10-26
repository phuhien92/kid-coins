import type { Preview } from "@storybook/react";
import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "cream",
      values: [
        { name: "cream", value: "var(--color-cream)" },
        { name: "white", value: "#ffffff" },
        { name: "ink", value: "var(--color-ink)" },
      ],
    },
    viewport: {
      viewports: {
        mobile: { name: "Mobile", styles: { width: "375px", height: "812px" } },
        tablet: { name: "Tablet", styles: { width: "768px", height: "1024px" } },
        desktop: { name: "Desktop", styles: { width: "1280px", height: "800px" } },
      },
      defaultViewport: "desktop",
    },
    controls: { matchers: { color: /(color)$/i } },
    layout: "centered",
  },
};

export default preview;
