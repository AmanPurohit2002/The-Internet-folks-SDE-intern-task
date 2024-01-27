const { Schema, model,models } = require('mongoose');
const { Snowflake } = require('@theinternetfolks/snowflake');

const memberSchema = new Schema({
    id: {
        type: String,
        default: () => Snowflake.generate().toString(),
        required: true,
        unique: true,
    },
    community: {
        type: String,
        ref: 'Community',
        required: true,
    },
    user: {
        type: String,
        ref: 'User', 
        required: true,
    },
    role: {
        type: String,
        ref: 'Role',
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

const Member = models.Member || model('Member', memberSchema);

module.exports = Member;
