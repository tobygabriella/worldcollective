import { Category } from "../Enums/Category.js";
import { Condition } from "../Enums/Condition.js";
import {
  Subcategory,
  WOMENSWEAR_SUBCATEGORY,
  MENSWEAR_SUBCATEGORY,
} from "../Enums/Subcategory.js";

export function getConditionName(condition) {
  switch (condition) {
    case Condition.BRAND_NEW:
      return "Brand new with tags";
    case Condition.LIKE_NEW:
      return "Like new";
    case Condition.USED_EXCELLENT:
      return "Used - Excellent";
    case Condition.USED_GOOD:
      return "Used - Good";
    case Condition.USED_FAIR:
      return "Used - Fair";
    default:
      return condition;
  }
}

export function getCategoryName(category) {
  switch (category) {
    case Category.WOMENSWEAR:
      return "womenswear";
    case Category.MENSWEAR:
      return "menswear";
    default:
      return category;
  }
}

export function getSubcategoryName(subcategory) {
  switch (subcategory) {
    case Subcategory.TSHIRTS:
      return "T-shirt";
    case Subcategory.TOPS:
      return "Tops";
    case Subcategory.JEANS:
      return "Jeans";
    case Subcategory.DRESSES:
      return "Dresses";
    case Subcategory.SKIRTS:
      return "Skirts";
    case Subcategory.TROUSERS:
      return "Trousers";
    case Subcategory.SHORTS:
      return "Shorts";
    default:
      return subcategory;
  }
}

export function getSubcategory(category) {
  switch (category) {
    case Category.WOMENSWEAR:
      return WOMENSWEAR_SUBCATEGORY;
    case Category.MENSWEAR:
      return MENSWEAR_SUBCATEGORY;
    default:
      return [];
  }
}
