import ProductCard from './ProductCard'
import { useAppContext } from '../context/AppContext'
import { useTranslation } from 'react-i18next'

const BestSeller = () => {
  const { products } = useAppContext()
  const { t } = useTranslation()

  return (
    <div className='mt-16'>
      <p className='text-2xl md:text-3xl font-medium'>{t('home.bestSellers')}</p>
      <div className=' grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4
                gap-3 md:gap-6 lg:grid-cols-5 mt-6 w-full'>
                 {/* grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4
                gap-3 md:gap-6 lg:grid-cols-5 mt-6 w-full */}
        {products
          .filter((product) => product.inStock)
          .map((product, index) => (
            <ProductCard key={index} product={product} />
          ))}
      </div>
    </div>
  )
}

export default BestSeller;
