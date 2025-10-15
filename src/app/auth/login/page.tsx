'use client'

import Image from "next/image"
import banner from './../../../../public/images/banner.jpg';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { userAuthStore } from "@/app/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { protectionSignInActions } from "@/app/actions/auth";


function LoginPage() {

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })

    const { isLoading, error, login } = userAuthStore();
    const router = useRouter();

    const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [event.target.name]: event.target.value
        }))
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const firstLevelOfValidation = await protectionSignInActions(formData.email);
        if (!firstLevelOfValidation.success) {
            toast.error(firstLevelOfValidation.error)
            return;
        }
        const response = await login(formData.email, formData.password);

        if (response) {
            toast.success("User logged in successfully");
            const user = userAuthStore.getState().user;
            if (user?.role === 'admin') {
                router.push('/admin/podcasts/list')
            } else {
                router.push('/home')
            }
        }

        if (error) {
            toast.error(error)
        }

    }
    return <>
        <div className="min-h-screen bg-[#fffefe] flex ">
            <div className="hidden lg:block w-1/2 bg-[#fffefe] relative overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-50 z-10"></div>

                <Image
                    src={banner}
                    alt="Banner Register"
                    fill
                    className="object-cover object-center z-0"
                    priority
                />
            </div>

            <div className="w-full lg:w-1/2 block p-8 lg:p-16 justify-center ">

                <div className="max-w-md mt-[50px] w-full mx-auto ">
                    <div className="flex justify-center">
                        {/* <Image src={logo} alt="logo" width={200} height={50} className="mix-blend-multiply w-full " /> */}
                        <h1 className="font-mono font-bold">Welcome Admin Podcast</h1>

                    </div>
                    <form onSubmit={handleSubmit} className="mt-[50px]  ">
                        <div className="space-y-1">

                            <Label htmlFor="email" className="py-2">Email</Label>
                            <Input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Enter Your Email"
                                required
                                className="bg-[#f1f1f1]"
                                style={{ fontSize: "12px" }}
                                value={formData.email}
                                onChange={handleOnChange}
                            />

                            <Label htmlFor="password" className="py-2">Password</Label>
                            <Input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="Enter Your Password"
                                required
                                className="bg-[#f1f1f1]"
                                style={{ fontSize: "12px" }}
                                value={formData.password}
                                onChange={handleOnChange}
                            />

                        </div>
                        <Button disabled={isLoading} type="submit" className="w-full my-4 bg-black text-white cursor-pointer hover:bg-black transition-colors " >
                            {
                                isLoading ? "Login..." : (
                                    <>
                                        Login
                                        <ArrowRight className="w-4 h-4 text-white" />
                                    </>
                                )
                            }
                        </Button>
                        {/* <p className="text-[#474040]">Don't have an account? <Link href={'/auth/register'} className="text-[#000000] underline font-bold" >Register</Link> </p> */}
                    </form>
                </div>
            </div>
        </div>
    </>
}




export default LoginPage