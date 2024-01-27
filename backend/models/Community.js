const { Schema, model,models } = require('mongoose');
const { Snowflake } = require('@theinternetfolks/snowflake');

const communitySchema = new Schema({
    id: {
        type: String,
        default: () => Snowflake.generate().toString(),
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        unique: true,
    },
    owner: {
        type: String,
        ref: 'User',
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
});

// Autogenerate the slug from the name before saving
communitySchema.pre('save', function (next) {
    // Ensure that slug is generated or updated on every save
    this.slug = this.name.toLowerCase();
    next();
});

const Community = models.Community || model('Community', communitySchema);

module.exports = Community;
