import React from 'react'
import { motion } from "framer-motion";

const City = [
    {
        image: "/Cities/city1.jpg",
        name: "Varanshi"
    },
    {
        image: "/Cities/city2.jpg",
        name: "Mumbai"
    },
    {
        image: "/Cities/city3.jpg",
        name: "Jodhpur, Rajasthan"
    },
    {
        image: "/Cities/city4.jpg",
        name: "Agra"
    },
    {
        image: "/Cities/city5.jpg",
        name: "Bihar"
    },
]

const Cities = () => {
  return (
    <div className='w-full h-auto bg-white p-5'>
      <p className='px-10 tracking-tight font-semibold text-gray-600'>Find Your Cities</p>

      <div className='grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 items-stretch gap-7 px-8 py-4'>
        {City.map((item, index)=> (
            <motion.div key={item.name + index} 
                initial={{opacity:0, x:-10}}
                whileInView={{opacity: 1, y:0}}
                // viewport={{once:true, amount:0.2}}
                transition={{
                    duration:0.6,
                    delay:index*0.15,
                    ease:"easeOut",
                }}
                className='relative w-70 h-65 overflow-hidden rounded-2xl bg-white shadow-md transition-transform duration-600   hover:-translate-y-1 hover:shadow-xl'
                >
                <img className='w-full h-full object-cover' src={item.image} alt={item.name} />
                <div className='absolute inset-0 h-full p-4'>
                    <p className='text-lg font-semibold text-white mt-50'>{item.name}</p>
                </div>
            </motion.div> 
        ))}
      </div>
    </div>
  )
}

export default Cities
