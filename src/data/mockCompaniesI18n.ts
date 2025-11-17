export interface CompanyI18n {
  id: string;
  name: string;
  categories: CategoryI18n[];
}

export interface CategoryI18n {
  id: string;
  name: {
    en: string;
    ko: string;
    zh: string;
  };
  subcategories?: SubcategoryI18n[];
}

export interface SubcategoryI18n {
  id: string;
  name: {
    en: string;
    ko: string;
    zh: string;
  };
  subsubcategories?: SubSubcategoryI18n[];
}

export interface SubSubcategoryI18n {
  id: string;
  name: {
    en: string;
    ko: string;
    zh: string;
  };
}

export const mockCompaniesI18n: { companies: CompanyI18n[] } = {
  companies: [
    {
      id: "1688",
      name: "1688",
      categories: [
        {
          id: "1688_women",
          name: {
            en: "Women's Fashion",
            ko: "여성 패션",
            zh: "女装"
          },
          subcategories: [
            {
              id: "1688_women_dresses",
              name: {
                en: "Dresses",
                ko: "드레스",
                zh: "连衣裙"
              },
              subsubcategories: [
                {
                  id: "1688_women_dresses_casual",
                  name: {
                    en: "Casual Dresses",
                    ko: "캐주얼 드레스",
                    zh: "休闲连衣裙"
                  }
                },
                {
                  id: "1688_women_dresses_formal",
                  name: {
                    en: "Formal Dresses",
                    ko: "정장 드레스",
                    zh: "正装连衣裙"
                  }
                },
                {
                  id: "1688_women_dresses_party",
                  name: {
                    en: "Party Dresses",
                    ko: "파티 드레스",
                    zh: "派对连衣裙"
                  }
                }
              ]
            },
            {
              id: "1688_women_tops",
              name: {
                en: "Tops & Blouses",
                ko: "상의 & 블라우스",
                zh: "上衣和衬衫"
              },
              subsubcategories: [
                {
                  id: "1688_women_tops_tshirts",
                  name: {
                    en: "T-Shirts",
                    ko: "티셔츠",
                    zh: "T恤"
                  }
                },
                {
                  id: "1688_women_tops_blouses",
                  name: {
                    en: "Blouses",
                    ko: "블라우스",
                    zh: "衬衫"
                  }
                }
              ]
            }
          ]
        },
        {
          id: "1688_men",
          name: {
            en: "Men's Fashion",
            ko: "남성 패션",
            zh: "男装"
          },
          subcategories: [
            {
              id: "1688_men_shirts",
              name: {
                en: "Shirts",
                ko: "셔츠",
                zh: "衬衫"
              }
            },
            {
              id: "1688_men_tshirts",
              name: {
                en: "T-Shirts",
                ko: "티셔츠",
                zh: "T恤"
              }
            }
          ]
        },
        {
          id: "1688_electronics",
          name: {
            en: "Electronics",
            ko: "전자제품",
            zh: "电子产品"
          },
          subcategories: [
            {
              id: "1688_elec_phones",
              name: {
                en: "Smartphones",
                ko: "스마트폰",
                zh: "智能手机"
              },
              subsubcategories: [
                {
                  id: "1688_elec_phones_android",
                  name: {
                    en: "Android Phones",
                    ko: "안드로이드 폰",
                    zh: "安卓手机"
                  }
                },
                {
                  id: "1688_elec_phones_iphone",
                  name: {
                    en: "iPhones",
                    ko: "아이폰",
                    zh: "苹果手机"
                  }
                }
              ]
            }
          ]
        },
        {
          id: "1688_beauty",
          name: {
            en: "Beauty & Health",
            ko: "뷰티 & 건강",
            zh: "美容健康"
          },
          subcategories: [
            {
              id: "1688_beauty_skincare",
              name: {
                en: "Skincare",
                ko: "스킨케어",
                zh: "护肤品"
              }
            },
            {
              id: "1688_beauty_makeup",
              name: {
                en: "Makeup",
                ko: "메이크업",
                zh: "化妆品"
              }
            }
          ]
        }
      ]
    },
    {
      id: "taobao",
      name: "Taobao",
      categories: [
        {
          id: "taobao_fashion",
          name: {
            en: "Fashion",
            ko: "패션",
            zh: "时尚"
          },
          subcategories: [
            {
              id: "taobao_fashion_women",
              name: {
                en: "Women",
                ko: "여성",
                zh: "女性"
              }
            },
            {
              id: "taobao_fashion_men",
              name: {
                en: "Men",
                ko: "남성",
                zh: "男性"
              }
            }
          ]
        },
        {
          id: "taobao_accessories",
          name: {
            en: "Accessories",
            ko: "액세서리",
            zh: "配饰"
          },
          subcategories: [
            {
              id: "taobao_acc_hats",
              name: {
                en: "Hats & Caps",
                ko: "모자 & 캡",
                zh: "帽子"
              }
            },
            {
              id: "taobao_acc_bags",
              name: {
                en: "Bags",
                ko: "가방",
                zh: "包包"
              }
            }
          ]
        },
        {
          id: "taobao_jewelry",
          name: {
            en: "Jewelry",
            ko: "주얼리",
            zh: "珠宝"
          },
          subcategories: [
            {
              id: "taobao_jew_necklaces",
              name: {
                en: "Necklaces",
                ko: "목걸이",
                zh: "项链"
              }
            },
            {
              id: "taobao_jew_earrings",
              name: {
                en: "Earrings",
                ko: "귀걸이",
                zh: "耳环"
              }
            }
          ]
        }
      ]
    },
    {
      id: "wsy",
      name: "WSY",
      categories: [
        {
          id: "wsy_wholesale",
          name: {
            en: "Wholesale",
            ko: "도매",
            zh: "批发"
          },
          subcategories: [
            {
              id: "wsy_whole_bulk",
              name: {
                en: "Bulk Orders",
                ko: "대량 주문",
                zh: "批量订单"
              }
            }
          ]
        },
        {
          id: "wsy_shoes",
          name: {
            en: "Shoes",
            ko: "신발",
            zh: "鞋子"
          },
          subcategories: [
            {
              id: "wsy_shoes_sneakers",
              name: {
                en: "Sneakers",
                ko: "스니커즈",
                zh: "运动鞋"
              }
            }
          ]
        }
      ]
    },
    {
      id: "vip",
      name: "VIP",
      categories: [
        {
          id: "vip_luxury",
          name: {
            en: "Luxury Brands",
            ko: "럭셔리 브랜드",
            zh: "奢侈品牌"
          },
          subcategories: [
            {
              id: "vip_lux_fashion",
              name: {
                en: "Fashion",
                ko: "패션",
                zh: "时尚"
              }
            }
          ]
        }
      ]
    },
    {
      id: "vvic",
      name: "VVIC",
      categories: [
        {
          id: "vvic_women",
          name: {
            en: "Women's Wear",
            ko: "여성복",
            zh: "女装"
          },
          subcategories: [
            {
              id: "vvic_women_casual",
              name: {
                en: "Casual",
                ko: "캐주얼",
                zh: "休闲"
              }
            }
          ]
        }
      ]
    },
    {
      id: "myCompany",
      name: "My Company",
      categories: [
        {
          id: "mycompany_custom",
          name: {
            en: "Custom Orders",
            ko: "맞춤 주문",
            zh: "定制订单"
          },
          subcategories: [
            {
              id: "mycomp_cust_design",
              name: {
                en: "Custom Design",
                ko: "맞춤 디자인",
                zh: "定制设计"
              }
            }
          ]
        }
      ]
    }
  ]
};

// Helper function to get localized company data
export const getLocalizedCompany = (company: CompanyI18n, locale: 'en' | 'ko' | 'zh') => {
  return {
    ...company,
    categories: company.categories.map(category => ({
      ...category,
      name: category.name[locale],
      subcategories: category.subcategories?.map(subcategory => ({
        ...subcategory,
        name: subcategory.name[locale],
        subsubcategories: subcategory.subsubcategories?.map(subsubcategory => ({
          ...subsubcategory,
          name: subsubcategory.name[locale]
        }))
      }))
    }))
  };
};

// Helper function to get all localized companies
export const getLocalizedCompanies = (locale: 'en' | 'ko' | 'zh') => {
  return mockCompaniesI18n.companies.map(company => getLocalizedCompany(company, locale));
};