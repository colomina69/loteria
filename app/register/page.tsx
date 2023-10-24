"use client"
import { useRouter } from 'next/navigation';
import { comprobar } from './acciones/comprobar';
import { useState } from 'react'
function RegisterPage() {
    const router = useRouter()
    const [message, setMessage] = useState("Compruebe su mobil")

    const handleSummit = async (data: FormData) => {

        const telf = data.get("telf") as string;
        console.log(telf);
        const user = await comprobar(telf)
        if (user) {
            if (user.password) {
                setMessage("Ya eres socio y estas registrado")
                router.push('/api/auth/signin')
            } else {
                setMessage("Ya eres socio")
                router.push('/contra')
            }
        } else {
            setMessage("Todavia no eres socio")
        }
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <form action={handleSummit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="telf">
                        Mobil
                    </label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="telf" name='telf' type="text" placeholder="Mobil" />
                </div>
                <div className="flex justify-center">
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
                        Comprobar
                    </button>
                </div>
                <div className='text-sm text-white bg-red-600'>
                    {message}
                </div>
            </form>
        </div>
    );

}

export default RegisterPage