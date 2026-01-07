import type { SerializableImageGallery } from "@/components/tool-ui/image-gallery";
import type { PresetWithCodeGen } from "./types";

export type ImageGalleryPresetName =
  | "search-results"
  | "portfolio"
  | "product-images";

function generateImageGalleryCode(data: SerializableImageGallery): string {
  const props: string[] = [];

  props.push(
    `  images={${JSON.stringify(data.images, null, 4).replace(/\n/g, "\n  ")}}`,
  );

  if (data.title) {
    props.push(`  title="${data.title}"`);
  }

  if (data.description) {
    props.push(`  description="${data.description}"`);
  }

  props.push(
    `  onImageClick={(id, image) => {\n    console.log("Clicked:", id, image);\n  }}`,
  );

  return `<ImageGallery\n${props.join("\n")}\n/>`;
}

export const imageGalleryPresets: Record<
  ImageGalleryPresetName,
  PresetWithCodeGen<SerializableImageGallery>
> = {
  "search-results": {
    description: "Image search results from the web",
    data: {
      id: "image-gallery-search-results",
      title: "Mountain landscapes",
      description: "Here are some images matching your search",
      images: [
        {
          id: "img-1",
          src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
          alt: "Dramatic mountain peaks at sunrise with golden light",
          width: 800,
          height: 600,
          title: "Alpine Sunrise",
          caption: "Dolomites, Italy",
          source: { label: "Unsplash", url: "https://unsplash.com" },
        },
        {
          id: "img-2",
          src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=1200&fit=crop",
          alt: "Misty mountain valley with evergreen trees",
          width: 800,
          height: 1200,
          title: "Misty Valley",
          source: { label: "Unsplash", url: "https://unsplash.com" },
        },
        {
          id: "img-3",
          src: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop",
          alt: "Snow-covered mountain peak under starry night sky",
          width: 800,
          height: 600,
          title: "Night Summit",
          caption: "Mount Hood, Oregon",
        },
        {
          id: "img-4",
          src: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&h=600&fit=crop",
          alt: "Reflection of mountains in a crystal clear lake",
          width: 800,
          height: 600,
        },
        {
          id: "img-5",
          src: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800&h=1000&fit=crop",
          alt: "Hiker standing on mountain ridge at sunset",
          width: 800,
          height: 1000,
          title: "Summit View",
        },
      ],
    } satisfies SerializableImageGallery,
    generateExampleCode: generateImageGalleryCode,
  },
  portfolio: {
    description: "Photography portfolio showcase",
    data: {
      id: "image-gallery-portfolio",
      title: "Architecture Series",
      images: [
        {
          id: "arch-1",
          src: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=800&h=1000&fit=crop",
          alt: "Modern glass skyscraper reflecting clouds",
          width: 800,
          height: 1000,
          title: "Cloud Reflections",
          caption: "New York City, 2024",
        },
        {
          id: "arch-2",
          src: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop",
          alt: "Geometric patterns of a contemporary building facade",
          width: 800,
          height: 600,
          title: "Geometry in Steel",
        },
        {
          id: "arch-3",
          src: "https://images.unsplash.com/photo-1448630360428-65456885c650?w=800&h=800&fit=crop",
          alt: "Spiral staircase from above",
          width: 800,
          height: 800,
          title: "Spiral",
          caption: "Vatican Museum",
        },
        {
          id: "arch-4",
          src: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&h=600&fit=crop",
          alt: "Bridge cables creating abstract patterns",
          width: 800,
          height: 600,
          title: "Tension",
        },
      ],
    } satisfies SerializableImageGallery,
    generateExampleCode: generateImageGalleryCode,
  },
  "product-images": {
    description: "E-commerce product gallery",
    data: {
      id: "image-gallery-product",
      title: "Ceramic Mug Collection",
      description: "Handcrafted stoneware, dishwasher safe",
      images: [
        {
          id: "prod-1",
          src: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=600&fit=crop",
          alt: "Beige ceramic mug front view",
          width: 600,
          height: 600,
        },
        {
          id: "prod-2",
          src: "https://images.unsplash.com/photo-1572119865084-43c285814d63?w=600&h=600&fit=crop",
          alt: "Ceramic mug being held showing scale",
          width: 600,
          height: 600,
        },
        {
          id: "prod-3",
          src: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&h=600&fit=crop",
          alt: "Mug interior detail showing glaze",
          width: 600,
          height: 600,
        },
        {
          id: "prod-4",
          src: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop",
          alt: "Mug with coffee on wooden table",
          width: 600,
          height: 600,
        },
      ],
    } satisfies SerializableImageGallery,
    generateExampleCode: generateImageGalleryCode,
  },
};
