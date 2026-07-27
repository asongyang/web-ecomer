import React from 'react';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from 'react-i18next';


const ProductCard = ({ product }) => {
    const { currency, addToCart, removeFromCart, cartItems, navigate, convertPrice } = useAppContext();
    const { t } = useTranslation();

    // category can be Array (from MongoDB) or String (from dummyProducts)
    const categorySlug = (Array.isArray(product.category)
        ? product.category[0]
        : product.category
    )?.toLowerCase() ?? 'all';

    return product && (
        <div
            onClick={() => {
                navigate(`/products/${categorySlug}/${product._id}`);
                scrollTo(0, 0);
            }}
            className="border border-gray-500/20 rounded-md md:px-3 px-2 py-2 bg-white w-full cursor-pointer"
        >
            <div className="group flex items-center justify-center px-2">
                <img
                    className="group-hover:scale-105 transition max-w-26 md:max-w-36"
                    src={product.image[0]}
                    alt={product.name}
                />
            </div>
            <div className="text-gray-500/60 text-sm">
                <p>{t(`categoryNames.${(Array.isArray(product.category) ? product.category[0] : product.category).toLowerCase()}`, Array.isArray(product.category) ? product.category[0] : product.category)}</p>
                <p className="text-gray-700 font-medium text-lg truncate w-full">{product.name}</p>
                <div className="flex items-center gap-0.5">
                    {Array(5).fill('').map((_, i) => (
                        <img key={i} className='md:w-3.5 w-3' src={i > 4 ? assets.star_icon : assets.star_dull_icon} alt="" />
                    ))}
                    <p>({4})</p>
                </div>
                <div className="flex items-end justify-between mt-3">
                    <p className="md:text-xl text-base font-medium text-primary">
                        {currency}{convertPrice(product.offerPrice).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}{" "}
                        <span className="text-gray-500/60 md:text-sm text-xs line-through">{currency}{convertPrice(product.price).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                    </p>
                    <div onClick={(e) => { e.stopPropagation(); }} className="text-primary">
                        {!cartItems[product._id] ? (
                            <button
                                className="flex items-center justify-center gap-1 bg-primary/10 border border-primary/40 md:w-[80px] w-[64px] h-[34px] rounded cursor-pointer"
                                onClick={() => addToCart(product._id)}
                            >
                                <img src={assets.cart_icon} alt="cart_icon" />
                                {t('productCard.add', 'Add')}
                            </button>
                        ) : (
                            <div className="flex items-center justify-center gap-2 md:w-20 w-16 h-[34px] bg-primary/25 rounded select-none">
                                <button onClick={() => removeFromCart(product._id)} className="cursor-pointer text-md px-2 h-full">-</button>
                                <span className="w-5 text-center">{cartItems[product._id]}</span>
                                <button onClick={() => addToCart(product._id)} className="cursor-pointer text-md px-2 h-full">+</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;