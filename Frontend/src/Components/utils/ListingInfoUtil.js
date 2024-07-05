import { Categories, Conditions, Subcategories } from "../Enums/Enums.js";

export function getConditionName(condition) {
  switch (condition) {
    case Conditions.BRAND_NEW:
      return "Brand new with tags";
    case Conditions.LIKE_NEW:
      return "Like new";
    case Conditions.USED_EXCELLENT:
      return "Used - Excellent";
    case Conditions.USED_GOOD:
      return "Used - Good";
    case Conditions.USED_FAIR:
      return "Used - Fair";
    default:
      return condition;
  }
}

export function getCategoryName(category) {
  switch (category) {
    case Categories.WOMENSWEAR:
      return "womenswear";
    case Categories.MENSWEAR:
      return "menswear";
    default:
      return category;
  }
}

export function getSubcategoryName(subcategory) {
  switch (subcategory) {
    case Subcategories.TSHIRT:
      return "T-shirt";
    case Subcategories.TOPS:
      return "Tops";
    case Subcategories.JEANS:
      return "Jeans";
    case Subcategories.DRESSES:
      return "Dresses";
    case Subcategories.SKIRTS:
      return "Skirts";
    case Subcategories.TROUSERS:
      return "Trousers";
    case Subcategories.SHORTS:
      return "Shorts";
    default:
      return subcategory;
  }
}
