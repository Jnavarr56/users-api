import { Schema, model } from 'mongoose'

const UserSchema = new Schema(
	{
        app_name: {
			type: String,
			required: true            
        },
        display_name: {
			type: String,
			required: true            
        },
        country: {
			type: String,
			required: true            
        },
        email: {
			type: String,
			required: true
        },    
        spotify_id: {
            type: String,
			required: true
        }
	},
	{ timestamps: true }
)

export default model('User', UserSchema, 'User')
