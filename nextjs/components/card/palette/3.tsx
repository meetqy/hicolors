"use client";

import Color from "color";
import { withSave } from "../with-save";
import { cn } from "@/lib/utils";
import { ColorPointsOverlay } from "@/components/color-points-overlay";
import { CardPaletteProps } from "./common";

const CardPalette3Base = ({ points, className, style, image }: CardPaletteProps) => {
  return (
    <div style={style} className={cn("w-[375px] flex flex-col aspect-square relative bg-background", className)}>
      <div className="absolute text-xl right-4 top-2 font-serif italic font-bold opacity-80 z-10 text-muted-foreground">HiColors</div>
      <div className="w-full h-[70%] bg-muted">
        <ColorPointsOverlay className="size-full z-50 top-5 scale-110" points={points} image={image} />
      </div>
      <div className="flex relative z-30 flex-1">
        {points.map((item) => {
          const color = Color(item.color);
          return (
            <div
              key={item.id}
              className="flex-1 flex items-center justify-end font-mono text-sm px-4"
              style={{
                backgroundColor: color.hex(),
                color: color.isDark() ? "#fff" : "#000",
                writingMode: "vertical-rl",
              }}
            >
              {color.hex().split("").reverse().join("")}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const CardPalette3 = withSave(CardPalette3Base);
CardPalette3.displayName = "CardPalette3";
