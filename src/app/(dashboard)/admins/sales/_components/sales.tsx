'use client'
import { getAllSales, getWarehouse } from '@/app/action'
import { StatisticsCard } from '@/app/(dashboard)/_components/statisticsCard'
import { WarehouseDropdown } from '@/app/(dashboard)/_components/warehouseDropdown'
import { Input } from '@/components/ui/input'
import { IProduct, IWarehouse } from '@/constants'
import { getAdminClientSide } from '@/lib/utils'
import React, { useEffect, useState } from 'react'
import { PiMagnifyingGlass } from 'react-icons/pi'
import { DateRange } from "react-day-picker"
import { PiFileArrowDownFill } from "react-icons/pi";
import { DatePickerWithRange } from '../../stocks/_components/datePicker'
import { useDebouncedCallback } from 'use-debounce'
import { SalesPopover } from './salesPopover'
import { SalesTable } from './salesTable'
import ExcelButton from '@/app/(dashboard)/_components/excelButton'
import { downloadSalesToExcel } from '@/lib/xlsx'

const monthFirstDate = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export const SalesReport = () => {  
  const [selectedWH, setSelectedWH] = useState('All Warehouses')
  const [warehouseList, setWarehouseList] = useState<IWarehouse[]>([])
  const [productQty, setProductQty] = useState(0)
  const [salesList, setSalesList] = useState<IProduct[]>([])
  const [gross, setGross] = useState(0)
  const [sold, setSold] = useState(0)
  const [gender, setGender] = useState('All')
  const [type, setType] = useState('All')
  const [category, setCategory] = useState('All')
  const [page, setPage] = useState(1)
  const [isSuper, setIsSuper] = useState(false)
  const [q, setQ] = useState('')
  const [date, setDate] = useState<DateRange | undefined>({
    from: monthFirstDate(),
    to: new Date(),
  })

  const debounced = useDebouncedCallback(
    (value) => {
        setQ(value);
      },
      500
  )

  const getAdmWH = async() => {
    const admin = await getAdminClientSide()
    const warehouse = await getWarehouse(admin.id)
    setWarehouseList(warehouse)
    if (admin.role == 'warAdm') {
      setSelectedWH(warehouse[0].warehouseName)
    } else if (admin.role == 'superAdm') {
      setIsSuper(true)
    }
  }

  const getData = async() => {
    if (date?.from && date?.to && selectedWH) {
      const warehouse = selectedWH == 'All Warehouses'? '' : selectedWH
      const g = gender == "All" ? '' : gender
      const t = type == "All" ? '' : type
      const c = category == "All" ? '' : category
      const filter = {date, g, t, c, q}

      const res = await getAllSales(warehouse, page, 10, filter)
      if (res.status == 'ok') {       
          setProductQty(res.totalSales._count)
          setSalesList(res.SalesList)
          setGross(res.totalSales._sum.price)
          setSold(res.totalSales._sum.quantity)
      }
    }
  }
  
  useEffect(() => {
    getAdmWH()
  }, [])

  useEffect(() => {
    getData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWH, page, date, gender, type, category, q])
  
  return (
    <div>  
      <div className='flex w-full mb-7 flex-col-reverse xl:flex-row'>
        <div className='flex gap-5 md:gap-10 max-md:flex-wrap'>
          <StatisticsCard 
            title='Total Sales'
            number={gross ? (new Intl.NumberFormat('en-DE').format(gross)) : 0}
          />
          <StatisticsCard 
            title='Sold Quantity'
            number={sold ? sold : 0}
          />
        </div>
        <div className='flex flex-col w-full items-end mb-7'>
            <p className='text-xl'>Warehouse</p>
            <WarehouseDropdown 
              isSuper={isSuper}
              warehouseList={[...warehouseList]}
              setSelectedWH={setSelectedWH}
              selectedWH={selectedWH}
            />
        </div>
      </div>

      <div>

      <div className='flex w-full items-center max-sm:gap-2 gap-4 flex-wrap gap-y-5 justify-between'>
          <ExcelButton func={() => downloadSalesToExcel(salesList, selectedWH)}/>

          <div className='flex flex-1 gap-2 max-sm:justify-between justify-end items-center'>
            <Input id='search' type="text" placeholder="Search products" className='w-full sm:max-w-60 min-w-44' onChange={(e) => debounced(e.target.value)}/>
            <DatePickerWithRange date={date} setDate={setDate}/>
            <SalesPopover gender={gender} type={type} category={category} setGender={setGender} setType={setType} setCategory={setCategory}/>
          </div>

        </div>

        <SalesTable
            salesList={salesList}
            page={page}
            productQty={productQty}
            setPage={setPage}
          />
        
      </div>   
    </div>
  )
}
