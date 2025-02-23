import { CourierOption } from "@/app/(home)/checkout/[id]/page";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DropdownShippingProps {
    shipping : string
    setShipping: React.Dispatch<React.SetStateAction<string>>
    warehouseId: string | null
    couriers: CourierOption[]
}

export default function DropdownShipping({shipping, setShipping, warehouseId, couriers} : DropdownShippingProps) {
    const services = [
        { id: '1', value: 'jne' },
        { id: '2', value: 'tiki' },
        { id: '3', value: 'pos' },
    ]
    
    return (
        <Select disabled={!warehouseId} value={shipping} onValueChange={setShipping}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Shipping" />
            </SelectTrigger>
            <SelectContent>
                { couriers &&  couriers.map(courier => (
                    <SelectItem className="cursor-pointer" key={courier.courier_code} value={courier.courier_code}>
                        {courier.courier_name.toUpperCase()}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
