import React from "react";
import { ReactNode } from "react";
import { useMediaQuery } from "../hook/useMediaQuery"; // Подставьте путь к вашему хуку useMediaQuery

interface MediaProps {
  orientation?: "landscape" | "portrait";
  minResolution?: `${number}dppx` | number;
  maxResolution?: `${number}dppx` | number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  children: ReactNode | ((matches: boolean) => ReactNode);
}

type MediaQueryConfig = Omit<MediaProps, "children">;

// Утилита для создания строки медиа-запроса на основе переданных свойств
const buildMediaQueryString = (props: MediaQueryConfig): string => {
  const toKebabCase = (str: string) =>
    str.replace(/([A-Z])/g, "-$1").toLowerCase();

  const minMaxKeys = [
    "minWidth",
    "maxWidth",
    "minHeight",
    "maxHeight",
  ] as const;

  const conditions = Object.entries(props).map(([key, value]) => {
    const mediaKey = key as keyof MediaQueryConfig;
    switch (mediaKey) {
      case "orientation":
        return `(${mediaKey}: ${value})`;
      case "minResolution":
      case "maxResolution":
        return `(${toKebabCase(mediaKey)}: ${value})`;
      default:
        if (minMaxKeys.includes(mediaKey)) {
          return `(${toKebabCase(mediaKey)}: ${value}px)`;
        } else {
          throw new Error(`Assertion failed, mediaKey = ${mediaKey}`);
        }
    }
  });

  return conditions.join(" and ");
};

// Тип, который требует наличие хотя бы одного свойства из MediaProps (кроме children)
type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

type MediaQueryProps = RequireAtLeastOne<Omit<MediaProps, "children">> & {
  children: ReactNode | ((matches: boolean) => ReactNode);
};

export const MediaQuery: React.FC<MediaQueryProps> = ({
  children,
  ...props
}) => {
  const matches = useMediaQuery({
    query: buildMediaQueryString(props as MediaQueryConfig),
  });

  if (typeof children === "function") {
    return <>{children(matches)}</>;
  }
  return matches ? <>{children}</> : null;
};
