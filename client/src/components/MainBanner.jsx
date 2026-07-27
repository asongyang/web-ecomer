import React, { useState, useEffect, useRef } from 'react';
import { assets } from '../assets/assets';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const MainBanner = () => {
  const { t } = useTranslation();
  const slides = [
    assets.mainbg,
    assets.mainbg1,
    assets.mainbg2,
    assets.mainbg3
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef(null);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(
      () =>
        setCurrentIndex((prevIndex) =>
          prevIndex === slides.length - 1 ? 0 : prevIndex + 1
        ),
      5000 // Change slide every 5 seconds
    );

    return () => {
      resetTimeout();
    };
  }, [currentIndex]);

  const nextSlide = (e) => {
    e.preventDefault();
    setCurrentIndex((prevIndex) =>
      prevIndex === slides.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = (e) => {
    e.preventDefault();
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  };

  const selectSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className='relative group overflow-hidden rounded-[2px] w-full shadow-sm'>
      {/* Dummy image to set height dynamically based on the current slide's natural aspect ratio */}
      <img
        src={slides[currentIndex]}
        alt="dummy-aspect-ratio"
        className='w-full h-auto opacity-0 pointer-events-none'
      />

      {/* Slides (Cross-fade) */}
      {slides.map((slide, index) => (
        <img
          key={index}
          src={slide}
          alt={`banner-${index}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100 z-0' : 'opacity-0 z-0'
            }`}
        />
      ))}

      {/* Subtle overlay gradient to ensure text readability */}
      <div className='absolute inset-0 bg-gradient-to-t from-white/70 via-white/10 to-transparent md:bg-gradient-to-r md:from-white/60 md:via-white/10 md:to-transparent pointer-events-none z-10' />

      {/* Text & Content Overlay */}
      <div className='absolute inset-0 flex flex-col items-center md:items-start justify-end md:justify-center pb-8 md:pb-0 px-6 md:pl-18 lg:pl-24 z-10'>
        <h1 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center md:text-left max-w-72 md:max-w-105 leading-tight lg:leading-snug text-gray-800'>
          {t('home.bannerTitle', 'Freshness You Can Trust, Savings You will Love!')}
        </h1>

        <div className='flex items-center mt-6 font-medium'>
          <Link to="/products" className='group flex items-center gap-2 px-7 md:px-9 py-3 bg-primary hover:bg-primary-dull transition rounded text-white cursor-pointer shadow-sm'>
            {t('home.shopNow', 'Shop now')}
            <img className='md:hidden transition group-focus:translate-x-1' src={assets.white_arrow_icon} alt="arrow" />
          </Link>
          <Link to="/products" className='group hidden md:flex items-center gap-2 px-9 py-3 cursor-pointer hover:text-primary transition duration-300 font-semibold'>
            {t('home.exploreDeals', 'Explore deals')}
            <img className='transition group-hover:translate-x-1' src={assets.black_arrow_icon} alt="arrow" />
          </Link>
        </div>
      </div>

      {/* Left Arrow Control */}
      <button
        onClick={prevSlide}
        className='absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/40 hover:bg-white/80 text-gray-800 transition duration-300 shadow-md backdrop-blur-sm cursor-pointer opacity-0 group-hover:opacity-100 hidden md:block'
        aria-label="Previous Slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* Right Arrow Control */}
      <button
        onClick={nextSlide}
        className='absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/40 hover:bg-white/80 text-gray-800 transition duration-300 shadow-md backdrop-blur-sm cursor-pointer opacity-0 group-hover:opacity-100 hidden md:block'
        aria-label="Next Slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Indicator Dots */}
      <div className='absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2'>
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => selectSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${index === currentIndex ? 'w-6 bg-primary' : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default MainBanner;
