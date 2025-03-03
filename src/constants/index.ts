export const initialOrder: IOrder = {
  id: "",
  userId: "",
  status: "CART",
  warehouseId: null,
  shippingMethod: null,
  shippedAt: null,
  totalAmount: 0,
  paymentStatus: "PENDING",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  items: []
};

export interface IOrder {
  id: string;
  userId: string;
  status: "CART" | "PENDING" | "COMPLETED" | "CANCELLED" | "SHIPPED" | "PROCESSED"
  warehouseId: string | null;
  totalAmount: number;
  shippingMethod: string | null,
  shippedAt: string | Date | null,
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  createdAt: string | Date; // ISO date string
  updatedAt: string; // ISO date string
  items?: IOrderItem[];
  user?: {addresses: [{city_name: string}] }
}

export interface IOrderItem {
  id: string;
  orderId: string;
  productVariantId: string;
  size: string
  quantity: number;
  price: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  productVariant: { color: string, image: string, product: { name: string } }
}

export interface IOrderItem2 {
  id: string;
  orderId: string;
  productVariantId: string;
  size: string
  quantity: number;
  price: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  productVariant: IProductVariant
  order: IOrder
}

export interface IImageFieldProps {
  currentThumbnail?: string
  currentAdditional?: IEditAdditional[]
  setCurrentAdditional?: React.Dispatch<React.SetStateAction<IEditAdditional[]>>
  thumbnail?: File;
  setThumbnail?: (value: File | undefined) => void;
  invalidMainImage?: boolean;
  setInvalidMainImage?: (value: boolean) => void;
  additionalImage?: File[];
  setAdditionalImage?: (value: File[]) => void;
}

export interface IColorVariant {
  code: string;
  name: string;
  variantImageURL: string
}

  interface IProductImage {
    id: string;
    productID: string;
    image: string;
  }
  
  export interface IProductVariant {
    id: string;
    productID: string;
    color: string;
    HEX: string;
    image: string;
    warehouseProduct: IWarehouseProduct[];
    totalStock: number;
    product?: IProduct
  }
  
  export interface ICategory {
    id?: string;
    slug?: string
    gender: string;
    type: string;
    category: string;
  }

  export interface IProductDataSet {
    name: string,
    description: string,
    price: number,
    oneSize: Boolean,
    colorVariant: IColorVariant[],
    additionalURL: string[],
    thumbnailURL: string,
    categoryData: ICategory
  }
  
  export interface IProduct {
    id: string;
    name: string;
    slug: string;
    stockUpdatedAt?: string
    description: string;
    thumbnailURL: string; 
    updatedAt?: string
    price: number;
    oneSize: boolean;
    categoryID: string;
    createdAt: string;
    images: IProductImage[];
    variants: IProductVariant[];
    category: ICategory;
    totalStock: number;
    sales: number
    isActive: boolean
    stockIn:{_sum:{quantity:number}}
    stockOut:{_sum:{quantity:number}}
    toDateStock:number
    analytics:{_sum:{price:number, quantity:number,}, _count:{id:number}}
  }

export interface IWarehouseProduct {
    id: string;
    warehouseID: string;
    productVariantID: string;
    size: string;
    stock: number;
    isDelete: boolean;
    updatedAt: string;
    productVariant: IProductVariant;
    warehouse?: IWarehouse
}

export interface IStockMutationItem {
    id: string;
    quantity: number;
    warehouseProductID: string;
    stockMutationID: string;
    WarehouseProduct: IWarehouseProduct;
    stockMutation?: IMutation
    associatedWH?: IWarehouse
}

export interface IMutation {
    id: string;
    warehouseID: string;
    associatedWarehouseID: string;
    type: string;
    status: string;
    createdAt: string;
    updatedAt?: string;
    associatedWarehouseName: string
    requestingWarehouse?: string
    StockMutationItem: IStockMutationItem[];
}


  export interface IProductList {
    productList: IProduct[]
  }

export interface ICategory {
  id?: string;
  slug?: string
  gender: string;
  type: string;
  category: string;
}


export interface IProductList {
  productList: IProduct[]
}

export interface IEditColor {
  id?: string
  code: string
  name: string
  image?: File
  imageURL?: string
  isDeleted: boolean
  isEdited: boolean
  isNew: boolean
}

export interface IEditAdditional {
  id?: string
  productID: string
  image?: string
  imageFile?: File
  isDeleted: boolean
  isNew: boolean
}

export interface IWarehouse {
  id?: string,
  warehouseName?: string,
  city?: string,
  coordinate?: string,
  address?: string,
  createdAt?: Date,
  adminID?: string,
}

export interface Province {
  province_id: string;
  province: string;
}

export interface City {
  city_id: string;
  city_name: string;
  type?: string
}

export interface Address {
  id: string;
  coordinate: string;
  mainAddress: boolean;
}

export interface Warehouse {
    id: string;
    warehouseName: string;
    city: string;
    coordinate: string;
    address: string;
    city_id: string;
    province_id: string;
    province: string;
    type: string;
    city_name: string;
    postal_code: string;
    createdAt: string;
    adminID: string | null;
    isActive: boolean;
}

export interface ShippingCostResponse {
  code: string;
  name: string;
  costs: ShippingCost[];
}

export interface ShippingCost {
  service: string;
  description: string;
  cost: ShippingDetail[];
}

export interface ShippingDetail {
  value: number;
  etd: string;
  note: string;
}

export interface Province {
  province_id: string;
  province: string;
}

export interface City {
  city_id: string;
  city_name: string;
  type?: string
}

export interface Address {
  id: string;
  coordinate: string;
  mainAddress: boolean;
}

export interface Warehouse {
    id: string;
    warehouseName: string;
    city: string;
    coordinate: string;
    address: string;
    city_id: string;
    province_id: string;
    province: string;
    type: string;
    city_name: string;
    postal_code: string;
    createdAt: string;
    adminID: string | null;
}

export interface ShippingCostResponse {
  code: string;
  name: string;
  costs: ShippingCost[];
}

export interface ShippingCost {
  service: string;
  description: string;
  cost: ShippingDetail[];
}

export interface ShippingDetail {
  value: number;
  etd: string;
  note: string;
}

export type UrlQueryParams = {
  params: string
  key: string
  value: string | null
}

export type RemoveUrlQueryParams = {
  params: string
  keysToRemove: string[]
}
export interface ISizeSum {
  _sum: { stock: number },
  size: string,
  productVariantID: string
}