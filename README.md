# Fastrac Take Home Test: Integrating Fastrac B2B API into WearDrobe

## Goals
The goals of this take home test is to implement features using Fastrac API: 
- Create Order (generating Air Waybill)
- Order Tracking
- Webhook Handling

## Development process
- Understand the problem & the goals
- Identify the project needs
- API testing on Postman
- Write code
- Manual testing
- Write documentation

File I worked on:
- `src/app/(home)/checkout/[id]/page.tsx`

### route.js
Because the Fastrac API doesn't allow requests coming from localhost:3000 (which is a good thing), I use [route.js](https://nextjs.org/docs/app/api-reference/file-conventions/route), one of the Next's file convention. It's a route handlers that uses Web [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request) and [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) APIs under the hood. Otherwise the request would return CORS issues.

#### route.js file structure 
app/
│── (dashboard)/
│── ... /
│── api/
│   ├── order/route.ts
│   ├── tariff/
│   ├── courier-service/
│   │   ├── [courier_code]/route.ts

#### route.js implementation

Let's say the code below is a sample taken from ```api/address/region/route.ts```
```
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        ...
        const response = await fetch(`${process.env.NEXT_PUBLIC_FASTRAC_URL}/apiRegion/search-region`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'access-key': accessKey,
                'secret-key': secretKey
            },
            body: JSON.stringify({ search }),
            cache: 'default'
        });
    } catch (error) {
        ...
    }
}
```

On the frontend, I could call it by:
```
const fetchRegionById = useCallback(async (search: string, setState: React.Dispatch<React.SetStateAction<number>>) => {
        try {
            ...
            const res = await fetch(`/api/address/region`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ search })
            })

        } catch (error) {
            ...
        }
    }, [])
```
As you can see, `fetchRegionById` function is `fetch`ing to the directory path `/api/address/region`. The real `fetch`ing happens on the `api/address/region/route.ts` file. This [route.js](https://nextjs.org/docs/app/api-reference/file-conventions/route) acts as a "middleman" between the frontend(React App) and the external API. Instead of calling the external API from the frontend, we make requests to Next.js backend first. 


### `useCallback` hook
`useCallback` memoizes callback function, ensuring that it only changes when its dependencies change. This optimization helps prevent unnecessary re-renders and re-creations of functions in React components.
```
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
```
The function above would have been re-created on every render if it hadn’t been wrapped with `useCallback` hook.

### Caching Strategy
I set `default` value to `cache` property on the `fetch` since it'll look for matching request on the HTTP cache first. 

```
export async function POST(req: NextRequest) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_FASTRAC_URL}/apiTariff/tariffExpress`, {
            ...
            cache: 'default'
        });
        ...
    } catch (error) {
        ...
    }
}
```

If there's a match and fresh, it'll return from the cache. If there's a match but stale, it'll make conditional request, and if the request indicates that there's no change on the resource, it'll be returned from the HTTP cache. Otherwise the resource will be downloaded from the server and the cache will be updated.

### .env
In order to avoid writing a hardcoded API credentials, I took advantage of .env file.

Inside the .env file:
```
NEXT_PUBLIC_FASTRAC_URL=https://api-dev.fastrac.id
NEXT_PUBLIC_FASTRAC_ACCESS_KEY=FastracDev
NEXT_PUBLIC_FASTRAC_SECRET_KEY=Fastrac2024!
```

On another file when to use the credentials:
```
const accessKey = process.env.NEXT_PUBLIC_FASTRAC_ACCESS_KEY;
```
The prefix `NEXT_PUBLIC_` on the environment variables follows Next's convention where it's accessible to client or browser. However, Non-`NEXT_PUBLIC_` environment variables are available for Node.js environemnt. 

## Challenges

### CORS Issue
At first I made a request to the Fastrac API from frontend, it returned CORS issue. I resolved it by implementing `route.js`.

### Delivery Cost
I thought it might be nice to `GET` and display the delivery cost. And in order to get the delivery cost, I thought I could `GET` it from tarif API. And to be able to hit the API, two of the required parameters are `origin` and `destination` which have a `number` type representing `region_id`. Some `region_id` numbers worked, but not when the body is this.

```
{
    "origin": 8271020025,
    "destination": 6202050006,
    "weight": "3",
    "width": "3",
    "height": "3",
    "length": "3"
}
```

Both are a `region_id` from a real address, but somehow returned `404 not found`.

## Takeaways
Because there's an issue for `orderExpress` API, I returned the mock response with `setTimeout` function to replicate as if it's fetching from the real API. And because of that, I haven't been able to write code for Order Tracking feature as well because the `trackingOrder` API is dependent on the `awb` data. 

As for the Webhook Handling, this is my first time I heard about Webhook, and I think I needed more demonstration to understand it. For the order tracking, I already imagine how would I present it. It'll be displayed on a simple table and order status will be updated if there's a change.

On top of that, I believe I wrote many `route.js` files which can be refactored later with dynamic function insde of each files. 

This is the first time I had a take home test that requires me to integrate API to my previous project. I spent so much time understanding the code from my previous team mate. I learn one or two from it, including `useCallback`. 
