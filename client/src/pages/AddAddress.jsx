import React, { useState } from 'react'
import { assets } from '../assets/assets'

// InputField Component
const InputField = ({ type, placeholder, name, handleChange, address }) => (
  <input
    className='w-full px-2 py-2.5 border border-gray-500/30 rounded outline-none 
               text-gray-500 focus:border-primary transition'
    type={type}
    placeholder={placeholder}
    name={name}
    value={address[name]}
    onChange={handleChange}
    required
  />
)

import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

const AddAddress = () => {
  const { t } = useTranslation()
  const { axios, navigate } = useAppContext()
  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prevAddress) => ({
      ...prevAddress,
      [name]: value
    }))
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/address/add', { address })
      if (data.success) {
        toast.success(data.message)
        navigate('/cart') // Redirect back to cart or checkout
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className='mt-16 pb-16'>
      <p className='text-2xl md:text-3xl text-gray-500'>
        {t('addAddress.addShipping', 'Add Shipping')} <span className='font-semibold text-primary'>{t('addAddress.address', 'Address')}</span>
      </p>

      <div className='flex flex-col-reverse md:flex-row justify-between mt-10'>
        <div className='flex-1 max-w-md'>
          <form onSubmit={onSubmitHandler} className='space-y-3 mt-6 text-sm'>

  <div className='grid grid-cols-2 gap-4'>
    <InputField handleChange={handleChange} address={address}
      name='firstName' type="text" placeholder={t('addAddress.firstName', 'First name')} />

    <InputField handleChange={handleChange} address={address}
      name='lastName' type="text" placeholder={t('addAddress.lastName', 'Last name')} />             
  </div>
   
  <InputField handleChange={handleChange} address={address}
    name='email' type="text" placeholder={t('addAddress.email', 'Email address')} />

  <InputField handleChange={handleChange} address={address}
    name='street' type="text" placeholder={t('addAddress.street', 'Street')} />
  
  <div className='grid grid-cols-2 gap-4'>
    <InputField handleChange={handleChange} address={address}
      name='city' type="text" placeholder={t('addAddress.city', 'City')} />
    
    <InputField handleChange={handleChange} address={address}
      name='state' type="text" placeholder={t('addAddress.state', 'State')} />
  </div>

  <div className='grid grid-cols-2 gap-4'>
    <InputField handleChange={handleChange} address={address}
      name='zipCode' type="number" placeholder={t('addAddress.zipCode', 'Zip code')} />

    <InputField handleChange={handleChange} address={address}
      name='country' type="text" placeholder={t('addAddress.country', 'Country')} />
  </div>

  <InputField handleChange={handleChange} address={address}
    name='phone' type="text" placeholder={t('addAddress.phone', 'Phone')} />

  <button
    type='submit'
    className='w-full mt-6 bg-primary text-white py-3 hover:bg-primary-dull transition cursor-pointer uppercase'
>
    {t('addAddress.saveBtn', 'Save Address')}
  </button>
</form>

        </div>

        <img className='md:mr-16 mb-16 md:mt-0' src={assets.add_address_iamge} alt="Add Address" />
      </div>
    </div>
  )
}

export default AddAddress
