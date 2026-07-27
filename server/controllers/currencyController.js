import CurrencySetting from '../models/CurrencySetting.js';

// @route   GET /api/currency
// @desc    Get currency settings
// @access  Private/Manager
export const getCurrencyRates = async (req, res) => {
    try {
        let settings = await CurrencySetting.findOne();
        if (!settings) {
            settings = await CurrencySetting.create({
                THB_LAK: 610,
                USD_LAK: 22000,
                USD_THB: 36
            });
        }
        res.status(200).json({ success: true, rates: settings });
    } catch (error) {
        console.error("Error in getCurrencyRates:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @route   POST /api/currency
// @desc    Update currency settings
// @access  Private/Manager
export const updateCurrencyRates = async (req, res) => {
    try {
        const { THB_LAK, USD_LAK, USD_THB } = req.body;
        
        let settings = await CurrencySetting.findOne();
        
        if (settings) {
            settings.THB_LAK = THB_LAK || settings.THB_LAK;
            settings.USD_LAK = USD_LAK || settings.USD_LAK;
            settings.USD_THB = USD_THB || settings.USD_THB;
            await settings.save();
        } else {
            settings = await CurrencySetting.create({
                THB_LAK,
                USD_LAK,
                USD_THB
            });
        }
        
        res.status(200).json({ success: true, rates: settings, message: 'Currency settings updated successfully' });
    } catch (error) {
        console.error("Error in updateCurrencyRates:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
