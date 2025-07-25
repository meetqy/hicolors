"use client";

import { useState } from "react";
import { CardColor1 } from "@/components/card/color/1";
import { ColorPoint } from "@/components/palette/picker-colors";
import { getColorName } from "@/lib/nearest";
import dynamic from "next/dynamic";
import { ColorResult } from "react-color";

const ChromePicker = dynamic(() => import("react-color").then((mod) => mod.ChromePicker), { ssr: false });

export function Generator() {
  const [selectedColor, setSelectedColor] = useState<ColorResult>();

  const handleColorChange = (color: ColorResult) => {
    setSelectedColor(color);
  };

  const hex = selectedColor?.hex || "#ff0000";

  const colorPoint: ColorPoint = {
    id: 1,
    x: 0,
    y: 0,
    color: hex,
    name: getColorName(hex)?.name || "Unknown",
  };

  return (
    <div className="grid lg:grid-cols-2 gap-0 max-w-6xl mx-auto border rounded-lg overflow-hidden">
      {/* Color Picker Section */}
      <div className="bg-muted/50 p-12">
        <h2 className="text-2xl font-semibold mb-8 text-center">Pick Your Color</h2>
        <div className="flex justify-center" suppressHydrationWarning>
          <ChromePicker className="!w-full !shadow-none border !rounded-md overflow-hidden" color={hex} onChange={handleColorChange} disableAlpha />
        </div>
      </div>

      {/* Color Card Display */}
      <div className="bg-background p-12 border-l">
        <h2 className="text-2xl font-semibold mb-8 text-center">Generated Color Card</h2>
        <div className="flex justify-center">
          <div className="border w-full rounded-md overflow-hidden">
            <CardColor1 className="w-full" point={colorPoint} />
          </div>
        </div>
        <p className="text-center text-muted-foreground mt-8 text-sm">Click the download button on the card to save it as an image</p>
      </div>
    </div>
  );
}
