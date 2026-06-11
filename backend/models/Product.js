const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [120, 'Name must be under 120 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: [2000, 'Description must be under 2000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    compareAtPrice: {
        type: Number,
        min: 0,
        default: null
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required']
    },
    size: {
        type: String,
        default: ''
    },
    images: [{
        url: { type: String, required: true },
        alt: { type: String, default: '' },
        isPrimary: { type: Boolean, default: false }
    }],
    stock: {
        type: Number,
        required: true,
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    lowStockThreshold: {
        type: Number,
        default: 5
    },
    status: {
        type: String,
        enum: ['in_stock', 'pre_order', 'sold_out', 'hidden'],
        default: 'in_stock'
    },
    manualStatusOverride: {
        type: Boolean,
        default: false
    },
    views: {
        type: Number,
        default: 0
    },
    totalSold: {
        type: Number,
        default: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    sku: {
        type: String,
        unique: true,
        sparse: true
    },
    badge: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

productSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
    if (!this.manualStatusOverride && !['pre_order', 'hidden'].includes(this.status)) {
        this.status = this.stock <= 0 ? 'sold_out' : 'in_stock';
    }
    next();
});

productSchema.virtual('isLowStock').get(function () {
    return this.stock > 0 && this.stock <= this.lowStockThreshold;
});

productSchema.methods.decrementStock = async function (qty = 1) {
    if (this.stock < qty) throw new Error('Insufficient stock');
    this.stock -= qty;
    this.totalSold += qty;
    if (!this.manualStatusOverride) {
        this.status = this.stock <= 0 ? 'sold_out' : 'in_stock';
    }
    return this.save();
};

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ views: -1 });

module.exports = mongoose.model('Product', productSchema);
