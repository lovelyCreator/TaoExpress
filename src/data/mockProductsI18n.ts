export interface ProductI18n {
  id: string;
  name: {
    en: string;
    ko: string;
    zh: string;
  };
  description: {
    en: string;
    ko: string;
    zh: string;
  };
  image: string;
  images?: string[];
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  ratingCount: number;
  orderCount: number;
  company: string;
  category: string;
  subcategory?: string;
  subsubcategory?: string;
  productCode?: string;
  seller?: {
    name: {
      en: string;
      ko: string;
      zh: string;
    };
    rating: number;
    soldCount: string;
  };
  colors?: Array<{
    name: {
      en: string;
      ko: string;
      zh: string;
    };
    hex: string;
    image: string;
  }>;
  sizes?: string[];
  reviews?: Array<{
    user: string;
    rating: number;
    comment: {
      en: string;
      ko: string;
      zh: string;
    };
    date: string;
  }>;
  details?: {
    [key: string]: {
      en: string;
      ko: string;
      zh: string;
    };
  };
  badge?: {
    en: string;
    ko: string;
    zh: string;
  };
}

export const mockProductsI18n = {
  newIn: [
    {
      id: "new_1",
      name: {
        en: "Summer Floral Dress",
        ko: "여름 플로럴 드레스",
        zh: "夏季花卉连衣裙"
      },
      description: {
        en: "Beautiful summer dress with floral patterns, perfect for casual outings",
        ko: "캐주얼한 외출에 완벽한 플로럴 패턴의 아름다운 여름 드레스",
        zh: "美丽的夏季花卉图案连衣裙，非常适合休闲外出"
      },
      image: "https://picsum.photos/seed/dress1/400/500",
      images: [
        "https://picsum.photos/seed/dress1/400/500",
        "https://picsum.photos/seed/dress1a/400/500",
        "https://picsum.photos/seed/dress1b/400/500",
        "https://picsum.photos/seed/dress1c/400/500"
      ],
      price: 45.99,
      originalPrice: 65.99,
      discount: 30,
      rating: 4.5,
      ratingCount: 128,
      orderCount: 456,
      company: "1688",
      category: "1688_women",
      subcategory: "1688_women_dresses",
      subsubcategory: "1688_women_dresses_casual",
      productCode: "SKU-DRS-2024-001",
      seller: {
        name: {
          en: "Good 188 | China",
          ko: "굿 188 | 중국",
          zh: "好188 | 中国"
        },
        rating: 4.3,
        soldCount: "1.3M+"
      },
      colors: [
        {
          name: {
            en: "Space Gray",
            ko: "스페이스 그레이",
            zh: "太空灰"
          },
          hex: "#4A5568",
          image: "https://picsum.photos/seed/color1/100/100"
        },
        {
          name: {
            en: "Rose Pink",
            ko: "로즈 핑크",
            zh: "玫瑰粉"
          },
          hex: "#F687B3",
          image: "https://picsum.photos/seed/color2/100/100"
        },
        {
          name: {
            en: "Ocean Blue",
            ko: "오션 블루",
            zh: "海洋蓝"
          },
          hex: "#4299E1",
          image: "https://picsum.photos/seed/color3/100/100"
        }
      ],
      sizes: ["S", "M", "L", "XL"],
      reviews: [
        {
          user: "Artimus",
          rating: 5,
          comment: {
            en: "This product is absolutely great. Perfect fit and quality!",
            ko: "이 제품은 정말 훌륭합니다. 완벽한 핏과 품질!",
            zh: "这个产品绝对很棒。完美的合身度和质量！"
          },
          date: "2024-01-15"
        },
        {
          user: "Sarah",
          rating: 4,
          comment: {
            en: "Good quality product, fast delivery.",
            ko: "좋은 품질의 제품, 빠른 배송.",
            zh: "质量很好的产品，快速配送。"
          },
          date: "2024-01-10"
        }
      ],
      details: {
        Material: {
          en: "Cotton blend",
          ko: "면 혼방",
          zh: "棉混纺"
        },
        Care: {
          en: "Machine washable",
          ko: "기계 세탁 가능",
          zh: "机洗"
        },
        Origin: {
          en: "Made in China",
          ko: "중국산",
          zh: "中国制造"
        }
      }
    },
    {
      id: "new_2",
      name: {
        en: "Casual Denim Jacket",
        ko: "캐주얼 데님 재킷",
        zh: "休闲牛仔夹克"
      },
      description: {
        en: "Premium quality denim jacket perfect for casual wear",
        ko: "캐주얼 착용에 완벽한 프리미엄 품질의 데님 재킷",
        zh: "优质牛仔夹克，非常适合休闲穿着"
      },
      image: "https://picsum.photos/seed/jacket1/400/500",
      images: [
        "https://picsum.photos/seed/jacket1/400/500",
        "https://picsum.photos/seed/jacket1a/400/500",
        "https://picsum.photos/seed/jacket1b/400/500",
        "https://picsum.photos/seed/jacket1c/400/500"
      ],
      price: 59.99,
      originalPrice: 89.99,
      discount: 33,
      rating: 4.7,
      ratingCount: 234,
      orderCount: 789,
      company: "taobao",
      category: "taobao_fashion",
      productCode: "SKU-JKT-2024-002",
      colors: [
        {
          name: {
            en: "Light Blue",
            ko: "라이트 블루",
            zh: "浅蓝色"
          },
          hex: "#87CEEB",
          image: "https://picsum.photos/seed/jacket_blue/100/100"
        },
        {
          name: {
            en: "Dark Blue",
            ko: "다크 블루",
            zh: "深蓝色"
          },
          hex: "#00008B",
          image: "https://picsum.photos/seed/jacket_dark/100/100"
        }
      ],
      sizes: ["S", "M", "L", "XL", "XXL"],
      details: {
        Material: {
          en: "100% Cotton Denim",
          ko: "100% 면 데님",
          zh: "100% 棉牛仔布"
        },
        Weight: {
          en: "650g",
          ko: "650g",
          zh: "650克"
        }
      }
    },
    {
      id: "new_3",
      name: {
        en: "Leather Crossbody Bag",
        ko: "가죽 크로스백",
        zh: "皮革斜挎包"
      },
      description: {
        en: "Stylish leather crossbody bag for everyday use",
        ko: "일상 사용을 위한 스타일리시한 가죽 크로스백",
        zh: "时尚皮革斜挎包，适合日常使用"
      },
      image: "https://picsum.photos/seed/bag1/400/500",
      price: 34.99,
      originalPrice: 49.99,
      discount: 30,
      rating: 4.3,
      ratingCount: 89,
      orderCount: 234,
      company: "1688",
      category: "1688_women"
    }
  ],
  trending: [
    {
      id: "trend_1",
      name: {
        en: "Oversized Hoodie",
        ko: "오버사이즈 후디",
        zh: "宽松连帽衫"
      },
      description: {
        en: "Comfortable oversized hoodie with premium cotton blend fabric",
        ko: "프리미엄 면 혼방 원단의 편안한 오버사이즈 후디",
        zh: "舒适的宽松连帽衫，采用优质棉混纺面料"
      },
      image: "https://picsum.photos/seed/hoodie1/400/500",
      price: 38.99,
      originalPrice: 54.99,
      discount: 29,
      rating: 4.6,
      ratingCount: 892,
      orderCount: 2345,
      badge: {
        en: "Hot",
        ko: "인기",
        zh: "热门"
      },
      company: "1688",
      category: "1688_men"
    },
    {
      id: "trend_2",
      name: {
        en: "High Waist Jeans",
        ko: "하이웨스트 진",
        zh: "高腰牛仔裤"
      },
      description: {
        en: "Trendy high waist jeans with perfect fit",
        ko: "완벽한 핏의 트렌디한 하이웨스트 진",
        zh: "时尚高腰牛仔裤，完美贴身"
      },
      image: "https://picsum.photos/seed/jeans1/400/500",
      price: 49.99,
      originalPrice: 79.99,
      discount: 38,
      rating: 4.7,
      ratingCount: 1234,
      orderCount: 3456,
      badge: {
        en: "Trending",
        ko: "트렌딩",
        zh: "趋势"
      },
      company: "vvic",
      category: "vvic_women"
    }
  ],
  forYou: [
    {
      id: "foryou_1",
      name: {
        en: "Knit Cardigan",
        ko: "니트 가디건",
        zh: "针织开衫"
      },
      description: {
        en: "Cozy knit cardigan perfect for layering",
        ko: "레이어링에 완벽한 아늑한 니트 가디건",
        zh: "舒适的针织开衫，非常适合叠穿"
      },
      image: "https://picsum.photos/seed/cardigan1/400/500",
      price: 44.99,
      originalPrice: 64.99,
      discount: 31,
      rating: 4.5,
      ratingCount: 234,
      orderCount: 678,
      company: "1688",
      category: "1688_women"
    },
    {
      id: "foryou_2",
      name: {
        en: "Ankle Boots",
        ko: "앵클 부츠",
        zh: "踝靴"
      },
      description: {
        en: "Stylish ankle boots for any occasion",
        ko: "어떤 상황에도 어울리는 스타일리시한 앵클 부츠",
        zh: "适合任何场合的时尚踝靴"
      },
      image: "https://picsum.photos/seed/boots1/400/500",
      price: 79.99,
      originalPrice: 119.99,
      discount: 33,
      rating: 4.7,
      ratingCount: 456,
      orderCount: 1234,
      company: "wsy",
      category: "wsy_shoes"
    }
  ]
} as const;

// Helper function to get localized product data
export const getLocalizedProduct = (product: ProductI18n, locale: 'en' | 'ko' | 'zh') => {
  return {
    ...product,
    name: product.name[locale],
    description: product.description[locale],
    seller: product.seller ? {
      ...product.seller,
      name: product.seller.name[locale]
    } : undefined,
    colors: product.colors?.map(color => ({
      ...color,
      name: color.name[locale]
    })),
    reviews: product.reviews?.map(review => ({
      ...review,
      comment: review.comment[locale]
    })),
    details: product.details ? Object.keys(product.details).reduce((acc, key) => {
      acc[key] = product.details![key][locale];
      return acc;
    }, {} as Record<string, string>) : undefined,
    badge: product.badge ? product.badge[locale] : undefined
  };
};

// Helper function to get all localized products for a section
export const getLocalizedProducts = (section: keyof typeof mockProductsI18n, locale: 'en' | 'ko' | 'zh') => {
  return mockProductsI18n[section].map(product => getLocalizedProduct(product, locale));
};