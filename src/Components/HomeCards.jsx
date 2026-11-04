import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from "framer-motion";

const Card = [
    {
        set: "For Sale",
        image: "/Homes/home1.jpg",
        name: "Grand Senery",
        location: "Mount Abu, Rajasthan",
        price: "15,00,000",
        amenity: ["3bhk", "Swimming pool", "Garden", "bar"]
    },
    {
        set: "For Sale",
        image: "/Homes/home2.jpg",
        name: "Gold mount",
        location: "Lonavala, mumbai",
        price: "20,00,000",
        amenity: ["4bhk", "Parking", "Garden"]
    },
    {
        set: "For Sale",
        image: "/Homes/home3.jpg",
        name: "Grand Senery",
        location: "Delhi",
        price: "13,40,000",
        amenity: ["3bhk", "Swimming pool", "Garden", "bar"]
    },
    {
        set: "For Sale",
        image: "/Homes/home4.jpg",
        name: "Grand Senery",
        location: "Jaipur, Rajasthan",
        price: "35,00,000",
        amenity: ["3bhk", "Swimming pool", "Garden", "bar"]
    },
    {
        set: "For Sale",
        image: "/Homes/home5.jpg",
        name: "Grand Senery",
        location: "Jodhpur, Rajasthan",
        price: "45,00,000",
        amenity: ["3bhk", "Swimming pool", "Garden", "bar"]
    },
    {
        set: "For Sale",
        image: "/Homes/home6.jpg",
        name: "Grand Senery",
        location: "Mount Abu, Rajasthan",
        price: "40,00,000",
        amenity: ["3bhk", "Swimming pool", "Garden", "bar"]
    },
    {
        set: "For Sale",
        image: "/Homes/home7.jpg",
        name: "Mumbai",
        location: "Mount Abu, Rajasthan",
        price: "65,00,000",
        amenity: ["3bhk", "Swimming pool", "Garden", "bar"]
    },
    {
        set: "For Sale",
        image: "/Homes/home8.jpg",
        name: "Grand Senery",
        location: "Lonavala, mumbai",
        price: "75,50,000",
        amenity: ["3bhk", "Swimming pool", "Garden", "bar"]
    },
]

const HomeCards = () => {
  return (
    <div className='w-full h-screen p-5'>
      <div className='flex items-center justify-between px-13'>
        <h1 className='text-lg font-semibold tracking-tight text-gray-600'>Your Choices</h1>
        <Link className='flex gap-2 text-sm'><span>View All</span> <img className='hover:translate-x-0.5 duaration-300 transition' src="/Icons/arrow-right.svg" alt="right-arrow" /></Link>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-10 py-4'>
        {Card.map((item, index)=>(
            <motion.div key={item.name + index} 
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                // viewport={{ once: true, amount: 0.2 }}
                transition={{
                    duration: 0.6,
                    delay: index * 0.15,
                    ease: "easeOut",
                }}
                className='w-80 h-85 overflow-hidden rounded-2xl bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl'>
                <div className='relative'>
                    <img className='object-cover w-full h-60' src={item.image} alt={item.name} />

                    {/* <div className='absolute inset-0 backdrop-blur-sm'></div> */}

                    <div className='absolute inset-0 p-2 w-full text-right mt-1'>
                        <span className='w-20 rounded-2xl tracking-tight text-gray-700 bg-white/50 px-2 py-1'>{item.set}</span>
                    </div>

                </div>

                <div className='flex items-center justify-between px-1.5 mt-1'>
                    <span className='text-xl tracking-tight font-medium text-gray-800'>{item.name}</span>
                    <p className='flex text-sm font-bold'><img src="/Icons/rupee.svg" alt="Rupee-icon" />{item.price}</p>
                </div>

                <p className='text-sm text-gray-600 px-1.5'>{item.location}</p>

                <div className='flex gap-2 items-center px-1.5 mt-3'>
                    {item.amenity.map((amen)=>(
                        <span key={amen} className="px-2 text-[12px] text-gray-600" >
                            {amen}
                        </span>
                    ))}
                </div>
            </motion.div>
        ))}
      </div>
    </div>
  )
}

export default HomeCards
