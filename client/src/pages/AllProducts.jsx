import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { useTranslation } from 'react-i18next';

const AllProducts = () => {
    const { t } = useTranslation();

    const { products,searchQuery } = useAppContext();
    const [filteredProducts, setFilteredProducts] = useState([]);


    useEffect(() => {
        if (searchQuery.length > 0) {
            
            setFilteredProducts(products.filter(
                product => product.name.toLowerCase().includes(searchQuery.toLowerCase())))
        }
        else {
            setFilteredProducts(products);
        }

    },[ products, searchQuery ]);


  return (
    <div className='mt-16 flex flex-col '>
      <div className='flex flex-col items-start w-max'>
        <p className='text-2xl font-medium uppercase'> {t('allProducts.title', 'All Products')}</p>
        <div className='w-16 h-0.5 bg-primary rounded-full '></div>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mt-6'>
        {filteredProducts.filter((product) => 
          product.inStock).map((product, index) =>(
            <ProductCard key={index} product={product} />
          ))
        }
      </div>
    </div>
  )
}

export default AllProducts
