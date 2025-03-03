'use client'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import { postRequestToken, refreshToken } from "@/lib/fetchRequests"
import { zodResolver } from "@hookform/resolvers/zod"
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { PiArrowRight } from "react-icons/pi"
import { toast } from "sonner"
import { DatePicker } from "../../_components/DatePicker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useParams, useRouter } from "next/navigation"
import { jwtDecode } from "jwt-decode"
import { isTokenExp } from "@/lib/utils"

export default function SetupAdminAccountForm() {

    const [ isLoading, setIsLoading ] = useState(false);
    const [ activeToken, setActiveToken ] = useState<string | string[]>('')
    const params = useParams();
    const router = useRouter();

    const setupAccountSchema = z.object({
        fullName: z.string().trim().min(6, "fullName must at least contain 6 characters").max(30, "maximum 30 characters"),
        password: z.string().min(8, "password must at least contain 8 characters"),
        confirmPassword: z.string().min(8, "password must at least contain 8 characters"),
        dob: z.date({ required_error: "A date of birth is required." }),
        gender: z.string({required_error: "Gender is required"})
    })

    const setupAccountForm = useForm<z.infer<typeof setupAccountSchema>>({
        resolver: zodResolver(setupAccountSchema),
        defaultValues: { fullName: '', password: '', confirmPassword: '' }
    })

    useEffect(() => {
        try {
            const token = params.token.toString();
            const decodedToken : undefined | { exp: number, iat: number, id: string, role: string } = jwtDecode(token);
            const isExp = isTokenExp(token)
            async function requestNewToken() {
                const newToken = await refreshToken(decodedToken?.id)
                setActiveToken(newToken)
            }
    
            if (isExp && decodedToken?.id) {
                requestNewToken() 
            } else setActiveToken(params.token)
            
        } catch (error) {
            router.push('/auth')
        }
    }, [])

    async function handleSetupAccount() {
        setIsLoading(true)
        const { fullName, password, confirmPassword, dob, gender } = setupAccountForm.getValues()
        
        try {
            if (password == confirmPassword && activeToken) {
                const adminData = {
                    fullName: fullName, password: password, dob: dob, gender: gender 
                }
                const res = await postRequestToken(adminData, 'admin/setup-verify-admin', activeToken)
                
                if (res) setIsLoading(false)
                if (res.ok) {
                    toast.success("Account has been successfully setup!")
                    setTimeout(() => { toast("Your account has been verified!", { description: 'redirecting you to login page..' }) }, 3000)
                    setTimeout(() => { router.push('/auth') }, 6000)
                } else if (res.status == 409) {
                    toast.error("Full name has been taken")
                } else if (res.status == 404) {
                    toast.error("User not found")
                } else {
                    toast.error("Verification error", { description: "Please try again later" })
                }
            } else {
                setIsLoading(false)
                toast.error("Password doesn't match")
            }

        } catch (error) {
            toast.warning("Something went wrong", { description: "server might be down" })
        }
    }

    return (
        <div>
            <Form {...setupAccountForm} >
                <form className="flex flex-col gap-4" onSubmit={setupAccountForm.handleSubmit(handleSetupAccount)}>
                    <FormField
                        control={setupAccountForm.control}
                        name="fullName"
                        render={({ field }) => {
                            return (
                                <FormItem>
                                    <FormLabel className="text-black">Full Name</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="@example: John Smith"
                                            type="text"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )
                        }}
                    />
                    <FormField
                        control={setupAccountForm.control}
                        name="password"
                        render={({ field }) => {
                            return (
                                <FormItem>
                                    <FormLabel className="text-black">Password</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="password"
                                            type="password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )
                        }}
                    />
                    <FormField
                        control={setupAccountForm.control}
                        name="confirmPassword"
                        render={({ field }) => {
                            return (
                                <FormItem>
                                    <FormLabel className="text-black">Confirm Password</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="confirm password"
                                            type="password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )
                        }}
                    />
                    <FormField
                        control={setupAccountForm.control}
                        name="gender"
                        render={({ field }) => {
                            return (
                                <FormItem>
                                    <FormLabel className="text-black">Gender</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select your gender" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="MALE">Male</SelectItem>
                                            <SelectItem value="FEMALE">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage/>
                                </FormItem>
                            )
                        }}
                    />
                    <FormField
                        control={setupAccountForm.control}
                        name="dob"
                        render={({ field }) => {
                            return (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="text-black">Date of birth</FormLabel>
                                    <DatePicker field={field} />
                                    <FormMessage />
                                </FormItem>
                            )
                        }}
                    />
                    <LoadingButton loading={isLoading} className="px-10 flex gap-2" type="submit">Save & Verify Account<PiArrowRight /></LoadingButton>
                </form>
            </Form>
        </div>
    )
};