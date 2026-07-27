import React from 'react'
import { useAppContext } from '../context/AppContext'
import { useParams } from 'react-router-dom';
import { categories } from '../assets/assets';
import ProductCard from '../components/ProductCard';
import { useTranslation } from 'react-i18next';




const ProductCategory = () => {
    const { products} = useAppContext();
    const { category} = useParams();
    const { t } = useTranslation();
    const searchCategory = categories.find((item) => item.path.toLowerCase() === category)

    const filteredProducts = products.filter((product) => {
        const catStr = Array.isArray(product.category) ? product.category[0] : product.category;
        return catStr.toLowerCase() === category;
    });


  return (

    <div className='mt-16'>
       { searchCategory && (
         <div className='flex flex-col items-and w-max'>
            <p className='text-2xl  font-medium '> { t(`categoryNames.${searchCategory.path}`, searchCategory.text).toUpperCase()} </p>
            <div className='w-16 h-0.5 bg-primary rounded-full '></div>
         </div> 
       )}
       { filteredProducts.length > 0 ? (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mt-6'>
   
          { filteredProducts.map((product) => (
             <ProductCard key={product._id} product={product} />
          ))}
        </div>
       ): (

        <div className='flex items-center justify-center h-[60vh]'> 
            <p className='text-2xl  font-medium text-primary'> {t('productCategory.noProduct', 'No product found in this category')} </p>
        </div>

       ) }
       
    </div>
  )
}

export default ProductCategory
