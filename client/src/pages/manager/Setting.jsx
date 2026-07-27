import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const Setting = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rates, setRates] = useState({
    THB_LAK: 610,    // 1 THB = 610 LAK
    USD_LAK: 22000,  // 1 USD = 22000 LAK
    USD_THB: 36,     // 1 USD = 36 THB
  });

  const [editRates, setEditRates] = useState({ ...rates });

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const { data } = await axios.get('/api/currency');
        if (data.success && data.rates) {
          const { THB_LAK, USD_LAK, USD_THB } = data.rates;
          setRates({ THB_LAK, USD_LAK, USD_THB });
          setEditRates({ THB_LAK, USD_LAK, USD_THB });
        }
      } catch (error) {
        console.error("Error fetching currency rates:", error);
        toast.error(t('manager.fetchRatesError', "Cannot fetch currency rates"));
      }
    };
    fetchRates();
  }, []);

  // New state for interactive converter
  const [fromCurrency, setFromCurrency] = useState('THB');
  const [toCurrency, setToCurrency] = useState('LAK');
  const [amount, setAmount] = useState(1);
  const [isFromDropdownOpen, setIsFromDropdownOpen] = useState(false);
  const [isToDropdownOpen, setIsToDropdownOpen] = useState(false);

  const currencies = {
    THB: { name: 'Thai Baht', flag: 'th.png', code: 'THB' },
    LAK: { name: 'Lao Kip', flag: 'la.png', code: 'LAK' },
    USD: { name: 'US Dollar', flag: 'us.png', code: 'USD' }
  };

  const getExchangeRate = (from, to) => {
    if (from === to) return 1;
    if (from === 'THB' && to === 'LAK') return rates.THB_LAK;
    if (from === 'LAK' && to === 'THB') return 1 / rates.THB_LAK;
    if (from === 'USD' && to === 'LAK') return rates.USD_LAK;
    if (from === 'LAK' && to === 'USD') return 1 / rates.USD_LAK;
    if (from === 'USD' && to === 'THB') return rates.USD_THB;
    if (from === 'THB' && to === 'USD') return 1 / rates.USD_THB;
    return 1;
  };

  const handleOpenModal = () => {
    setEditRates({ ...rates });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveRates = async () => {
    try {
      const { data } = await axios.post('/api/currency', editRates, { withCredentials: true });
      if (data.success) {
        setRates({ ...editRates });
        setIsModalOpen(false);
        toast.success(t('manager.saveRatesSuccess', "Currency rates saved successfully"));
      } else {
        toast.error(data.message || t('manager.saveRatesError', "Error saving rates"));
      }
    } catch (error) {
      console.error("Error saving currency rates:", error);
      toast.error(t('manager.saveRatesError', "Error saving rates"));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditRates(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('manager.currencyConverter', 'Currency Converter')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('manager.currencyInfo', 'Currency Information')}</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="bg-black text-white px-4 py-2 rounded-[30px] font-medium hover:bg-gray-800 transition shadow-md"
        >
          {t('manager.setExchangeRates', 'Set Exchange Rates')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Converter Section */}
        <div className="lg:col-span-2 bg-white rounded-[2px] shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
            <div className="flex-1 w-full bg-white p-6 rounded-[2px] border border-gray-200 shadow-sm relative">
              <div
                className="flex justify-between items-center mb-6 cursor-pointer relative"
                onClick={() => {
                  setIsFromDropdownOpen(!isFromDropdownOpen);
                  setIsToDropdownOpen(false);
                }}
              >
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                  <img src={`https://flagcdn.com/w20/${currencies[fromCurrency].flag}`} alt={fromCurrency} className="w-5 h-auto shadow-sm rounded-[2px]" />
                  {fromCurrency} {currencies[fromCurrency].name}
                </label>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>

                {isFromDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 shadow-lg rounded-lg z-20 py-2">
                    {Object.keys(currencies).map(cur => (
                      <div
                        key={cur}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm font-medium text-gray-700 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFromCurrency(cur);
                          setIsFromDropdownOpen(false);
                        }}
                      >
                        <img src={`https://flagcdn.com/w20/${currencies[cur].flag}`} alt={cur} className="w-5 h-auto shadow-sm rounded-[2px]" />
                        {cur} {currencies[cur].name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full text-4xl font-semibold border-b border-gray-100 pb-4 mb-4 focus:outline-none bg-transparent"
              />
              <div className="flex gap-2">
                {Object.keys(currencies).map(cur => (
                  <button
                    key={cur}
                    onClick={() => setFromCurrency(cur)}
                    className={`px-3 py-1 text-xs font-semibold rounded transition ${fromCurrency === cur ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
                  >
                    {cur}
                  </button>
                ))}
              </div>
            </div>

            <div
              className="bg-gray-50 border border-gray-200 p-3 rounded-full flex-shrink-0 cursor-pointer hover:bg-gray-100 transition shadow-sm z-10 mx-2 md:mx-4"
              onClick={() => {
                const temp = fromCurrency;
                setFromCurrency(toCurrency);
                setToCurrency(temp);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>

            <div className="flex-1 w-full bg-white p-6 rounded-[2px] border border-gray-200 shadow-sm relative">
              <div
                className="flex justify-between items-center mb-6 cursor-pointer relative"
                onClick={() => {
                  setIsToDropdownOpen(!isToDropdownOpen);
                  setIsFromDropdownOpen(false);
                }}
              >
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                  <img src={`https://flagcdn.com/w20/${currencies[toCurrency].flag}`} alt={toCurrency} className="w-5 h-auto shadow-sm rounded-[2px]" />
                  {toCurrency} {currencies[toCurrency].name}
                </label>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>

                {isToDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 shadow-lg rounded-lg z-20 py-2">
                    {Object.keys(currencies).map(cur => (
                      <div
                        key={cur}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm font-medium text-gray-700 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setToCurrency(cur);
                          setIsToDropdownOpen(false);
                        }}
                      >
                        <img src={`https://flagcdn.com/w20/${currencies[cur].flag}`} alt={cur} className="w-5 h-auto shadow-sm rounded-[2px]" />
                        {cur} {currencies[cur].name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <input
                type="text"
                value={(amount * getExchangeRate(fromCurrency, toCurrency)).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 4 })}
                readOnly
                className="w-full text-4xl font-semibold text-green-600 border-b border-gray-100 pb-4 mb-4 focus:outline-none bg-transparent"
              />
              <div className="flex gap-2">
                {Object.keys(currencies).map(cur => (
                  <button
                    key={cur}
                    onClick={() => setToCurrency(cur)}
                    className={`px-3 py-1 text-xs font-semibold rounded transition ${toCurrency === cur ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
                  >
                    {cur}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center border border-gray-200">
            <div>
              <p className="text-xs text-gray-500 mb-1">{t('manager.currentExchangeRate', 'Current Exchange Rate')}</p>
              <p className="text-lg font-medium text-gray-800">1 {fromCurrency} = {getExchangeRate(fromCurrency, toCurrency).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 4 })} {toCurrency}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">MARKUP / SPREAD (%)</p>
              <div className="bg-white border border-gray-200 px-3 py-1 rounded text-sm w-20 text-center ml-auto">0%</div>
            </div>
          </div>
        </div>

        {/* Current Rates List */}
        <div className="bg-white rounded-[2px] shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('manager.currentRatesList', 'Current Rates List')}</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <img src="https://flagcdn.com/w20/us.png" alt="US" className="w-5 h-auto shadow-sm rounded-[2px]" />
                <span className="font-medium">1 USD</span>
              </div>
              <div className="text-right">
                <span className="text-green-600 font-semibold block">{rates.USD_LAK.toLocaleString()} LAK</span>
              </div>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <img src="https://flagcdn.com/w20/th.png" alt="TH" className="w-5 h-auto shadow-sm rounded-[2px]" />
                <span className="font-medium">1 THB</span>
              </div>
              <div className="text-right">
                <span className="text-green-600 font-semibold block">{rates.THB_LAK.toLocaleString()} LAK</span>
              </div>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <img src="https://flagcdn.com/w20/us.png" alt="US" className="w-5 h-auto shadow-sm rounded-[2px]" />
                <span className="font-medium">1 USD</span>
              </div>
              <div className="text-right">
                <span className="text-blue-600 font-semibold block">{rates.USD_THB.toLocaleString()} THB</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm px-4">
          <div className="bg-white rounded-[2px] shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">{t('manager.setExchangeRates', 'Set Exchange Rates')}</h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <img src="https://flagcdn.com/w20/th.png" alt="TH" className="w-5 h-auto shadow-sm rounded-[2px]" />
                  1 THB = ...
                  <img src="https://flagcdn.com/w20/la.png" alt="LA" className="w-5 h-auto shadow-sm rounded-[2px]" />
                  LAK
                </label>
                <input
                  type="text"
                  name="THB_LAK"
                  value={editRates.THB_LAK}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <img src="https://flagcdn.com/w20/us.png" alt="US" className="w-5 h-auto shadow-sm rounded-[2px]" />
                  1 USD = ...
                  <img src="https://flagcdn.com/w20/la.png" alt="LA" className="w-5 h-auto shadow-sm rounded-[2px]" />
                  LAK
                </label>
                <input
                  type="text"
                  name="USD_LAK"
                  value={editRates.USD_LAK}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <img src="https://flagcdn.com/w20/us.png" alt="US" className="w-5 h-auto shadow-sm rounded-[2px]" />
                  1 USD = ...
                  <img src="https://flagcdn.com/w20/th.png" alt="TH" className="w-5 h-auto shadow-sm rounded-[2px]" />
                  THB
                </label>
                <input
                  type="text"
                  name="USD_THB"
                  value={editRates.USD_THB}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                {t('manager.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSaveRates}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
              >
                {t('manager.save', 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Setting;