import React from "react";
import { ReactNode } from "react";
import { useMediaQuery } from "../hook/useMediaQuery"; // Подставьте путь к вашему хуку useMediaQuery

interface MediaProps {
  orientation?: string;
  minResolution?: `${number}dppx`;
  maxResolution?: `${number}dppx`;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  children: ReactNode | ((matches: boolean) => ReactNode);
}

// Утилита для создания строки медиа-запроса на основе переданных свойств
const buildMediaQueryString = (props: Partial<MediaProps>): string | null => {
  const conditions = Object.keys(props)
    .filter(
      (key) =>
        key !== "children" && props[key as keyof MediaProps] !== undefined
    )
    .map((key) => {
      const value = props[key as keyof MediaProps];
      switch (key) {
        case "orientation":
          return `(${key}: ${value})`;
        case "minResolution":
        case "maxResolution":
          return `(${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value})`;
        default:
          return `(${key
            .replace(/([A-Z])/g, "-$1")
            .toLowerCase()}: ${value}px)`;
      }
    });

  return conditions.length ? conditions.join(" and ") : null;
};

export const MediaQuery: React.FC<Partial<MediaProps>> = (props) => {
  const mediaQueryString = buildMediaQueryString(props);

  const matches = useMediaQuery({ query: mediaQueryString || "" });

  if (typeof props.children === "function") {
    return <>{props.children(matches)}</>;
  }
  return matches ? <>{props.children}</> : null;
};
