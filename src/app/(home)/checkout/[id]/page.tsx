'use client'

import CartItem from "@/components/cart/CartItem";
import SectionHeaders from "@/components/order/SectionHeaders";
import { ShippingCost, Warehouse } from "@/constants";
import { fetchShippingCost, checkoutOrder, checkStock, getOrderById, checkCart } from "@/lib/cart";
import { formatToIDR, getUserClientSide } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import DropdownAddress from "@/components/order/DropdownAddress";
import DropdownShipping from "@/components/order/DropdownShipping";
import DropdownShippingServices from "@/components/order/DropdownShippingServices";
import { useAppSelector } from "@/lib/redux/hooks";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Loading from "@/app/Loading";
import { toast } from "sonner";
import NotFound from "@/components/notFound";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingButton } from "@/components/ui/loading-button";

type CheckoutProps = {
    params: {
        id: string
    }
}

// fastrac
export type CourierOption = {
    cod: boolean;
    cod_fee: number;
    cod_fee_min: number;
    courier_code: string;
    courier_name: string;
    dropoff: boolean;
    express_delivery: boolean;
    instant_delivery: boolean;
    insurance: number;
    insurance_minimum: number | null;
    logo: string;
    pickup: boolean;
};

export type DeliveryType = {
    nama_service: string,
    code_service: string,
    etd_start: number,
    etd_end: number,
    etd_unit: string
}

export type CourierService = {
    instant_delivery: DeliveryType[] | [];
    express_delivery: DeliveryType[] | [];
}

export default function Page({ params: { id } }: CheckoutProps) {
    // old code base
    const cart = useAppSelector(state => state.cart.value);
    const [stockData, setStockData] = useState([])
    const [totalAmount, setTotalAmount] = useState(0);
    const [warehouseId, setWarehouseId] = useState<string | null>(null);
    const [userAddress, setUserAddress] = useState<string | null>(null);
    const [shipping, setShipping] = useState<string>('');
    const [shippingService, setShippingService] = useState<ShippingCost[] | null>(null);
    const [service, setService] = useState<string>('');
    const [shippingCost, setShippingCost] = useState<number>(0);
    const [selectedShipping, setSelectedShipping] = useState<ShippingCost>()
    const [isLoading, setIsLoading] = useState(true)
    const [isStockSufficient, setIsStockSufficient] = useState(true)
    const [notFound, setNotFound] = useState(false)

    // fastrac
    const [ couriers, setCouriers ] = useState([])
    const [ courierService, setCourierService ] = useState({} as CourierService)
    const [ userRegionId, setUserRegionId ] = useState<number>(0);
    const [ warehouseRegionId, setWarehouseRegionId ] = useState<number>(0);
    const [ userPostalCode, setUserPostalCode ] = useState<string>('');
    const [ warehousePostalCode, setWarehousePostalCode ] = useState<string>('');
    const [ userAddressDetail, setUserAddressDetail ] = useState<{ subdistrict: string, district: string }>({ subdistrict: '', district: '' });
    const [ warehouseAddressDetail, setWarehouseAddressDetail ] = useState<{ subdistrict: string, district: string }>({ subdistrict: '', district: '' });
    const [ isInsuranceChecked, setIsInsuranceChecked ] = useState<boolean>(true)
    const [ selectedWarehouse, setSelectedWarehouse ] = useState<Warehouse>({} as Warehouse)
    const [ buttonLoading, setButtonLoading ] = useState<boolean>(false)

    // old code base
    const router = useRouter()

    const validate = useCallback(async () => {
        const user = await getUserClientSide();
        if (!user) router.push('/auth');
    }, [router]);

    const getStock = useCallback(async () => {
        const stock = await checkStock(id);
        setStockData(stock);
    }, [id]);

    const getCart = useCallback(async () => {
        const cart = await checkCart(id);
        if (cart == null) {
            setNotFound(true)
        }
    }, [id]);

    const fetchShipping = useCallback(async () => {
        try {
            const result = await fetchShippingCost(warehouseId!, userAddress!, shipping);
            setShippingService(result[0].costs);
        } catch (err) {
            toast.error('cant get shipping cost')
        }
    }, [warehouseId, userAddress, shipping]);

    const calculateShippingCost = useCallback(async () => {
        const res = shippingService?.filter(item => item.service === `${service}`);
        if (res !== undefined && res.length > 0) {
            const cost = res[0].cost[0].value;
            setShippingCost(cost);
            setSelectedShipping(res[0]);
        }
    }, [service, shippingService]);

    // fastrac
    function throwErr(message: string, error: unknown) {
        toast.error(message);
        console.error(error);
        return null;
    }

    const fetchCourier = useCallback(async () => {
        try {
            const res = await fetch('/api/all-courier');
            const data = await res.json();
            
            if (res.status !== 200) {
                toast.error('Failed to fetch couriers');
                return null;
            }
            setCouriers(data?.data);
        } catch (error) {
            throwErr('Failed to fetch couriers', error);
        }
    }, [])

    const fetchCourierService = useCallback(async (courier_code: string) => {
        try {
            const res = await fetch(`/api/courier-service/${courier_code}`);
            const data = await res.json();

            if (res.status !== 200) {
                toast.error('Failed to fetch courier service');
                return null;
            }
            setCourierService(data?.data);
        } catch (error) {
            throwErr('Failed to fetch courier service', error);
        }
    }, [])

    const fetchLocationByPostalCode = useCallback(async (postal_code: string, setState: React.Dispatch<React.SetStateAction<{ subdistrict: string, district: string }>>) => {
        try {
            const res = await fetch(`/api/address/postal_code/${postal_code}`);
            const data = await res.json();

            if (res.status !== 200) {
                toast.error('Failed to fetch location by postal code');
                return null;
            }

            setState({ subdistrict: data?.data[0]?.subdistrict, district: data?.data[0]?.district });
        } catch (error) {
            throwErr('Failed to fetch location by postal code', error)
        }
    }, [])

    const fetchRegionById = useCallback(async (search: string, setState: React.Dispatch<React.SetStateAction<number>>) => {
        try {
            if (!search)  {
                return null;
            }

            const res = await fetch(`/api/address/region`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ search })
            });
            const data = await res.json();

            if (res.status !== 200) {
                toast.error('Failed to fetch region by id');
                return null;
            }

            const regionArr = data?.data;
            regionArr.forEach((region: typeof regionArr[number]) => region?.name.includes(userPostalCode) ? setState(region?.id) : null);

        } catch (error) {
            throwErr('Failed to fetch region by id', error)
        }
    }, [])

    const handleCreateOrder = useCallback(async ( shipping: string, service: string ) => {
        setButtonLoading(true)
        const shipper = {
            region_id: warehouseRegionId,
            name: selectedWarehouse.warehouseName,
            phone: "6282211556273",
            email: "asepsoo@gmail.com",
            address: selectedWarehouse.address,
            latitude: "0",
            longitude: "0"
        }

        const receiver = {
            region_id: userRegionId,
            name: "Dena caknan",
            phone: "6282211556273",
            email: "asepsoo@gmail.com",
            address: "Jl benda barat 10",
            latitude: "0",
            longitude: "0"
        }

        const item = {
            name: "Buku",
            desc: "Baju",
            category: "Pakaian",
            qty: 1,
            value: 100000, 
            weight: 1000, 
            width: 10, 
            height: 10, 
            length: 10 
        }

        let bodyData = {
            courier_code: shipping,
            code_service: service,
            insurance: isInsuranceChecked ? "1" : "0",
            pickup: "0",
            cod: "0",
            shipper, receiver, item
        }

        if (cart?.items) {
            const cartItem = cart?.items[0]
            bodyData.item.value = cartItem.price
            bodyData.item.name = cartItem.productVariant.product.name
        }
        try {
            setTimeout( async () => {
                const res = await fetch('/api/order', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(bodyData)
                });
                const data = await res.json();
                toast.success(data.message);
                setButtonLoading(false)
    
                if (!res.ok) {
                    toast.error('Failed to create order');
                    return null;
                }
            }, 3000);
        } catch (error) {
            throwErr('Failed to create order', error)
        } 
    }, [])

    // fastrac
    useEffect(() => {
        fetchCourier()
    }, [])

    useEffect(() => {
        if (userPostalCode && (!userAddressDetail.subdistrict && !userAddressDetail.district)) {
            fetchLocationByPostalCode(userPostalCode, setUserAddressDetail);
        } 
        if (warehousePostalCode && (!warehouseAddressDetail.subdistrict && !warehouseAddressDetail.district)) {
            fetchLocationByPostalCode(warehousePostalCode, setWarehouseAddressDetail)
        }
    }, [ userPostalCode, warehousePostalCode ])

    useEffect(() => {
        if (userAddressDetail && warehouseAddressDetail) {
            fetchRegionById(userAddressDetail.subdistrict || userAddressDetail.district, setUserRegionId);
            fetchRegionById(warehouseAddressDetail.subdistrict || warehouseAddressDetail.district, setWarehouseRegionId);
        }
    }, [ userAddressDetail, warehouseAddressDetail ])

    // old code base
    useEffect(() => {
        try {
            validate();
            getStock();
            getCart()
            if (cart && cart.items !== undefined) {
                setTotalAmount(cart.items.reduce((acc, item) => acc + item.price, 0));
            }
        } catch (err) {
            setNotFound(true)
        }
        setIsLoading(false);

    }, [validate, getStock, cart, cart?.items, router]);

    useEffect(() => {
        if (shipping !== '') {
            // fetchShipping();

            // fastrac
            fetchCourierService(shipping);
        }
    }, [shipping, service, fetchShipping,])

    useEffect(() => {
        if (stockData.length > 0) {
            const outOfStockItems = stockData.filter((stock: any) => stock.totalStock < stock.orderedQuantity);
            setIsStockSufficient(outOfStockItems.length === 0);
        }
    }, [stockData])

    const handleCheckout = async () => {
        const result = await checkoutOrder(id, shippingCost, totalAmount, warehouseId!, userAddress!, shipping, selectedShipping)
        if (result.message == "Some items are out of stock") {
            toast.error(result.message);
        }
        if (result.redirect_url) {
            router.push(result.redirect_url);
        }
    }

    if (isLoading) {
        return <Loading />
    }

    if (notFound) {
        return <NotFound />
    }

    // ========================================================

    return (
        <section className="mt-8 py-8 px-7 ">
            <div className="text-center">
                <SectionHeaders mainHeader="Cart" />
            </div>
            <div className="mt-8 grid gap-8 md:grid-cols-2">
                <div>
                    <div className="flex flex-col gap-4">
                        {cart && cart.items !== undefined && cart.items.length > 0 ? cart.items.map((item, idx) => (
                            <>
                                <CartItem key={idx} item={item} stockData={stockData} />
                            </>
                        )) : (
                            <div>No products in your shopping cart</div>
                        )}
                    </div>
                    <div className="py-2 pr-16 flex justify-end items-center">
                        <div className="text-gray-500">
                            Subtotal:<br />
                            Delivery:<br />
                            Total:
                        </div>
                        <div className="font-semibold pl-2 text-right">
                            {formatToIDR(totalAmount)}<br />
                            {shippingCost === 0 ? 'Calculating cost' : formatToIDR(shippingCost)}<br />
                            {shippingCost === 0 ? 'Calculating cost' : formatToIDR(totalAmount + shippingCost)}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-4 bg-gray-100 p-4 rounded-lg">
                    <h2>Checkout</h2>
                    <h2>Set Address :</h2>
                    <DropdownAddress setSelectedWarehouse={setSelectedWarehouse} setWarehousePostalCode={setWarehousePostalCode} setUserPostalCode={setUserPostalCode} setUserAddress={setUserAddress} setWarehouseId={setWarehouseId} />
                    <h2>Set Courier :</h2>
                    <DropdownShipping couriers={couriers} shipping={shipping} setShipping={setShipping} warehouseId={warehouseId} />
                    <DropdownShippingServices shipping={shipping} courierService={courierService} shippingServices={shippingService} service={service} setService={setService} calculateShippingCost={calculateShippingCost} fetchShipping={fetchShipping} />
                    <div className="flex items-center space-x-2">
                        <Checkbox id="insurance" checked={isInsuranceChecked} onClick={() => setIsInsuranceChecked(!isInsuranceChecked)} />
                        <label
                            htmlFor="insurance"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Apply Delivery Insurance
                        </label>
                    </div>
                    <LoadingButton disabled={!service || buttonLoading} loading={buttonLoading} onClick={() => handleCreateOrder(shipping, service)} className="rounded-full w-full">
                        Checkout
                    </LoadingButton>
                    {/* <div className={`${!service || !isStockSufficient ? 'hover:cursor-not-allowed' : ''}`}>
                        <Button onClick={handleCheckout} disabled={!service || !isStockSufficient} className='rounded-full w-full' size={"lg"}>
                            {!service ? 'calculating cost' : 'checkout'}
                        </Button>
                    </div> */}
                </div>
            </div>

        </section>
    );
}
