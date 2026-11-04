import React from 'react'
import Navbar from '../Components/Navbar.jsx'
import Hero from '../Components/Hero.jsx'
import HomeCards from '../Components/HomeCards.jsx'
import Cities from '../Components/Cities.jsx'
import Footer from '../Components/Footer.jsx'
import PropertyCategories from '../Components/PropertyCategories.jsx'
import FeaturedProperties from '../Components/FeaturedProperties.jsx'
import WhyChooseUs from '../Components/WhyChooseUs.jsx'
import HowItWorks from '../Components/HowItWorks.jsx'
import PopularLocations from '../Components/PopularLocations.jsx'
import Testimonials from '../Components/Testimonials.jsx'
import HomeCTA from '../Components/HomeCTA.jsx'
import LatestProperties from '../Components/LatestProperties.jsx'

const Home = () => {
  return (
    <div>
      <Navbar/>
      <Hero/>
      <PropertyCategories/> 
      <FeaturedProperties/>
      <WhyChooseUs/>
      <HowItWorks/>
      <PopularLocations/>
      <Testimonials/>
      <HomeCTA/>
      <LatestProperties/>
      {/* <Cities/>
      <HomeCards/> */}
      <Footer/>
    </div>
  )
}

export default Home
