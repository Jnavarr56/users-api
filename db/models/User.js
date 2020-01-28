import { Schema, model } from 'mongoose'

const UserSchema = new Schema(
	{
		country: {
			type: String,
			required: true
		},
		email: {
			type: String,
			required: true
		},
		email_verified: {
			type: Boolean,
			default: false
		},
		spotify_id: {
			type: String,
			required: true
		},
		active: {
			type: Boolean,
			default: true
		}
	},
	{ timestamps: true }
)

export default model('User', UserSchema, 'User')
