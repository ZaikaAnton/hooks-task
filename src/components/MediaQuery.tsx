import React from "react";
import { ReactNode } from "react";
import { useMediaQuery } from "../hook/useMediaQuery"; // Подставьте путь к вашему хуку useMediaQuery

interface MediaProps {
  orientation?: "landscape" | "portrait";
  minResolution?: `${number}dppx`;
  maxResolution?: `${number}dppx`;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  children: ReactNode | ((matches: boolean) => ReactNode);
}

type MediaQueryConfig = Omit<MediaProps, "children">;

// Утилита для создания строки медиа-запроса на основе переданных свойств
const buildMediaQueryString = (props: Partial<MediaQueryConfig>): string => {
  const toKebabCase = (str: string) =>
    str.replace(/([A-Z])/g, "-$1").toLowerCase();

  const exhaustiveCheck = (value: never): never => {
    throw new Error(`Unhandled case: ${value}`);
  };

  const conditions = Object.entries(props).map(([key, value]) => {
    const mediaKey = key as keyof MediaQueryConfig;
    switch (mediaKey) {
      case "orientation":
        return `(${mediaKey}: ${value})`;
      case "minResolution":
      case "maxResolution":
        return `(${toKebabCase(mediaKey)}: ${value})`;
      case "minWidth":
        return `(min-width: ${value}px)`;
      case "maxWidth":
        return `(max-width: ${value}px)`;
      case "minHeight":
        return `(min-height: ${value}px)`;
      case "maxHeight":
        return `(max-height: ${value}px)`;
      default: {
        const n: never = mediaKey;
        throw new Error(`Assertion failed, mediaKey = ${n}`);
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
  const matches = useMediaQuery({ query: buildMediaQueryString(props) });

  if (typeof children === "function") {
    return <>{children(matches)}</>;
  }
  return matches ? <>{children}</> : null;
};
