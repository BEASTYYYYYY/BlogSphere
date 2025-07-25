// models/Setting.js
import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed // Mixed type to allow different data types (string, boolean, number, object, etc.)
    }
}, { timestamps: true });

// Optional: Add a static method to easily get and set settings
settingSchema.statics.getSetting = async function (key) {
    const setting = await this.findOne({ key });
    return setting ? setting.value : null;
};

settingSchema.statics.setSetting = async function (key, value) {
    const setting = await this.findOneAndUpdate(
        { key },
        { value },
        { upsert: true, new: true } // upsert creates if not found, new returns updated document
    );
    return setting.value;
};


export default mongoose.model('Setting', settingSchema);