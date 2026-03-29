import { syncUserCreation } from "@/inngest/functions"
import prisma from "@/lib/prisma"
import {getAuth} from "@clerk/nextjs/server"
import { format } from "date-fns"
import { transform } from "next/dist/build/swc/generated-native"
import { NextResponse } from "next/server"

// create the store
export async function POST(request) {
    try {
        const {userId} = getAuth(request)
        // Get the data from the form 
        const formData = await request.formData()
        const name = formData.get("name")
        const username = formData.get("username")
        const email = formData.get("email")
        const contact = formData.get("contact")
        const address = formData.get("address")
        const description = formData.get("description")
        const image = formData.get("image")

        if(!name || !username || !email || !contact || !address || !description || !image){
            return nextResponse.json({error: "missing store info"}, {status: 400})
        }

        // check is user have already registered a store
        const store = await prisma.store.findFirst({
            where: {
                userId: userId
            }
        })

        // If store is already registered then send status of store
        if(store){
            return nextResponse.json({status: store.status}, {status: 200})
        }

        // check if username is already taken
        const isUsernameTaken = await prisma.store.findFirst({
            where: {
                username: username.toLowerCase()
            }
        })

        if(isUsernameTaken){
            return nextResponse.json({error: "username already taken"}, {status: 400})
        }

        
        // upload image to imagekit
        const buffer = Buffer.from(await image.arrayBuffer())
        const response = await ImageKit.upload({
            file: buffer,
            fileName: image.name,
            folder: "logos"
        })

        const optimizedImage = ImageKit.url({
            path: response.filePath,
            transformation: [
                { quality: 'auto' },
                { format: 'webp' },
                { width: '512' }
            ]
        })

        const newStore = await prisma.store.create ({
            data: {
                userId,
                name,
                description,
                username: username.toLowerCase(),
                email,
                contact,
                address,
                logo: optimizedImage
            }
        })

        //link store to user.
        await prisma.user.update  ({
            where: { id: userId },
            data: { store: {connect: {id: newStore.id}}}
        })

        return NextResponse.json({message: "applied, waiting for approval"})

    } catch (error) {
        console.log(error);
        return NextResponse.json({error: error.code || error.message}, {status: 400})
    }
}

//Check is user have already registered a store if yes then send status of store

export async function Get(request) {
    try {
        const {userId} = getAuth(request)

        // check is user have already registered a store
        const store = await prisma.store.findFirst({
            where: {
                userId: userId
            }
        })

        // If store is already registered then send status of store
        if(store){
            return nextResponse.json({status: store.status})
        }

        return NextResponse.json({status: "not registered"})

    } catch (error) {
        console.log(error);
        return NextResponse.json({error: error.code || error.message}, {status: 400})        
    }
}
