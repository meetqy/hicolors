"use client";
import { cn, getAssetUrl } from "@/lib/utils";
import { timeAgo } from "@/lib/time-utils";
import { PaletteListItem } from "@/query/palette";
import Link from "next/link";

interface PaletteCardProps {
  palette: PaletteListItem;
}

export const PaletteCard = ({ palette }: PaletteCardProps) => {
  const bgColor = palette.points[0].color;

  return (
    <div className="relative">
      <Link
        href={`/palettes/${palette.documentId}`}
        className="group"
        style={{
          perspective: "1000px",
          transformStyle: "preserve-3d",
        }}
      >
        <div className="rounded-md relative">
          <div
            className="absolute bottom-0 left-1/2 w-full h-full rounded-md -translate-x-1/2 transition-all duration-300 group-hover:w-56 group-hover:h-56 group-hover:rounded-full group-hover:bottom-[-85px] group-hover:rotate-x-[80deg]"
            style={{
              backgroundColor: bgColor,
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            }}
          />
          {/* 额外的流畅背景层 */}
          <div style={{ backgroundColor: bgColor }} className="absolute inset-0 rounded-md opacity-100 group-hover:opacity-0 transition-opacity duration-300" />
          <img
            src={getAssetUrl(palette.image.url, 320)}
            srcSet={`
              ${getAssetUrl(palette.image.url, 320)} 1x,
              ${getAssetUrl(palette.image.url, 640)} 2x,
              ${getAssetUrl(palette.image.url, 960)} 3x
            `}
            alt={palette.name}
            className={cn(
              "w-full z-10 relative aspect-square object-contain transition-transform duration-300 group-hover:scale-130 group-hover:translate-y-[-60px] group-hover:rotate-x-[15deg] group-hover:drop-shadow-2xl"
            )}
          />
          <div className="flex w-full rounded-b-md overflow-hidden absolute bottom-0 left-0">
            {palette.points.map((point, index) => {
              return <div className="w-full h-3" key={index} style={{ backgroundColor: point.color }}></div>;
            })}
          </div>
        </div>
      </Link>
      <div className="py-2 flex justify-between items-center">
        <div>
          <h2 className="capitalize font-medium">{palette.name}</h2>
          <Link href={`/category/${palette.category}`} className="text-muted-foreground line-clamp-1 hover:text-foreground hover:underline capitalize text-sm">
            {palette.category}
          </Link>
        </div>
        <time suppressHydrationWarning className="text-sm text-muted-foreground shrink-0">
          {timeAgo(palette.createdAt)}
        </time>
      </div>
    </div>
  );
};
