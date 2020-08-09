import mongoose from 'mongoose';

const gradesSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
    validate(value) {
      if (value !== Number && value < 0)
        throw new Error('Não é permitido valor negativo!');
    },
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
});
const gradesModel = mongoose.model('grades', gradesSchema, 'grades');

export { gradesModel };
