import { getColorName } from "@/lib/nearest";
import Color from "color";
import { ColorPoint } from "@/components/palette/picker-colors";

// 计算两个颜色之间的距离
const colorDistance = (color1: number[], color2: number[]) => {
  const [r1, g1, b1] = color1;
  const [r2, g2, b2] = color2;
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
};

// 计算颜色是否为暖色调
const isWarmColor = (rgb: number[]) => {
  const [r, g, b] = rgb;

  // 暖色调通常红色和黄色成分较高，蓝色成分较低
  // 红色 > 蓝色，且 (红色 + 绿色) > 蓝色 * 1.5
  return r > b && r + g > b * 1.5;
};

// 计算颜色的饱和度和亮度
const getColorVibrancy = (rgb: number[]) => {
  const [r, g, b] = rgb;

  // 计算饱和度
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;

  // 计算亮度
  const brightness = (r + g + b) / 3 / 255;

  // 计算艳丽度：饱和度 * 适中的亮度权重
  // 亮度在 0.3-0.8 之间的颜色更艳丽
  const brightnessWeight = brightness < 0.3 || brightness > 0.8 ? Math.max(0, 1 - Math.abs(brightness - 0.55) * 2) : 1;

  return saturation * brightnessWeight;
};

export const extractMainColors = (canvas: HTMLCanvasElement, imageElement: HTMLImageElement, count: number = 5): ColorPoint[] => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  // 收集所有像素颜色及其位置
  const colorMap = new Map<string, { count: number; positions: { x: number; y: number }[]; rgb: number[] }>();

  for (let y = 0; y < canvas.height; y += 8) {
    for (let x = 0; x < canvas.width; x += 8) {
      const i = (y * canvas.width + x) * 4;
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];

      if (a < 128) continue;

      // 排除黑色和白色附近的颜色
      const brightness = (r + g + b) / 3;
      if (brightness < 30 || brightness > 225) continue; // 排除过暗和过亮的颜色

      // 量化颜色
      const quantizedR = Math.round(r / 24) * 24;
      const quantizedG = Math.round(g / 24) * 24;
      const quantizedB = Math.round(b / 24) * 24;

      const colorKey = `${quantizedR},${quantizedG},${quantizedB}`;

      if (!colorMap.has(colorKey)) {
        colorMap.set(colorKey, { count: 0, positions: [], rgb: [quantizedR, quantizedG, quantizedB] });
      }

      const colorInfo = colorMap.get(colorKey)!;
      colorInfo.count++;
      colorInfo.positions.push({ x, y });
    }
  }

  // 先按频率筛选出候选颜色（至少出现一定次数）
  const candidateColors = Array.from(colorMap.entries())
    .filter(([, info]) => info.count > 10)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, Math.min(20, colorMap.size));

  // 使用贪心算法选择差别最大的颜色
  const selectedColors: typeof candidateColors = [];

  if (candidateColors.length > 0) {
    // 先选择出现频率最高的颜色
    selectedColors.push(candidateColors[0]);

    // 依次选择与已选颜色差距最大的颜色
    while (selectedColors.length < count && selectedColors.length < candidateColors.length) {
      let maxMinDistance = 0;
      let bestColorIndex = -1;

      for (let i = 0; i < candidateColors.length; i++) {
        const candidate = candidateColors[i];

        // 跳过已选择的颜色
        if (selectedColors.some((selected) => selected[0] === candidate[0])) continue;

        // 计算与所有已选颜色的最小距离
        let minDistance = Infinity;
        for (const selected of selectedColors) {
          const distance = colorDistance(candidate[1].rgb, selected[1].rgb);
          minDistance = Math.min(minDistance, distance);
        }

        // 选择最小距离最大的颜色
        if (minDistance > maxMinDistance) {
          maxMinDistance = minDistance;
          bestColorIndex = i;
        }
      }

      if (bestColorIndex >= 0) {
        selectedColors.push(candidateColors[bestColorIndex]);
      } else {
        break;
      }
    }
  }

  return selectedColors.map((colorEntry, index) => {
    const [, colorInfo] = colorEntry;
    const [r, g, b] = colorInfo.rgb;

    // 选择该颜色的中心位置
    const positions = colorInfo.positions;
    const centerPos = positions[Math.floor(positions.length / 2)];

    // 计算标准化坐标，需考虑object-contain容器
    // 先将canvas像素坐标映射到图片natural尺寸
    const imgX = centerPos.x;
    const imgY = centerPos.y;

    // 再映射到容器坐标（假设图片object-contain填充container）
    // 这里需要父组件传递containerRef.current，或你可以在extractMainColors参数中加container参数
    // 这里假设container为imageElement.parentElement
    const container = imageElement.parentElement as HTMLDivElement | null;

    // 计算图片在容器内的渲染区域
    let displayX = imgX,
      displayY = imgY;
    if (container) {
      const { renderWidth, renderHeight, offsetX, offsetY } = getImageContainRect(imageElement, container);
      displayX = offsetX + (imgX / imageElement.naturalWidth) * renderWidth;
      displayY = offsetY + (imgY / imageElement.naturalHeight) * renderHeight;
    }

    // 转换为标准化坐标
    const normalizedPos = getNormalizedPosition(imageElement, displayX, displayY, container);

    return {
      id: index + 1,
      x: normalizedPos.x,
      y: normalizedPos.y,
      color: `rgb(${r}, ${g}, ${b})`,
      name: getColorName(Color(`rgb(${r}, ${g}, ${b})`).hex())?.name || "unknown",
      vibrancy: getColorVibrancy([r, g, b]),
      isWarm: isWarmColor([r, g, b]),
    };
  });
};

// 获取图片在容器中的缩放和偏移（object-contain）
function getImageContainRect(image: HTMLImageElement, container: HTMLDivElement) {
  const containerRect = container.getBoundingClientRect();
  const imgNaturalWidth = image.naturalWidth;
  const imgNaturalHeight = image.naturalHeight;
  const containerWidth = containerRect.width;
  const containerHeight = containerRect.height;

  const imgAspect = imgNaturalWidth / imgNaturalHeight;
  const containerAspect = containerWidth / containerHeight;

  let renderWidth = containerWidth;
  let renderHeight = containerHeight;
  let offsetX = 0;
  let offsetY = 0;

  if (imgAspect > containerAspect) {
    // 图片宽度撑满容器，高度居中
    renderWidth = containerWidth;
    renderHeight = containerWidth / imgAspect;
    offsetY = (containerHeight - renderHeight) / 2;
  } else {
    // 图片高度撑满容器，宽度居中
    renderHeight = containerHeight;
    renderWidth = containerHeight * imgAspect;
    offsetX = (containerWidth - renderWidth) / 2;
  }

  return {
    renderWidth,
    renderHeight,
    offsetX,
    offsetY,
  };
}

// 显示坐标转标准化坐标（支持object-contain）
export const getNormalizedPosition = (image: HTMLImageElement | null, displayX: number, displayY: number, container?: HTMLDivElement | null) => {
  if (!image) return { x: displayX, y: displayY };
  if (!container) {
    // fallback: old logic
    const rect = image.getBoundingClientRect();
    const aspectRatio = image.naturalHeight / image.naturalWidth;
    return {
      x: (displayX / rect.width) * 384,
      y: (displayY / (rect.width * aspectRatio)) * 384,
    };
  }

  const { renderWidth, renderHeight, offsetX, offsetY } = getImageContainRect(image, container);

  // 转换为图片内坐标
  const imgX = displayX - offsetX;
  const imgY = displayY - offsetY;

  // 超出图片区域则返回边界
  const safeX = Math.max(0, Math.min(imgX, renderWidth));
  const safeY = Math.max(0, Math.min(imgY, renderHeight));

  // 映射到标准化坐标
  return {
    x: (safeX / renderWidth) * 384,
    y: (safeY / renderHeight) * 384,
  };
};
