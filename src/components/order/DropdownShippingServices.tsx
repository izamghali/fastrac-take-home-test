import { ShippingCost, ShippingCostResponse, ShippingDetail } from '@/constants'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatToIDR } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { CourierService } from '@/app/(home)/checkout/[id]/page';

interface DropdownShippingServicesProps {
    shippingServices: ShippingCost[] | null
    service: string
    setService: (value: string) => void
    fetchShipping: () => Promise<void>;
    calculateShippingCost: () => void;
    courierService: CourierService
    shipping: string
}

export default function DropdownShippingServices({ shipping, courierService, shippingServices, service, setService, fetchShipping, calculateShippingCost }: DropdownShippingServicesProps) {
    const [isFetchShippingCalled, setIsFetchShippingCalled] = useState(false)

    useEffect(() => {
        if (shippingServices && !isFetchShippingCalled) {
            calculateShippingCost();
            setIsFetchShippingCalled(true);
        }
    }, [shippingServices, isFetchShippingCalled, calculateShippingCost]);

    useEffect(() => {
        if (service !== '') {
            fetchShipping().then(() => {
                setIsFetchShippingCalled(false); // Reset flag after fetching
            });
        }
    }, [service, fetchShipping])
    
    return (
        <Select disabled={!shipping} value={service} onValueChange={setService}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Shipping Service" />
            </SelectTrigger>
            <SelectContent>
                {/* fastrac */}
                {courierService.express_delivery ? courierService.express_delivery.map((service, idx: number) => (
                    <SelectItem key={idx} value={service.code_service}>
                        <div className='flex w-[70vh] justify-between'>
                            <p>{service.nama_service}</p>
                            {/* <p>{formatToIDR(service.cost[0].value)}</p> */}
                        </div>
                    </SelectItem>
                ))
                :
                <SelectItem value='no-service'>
                    <div className='flex w-[70vh] justify-between'>
                        <p>No Express service available</p>
                    </div>
                </SelectItem>
                }

                {/* {shippingServices && shippingServices.map((service: ShippingCost) => (
                    <SelectItem key={service.service} value={service.service}>
                        <div className='flex w-[70vh] justify-between'>
                            <p>{service.description}</p>
                            <p>{formatToIDR(service.cost[0].value)}</p>
                        </div>
                    </SelectItem>
                ))} */}
            </SelectContent>
        </Select>
    )
}
