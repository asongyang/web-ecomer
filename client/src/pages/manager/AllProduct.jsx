import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from 'react-i18next';

function AllProduct() {
  const { t } = useTranslation();
  const { products, currency, searchQuery } = useAppContext();

  const filteredProducts = products.filter(product => {
    if (!searchQuery || typeof searchQuery !== 'string') return true;
    return product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           (product.barcode && product.barcode.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-10">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 uppercase inline-block relative pb-2">
          {t('manager.allProducts', 'All Products')}
          <span className="absolute bottom-0 left-0 w-16 h-1 bg-primary"></span>
        </h2>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <p className="text-base">{searchQuery ? t('manager.noProductsFound', "No products found matching your search.") : t('manager.noProductsAvailable', "No products available.")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredProducts.map((product) => (
            <div key={product._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col cursor-pointer">
              {/* Product Image */}
              <div className="p-3 flex items-center justify-center bg-white h-40">
                <img
                  src={product.image?.[0]}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {/* Product Details */}
              <div className="p-3 border-t border-gray-100 flex-1 flex flex-col justify-end">
                <p className="text-xs text-gray-400 mb-1 capitalize">
                  {Array.isArray(product.category) ? product.category[0] : product.category}
                </p>
                <h3 className="font-semibold text-gray-800 text-base line-clamp-2 mb-2">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                  <div className="flex flex-col">
                    {product.offerPrice && product.offerPrice < product.price ? (
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-primary text-base">{currency}{product.offerPrice}</span>
                        <span className="text-[10px] text-gray-400 line-through">{currency}{product.price}</span>
                      </div>
                    ) : (
                      <span className="font-bold text-primary text-base">{currency}{product.price}</span>
                    )}
                  </div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
                    (product.stock ?? 0) > 0 
                      ? 'bg-green-50 text-green-600 border border-green-100' 
                      : 'bg-red-50 text-red-600 border border-red-100'
                  }`}>
                    {t('manager.stock', 'Stock')}: {product.stock ?? 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AllProduct;
