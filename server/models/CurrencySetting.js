import mongoose from "mongoose";

const currencySettingSchema = new mongoose.Schema({
    THB_LAK: { type: Number, required: true, default: 610 },
    USD_LAK: { type: Number, required: true, default: 22000 },
    USD_THB: { type: Number, required: true, default: 36 }
}, { timestamps: true });

const CurrencySetting = mongoose.models.CurrencySetting || mongoose.model('CurrencySetting', currencySettingSchema);

export default CurrencySetting;
