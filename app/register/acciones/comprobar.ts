"use server";

import { prisma } from "@/libs/prismadb";

export const comprobar = async (telf: string) => {


    const user = await prisma.socios.findFirst({
        where: { telf }
    });
    console.log(user);
    return user;

};