type AutoCover = {
  image: string;
  bgClass: string;
};

const AUTO_COVERS: AutoCover[] = [
  {
    image: "/images/mascot-mono-black.png",
    bgClass: "bg-yellow-400",
  },
  {
    image: "/images/mascot-red.png",
    bgClass: "bg-black",
  },
  {
    image: "/images/mascot-yellow.png",
    bgClass: "bg-gray-800",
  },
  {
    image: "/images/mascot-white.png",
    bgClass: "bg-gray-900",
  },
];

export function getAutoCover(index: number): AutoCover {
  return AUTO_COVERS[index % AUTO_COVERS.length];
}
