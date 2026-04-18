import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    from_user_id: { type: String, ref: 'User', required: true },
    to_user_id: { type: String, ref: 'User', required: true },
    text: { type: String, trim: true, default: '' },
    message_type: { type: String, enum: ['text', 'image'], required: true, default: 'text' },
    media_url: { type: String, default: '' },
    seen: { type: Boolean, default: false }
}, { timestamps: true, minimize: false });

const Message = mongoose.model('Message', messageSchema);
Message.schema.index({ from_user_id: 1, to_user_id: 1, createdAt: -1 });

export default Message;
