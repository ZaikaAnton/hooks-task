import { ReactNode } from "react";
import { useMediaQuery } from "../hook/useMediaQuery";

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

const buildMediaQueryString = (props: MediaQueryConfig): string => {
  const toKebabCase = (str: string) =>
    str.replace(/([A-Z])/g, "-$1").toLowerCase();

  const conditions = Object.entries(props).map(([key, value]) => {
    const mediaKey = key as keyof MediaQueryConfig;
    switch (mediaKey) {
      case "orientation":
        return `(${mediaKey}: ${value})`;
      case "minResolution":
      case "maxResolution":
        return `(${toKebabCase(mediaKey)}: ${value})`;
      case "minWidth":
      case "maxWidth":
      case "minHeight":
      case "maxHeight":
        return `(${toKebabCase(mediaKey)}: ${value}px)`;
      default:
        const exhaustiveCheck: never = mediaKey;
        throw new Error(`Unhandled media key: ${exhaustiveCheck}`);
    }
  });

  return conditions.join(" and ");
};

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
