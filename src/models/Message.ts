import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  job_title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  summary: { type: String, required: true },
  generated_message: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Sent'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
