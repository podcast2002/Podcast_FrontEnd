'use client'
import Image from "next/image"
import banner from './../../../../public/images/banner.jpg';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { protectionSignUpActions } from "@/app/actions/auth";
import { toast } from "sonner";
import { userAuthStore } from "@/app/store/useAuthStore";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";


function RegisterPage() {
    const { isLoading, error, register } = userAuthStore();
    const router = useRouter()

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: ''
    });


    const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [event.target.name]: event.target.value
        }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const firstLevelOfValidation = await protectionSignUpActions(formData.email);
        if (!firstLevelOfValidation.success) {
            toast.error(firstLevelOfValidation.error)
            return;
        }
        const userId = await register(formData.email, formData.name, formData.password, formData.phone);

        if (userId) {
            router.push('/auth/login');
            toast.success("User Register Successfully")
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
                <div className="max-w-md w-full mx-auto mt-[50px] ">
                    <div className="flex justify-center">
                        {/* <Image src={logo} alt="logo" width={50} height={50} className="mix-blend-multiply" /> */}
                    </div>
                    <form onSubmit={handleSubmit} className="  ">
                        <div className="space-y-1">
                            <Label htmlFor="name" className="py-2">Full Name</Label>
                            <Input
                                type="text"
                                id="name"
                                name="name"
                                placeholder="Enter Your Name"
                                required
                                className="bg-[#f1f1f1]"
                                style={{ fontSize: "12px" }}
                                value={formData.name}
                                onChange={handleOnChange}
                            />

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

                            <Label htmlFor="phone" className="py-2">Phone</Label>
                            <Input
                                type="text"
                                id="phone"
                                name="phone"
                                placeholder="Enter Your Phone"
                                required
                                className="bg-[#f1f1f1]"
                                style={{ fontSize: "12px" }}
                                value={formData.phone}
                                onChange={handleOnChange}
                            />

                        </div>
                        <Button disabled={isLoading} type="submit" className="w-full my-4 bg-black text-white cursor-pointer hover:bg-black transition-colors " >
                            {isLoading ? "creating..." : (
                                <>
                                    Create Account
                                    <ArrowRight className="w-4 h-4 text-white " />
                                </>
                            )}
                        </Button>
                        <p className="text-[#474040]">Already have an account? <Link href={'/auth/login'} className="text-[#000000] underline font-bold" >Login</Link> </p>
                    </form>
                </div>
            </div>
        </div>
    </>
}

export default RegisterPage