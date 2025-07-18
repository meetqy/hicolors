"use client";
import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import PickerColors, { type ColorPoint } from "./picker-colors";
import Color from "color";
import { LuUpload, LuX } from "react-icons/lu";
import { getColorName } from "@/lib/nearest";
import { Button } from "../ui/button";

type GeneratorProps = { initialPoints?: ColorPoint[]; onColorsChangeEnter?: (points: ColorPoint[]) => void; initImage?: string; onImageChange?: (image: string) => void };

export function Generator({ initialPoints = [], onColorsChangeEnter, initImage, onImageChange }: GeneratorProps) {
  const [image, setImage] = useState<string>();
  const [colors, setColors] = useState<ColorPoint[]>(initialPoints || []);

  useEffect(() => {
    if (initImage) {
      setImage(initImage);
    }
  }, [initImage]);

  useEffect(() => {
    onColorsChangeEnter?.(
      colors.map((item) => {
        return {
          ...item,
          name: getColorName(Color(item.color).hex())?.name,
        };
      })
    );
  }, [colors, onColorsChangeEnter]);

  const deleteColor = useCallback((id: number) => {
    setColors((prev) => prev.filter((color) => color.id !== id));
  }, []);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage = e.target?.result as string;
          setImage(newImage);
          setColors([]);
          onImageChange?.(newImage);
        };
        reader.readAsDataURL(file);
      }
    },
    [setImage, setColors, onImageChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    multiple: false,
    noClick: !!image, // 当有图片时禁用点击，只允许拖拽
  });

  return (
    <div className="px-4 xl:px-0">
      <div
        {...getRootProps()}
        className={`mx-auto flex w-full max-w-screen-lg flex-col overflow-hidden rounded-md border lg:flex-row relative ${isDragActive ? "ring-2 ring-primary ring-offset-2" : ""}`}
      >
        <input {...getInputProps()} />
        {isDragActive && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-primary/10 backdrop-blur-sm rounded-md">
            <div className="text-center">
              <p className="text-lg font-medium">Drop to replace image</p>
              <p className="text-muted-foreground text-sm">This will reset all color markers</p>
            </div>
          </div>
        )}

        {!image ? (
          <div className="flex aspect-video w-full items-center justify-center p-8">
            <div className="relative flex size-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors border-muted-foreground/25 hover:border-muted-foreground/50">
              <div className="flex flex-col items-center gap-4">
                <div className="bg-muted flex items-center justify-center rounded-full p-4">
                  <LuUpload className="text-muted-foreground size-8" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium">Upload Image</p>
                  <p className="text-muted-foreground text-sm">Click or drag an image here</p>
                  <p className="text-muted-foreground text-xs">Supports PNG, JPG, GIF, WebP formats</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-muted flex lg:aspect-[5/4] h-full w-full lg:min-w-96 items-center justify-center p-4 lg:w-2/3 lg:border-r">
              <PickerColors key={image} initialPoints={colors} image={image} onColorsChangeEnter={setColors} />
            </div>

            <aside className="flex w-full flex-col p-4 lg:w-1/3">
              <div className="relative mb-6">
                <h2 className="text-lg font-semibold">Palette</h2>
                <p className="text-muted-foreground text-sm">Click and drag markers to adjust colors</p>
              </div>

              <div className="flex flex-row gap-2 lg:flex-col lg:gap-6">
                {colors.map((color) => (
                  <div
                    key={color.id}
                    style={{
                      background: color.color,
                      color: Color(color.color).isLight() ? "black" : "white",
                    }}
                    className="relative flex flex-1 lg:flex-auto lg:aspect-auto aspect-square w-full items-center overflow-hidden rounded-lg lg:h-16 group"
                  >
                    <Button
                      onClick={() => deleteColor(color.id)}
                      className="absolute top-0 flex justify-center items-center left-0 h-full aspect-square rounded-r-none group-hover:opacity-100 opacity-0 bg-black/20 hover:bg-black/40 transition-colors"
                      aria-label="Delete color"
                    >
                      <LuX className="size-6 text-red-600" />
                    </Button>
                    <span className="absolute lg:inline-block hidden right-4 bottom-2 font-mono text-sm opacity-90">{Color(color.color).hex()}</span>
                  </div>
                ))}
              </div>
            </aside>
          </>
        )}
      </div>
    </div>
  );
}
