import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Link, useParams } from "react-router-dom";
import { assets } from "../assets/assets";
import ProductCard from "../components/ProductCard";
import { useTranslation } from "react-i18next";


const ProductDetails = () => {

    const { products, navigate,currency, addToCart } = useAppContext();
    const { t } = useTranslation();

    const {id} = useParams();

    const [relatedProducts, setRelatedProducts] = useState( []);
    const [thumbnail, setThumbnail] = useState(null);


    const product = products.find((item) => item._id === id);

    // category can be Array (MongoDB) or String (dummyProducts) — normalise to string
    const categoryStr = product
        ? (Array.isArray(product.category) ? product.category[0] : product.category)
        : '';
    const categorySlug = categoryStr.toLowerCase();

    useEffect(() => {
        if(products.length > 0){
            let productsCopy = products.slice();
            productsCopy = productsCopy.filter((item) => {
                const itemCat = Array.isArray(item.category) ? item.category[0] : item.category;
                return itemCat === categoryStr;
            });
            setRelatedProducts(productsCopy.slice(0, 5));

        } 

    } , [ products]);


    useEffect(() => {
        setThumbnail(product?.image[0] ? product.image[0] : null);
    }, [product])
    
    return product && (
        <div className=" mt-12">
            <p> 
                <Link to={"/"}>{t('productDetails.home', 'Home')}</Link>  /
                <Link to={"/products"}>{t('productDetails.product', 'Product')}</Link> /
                <Link to={`/products/${categorySlug}`}> {t(`categoryNames.${categorySlug}`, categoryStr)} </Link> /
                <span> {t('productDetails.products', 'Products')}</span> /
                <span> {t(`categoryNames.${categorySlug}`, categoryStr)}</span> /
                <span className="text-primary"> {product.name}</span>
            </p>

            <div className="flex flex-col md:flex-row gap-16 mt-4">
                <div className="flex gap-3">
                    <div className="flex flex-col gap-3">
                        {product.image.map((image, index) => (
                            <div key={index} onClick={() => setThumbnail(image)} className="border max-w-24 border-gray-500/30 rounded overflow-hidden cursor-pointer" >
                                <img src={image} alt={`Thumbnail ${index + 1}`} />
                            </div>
                        ))}
                    </div>

                    <div className="border border-gray-500/30 max-w-100 rounded overflow-hidden">
                        <img src={thumbnail} alt="Selected product" />
                    </div>
                </div>

                <div className="text-sm w-full md:w-1/2">
                    <h1 className="text-3xl font-medium">{product.name}</h1>

                    <div className="flex items-center gap-0.5 mt-1">
                        {Array(5).fill('').map((_, i) => (
                                
                            
                                <img src={i<4 ? assets.star_icon :assets.star_dull_icon} alt="" className=" md:w-4 w-3.5" /> 
                          
                        
                       ))} 
                        <p className="text-base ml-2">(4)</p>
                    </div>

                    <div className="mt-6">
                        <p className="text-gray-500/70 line-through">{t('productDetails.mrp', 'MRP:')} {currency }
                        {product.price}</p>
                        <p className="text-2xl font-medium">{t('productDetails.mrp', 'MRP:')} {currency }{product.offerPrice}</p>
                        <span className="text-gray-500/70">{t('productDetails.inclusiveTaxes', '(inclusive of all taxes)')}</span>
                    </div>

                    <p className="text-base font-medium mt-6">{t('productDetails.aboutProduct', 'About Product')}</p>
                    <ul className="list-disc ml-4 text-gray-500/70">
                        {product.description.map((desc, index) => (
                            <li key={index}>{desc}</li>
                        ))}
                    </ul>

                    <div className="flex items-center mt-10 gap-4 text-base">
                        <button onClick={()=> addToCart(product._id)} className="w-full py-3.5 cursor-pointer font-medium bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition" >
                            {t('productDetails.addToCart', 'Add to Cart')}
                        </button>
                       <button onClick={() => navigate("/cart")} className="w-full py-3.5 cursor-pointer font-medium bg-primary text-white hover:bg-primary-dull transition" >
                            {t('productDetails.buyNow', 'Buy now')}
                        </button>
                    </div>
                </div>
            </div>
            {/*  related product */}
              <div className="flex flex-col items-center mt-20">
                <div className="flex flex-col items-center w-max">
                    <p className="text-3xl font-medium"> {t('productDetails.relatedProducts', 'Related Products')}</p>
                    <div className=" w-20 h-0.5 bg-primary rounded-full mt-2"></div>

                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4
                gap-3 md:gap-6 lg:grid-cols-5 mt-6 w-full">
                    {relatedProducts.filter((product)=> product.inStock).map((product, index)=>(
                        <ProductCard key={index} product={product} />
                    ) ) }
                </div>
                <button onClick={()=> {navigate('/products');scrollTo(0,0)}} className="mx-auto cursor-pointer px-12 my-16 py-2.5 border rounded text-primary hover:bg-primary/10 transition"> {t('productDetails.seeMore', 'See more')}</button>
              </div>
        </div>
    );
};
export default ProductDetails;