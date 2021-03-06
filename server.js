import mongoose from 'mongoose'
import express from 'express'
import bodyParser from 'body-parser'
import bearerToken from 'express-bearer-token'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import aqp from 'api-query-params'
import cors from 'cors'
import { User } from './db/models'
import { checkForRequiredVars } from './utils/vars'
import authentication from './middleware/authentication'

require('dotenv').config()

checkForRequiredVars([
	'PORT',
	'DB_URL',
	'USERS_API',
	'AUTHENTICATION_API',
	'GATEWAY_BASE_URL'
])

const { GATEWAY_BASE_URL, CORS, PORT, DB_URL, USERS_API, AUTHENTICATION_API } = process.env

const app = express()
if (CORS) app.use(cors())

app
	.use(bodyParser.urlencoded({ extended: true }))
	.use(bodyParser.json())
	.use(cookieParser())
	.use(bearerToken())
	.use(authentication(GATEWAY_BASE_URL + AUTHENTICATION_API + '/authorize'))
	.use(morgan('dev'))

app.get(USERS_API, (req, res) => {
	const dbQueryValues = aqp(req.query)
	const { limit, skip, sort, filter, population } = dbQueryValues

	User.find(filter)
		.limit(limit)
		.skip(skip)
		.sort(sort)
		.populate(population)
		.exec((error, query_results) => {
			if (error) return res.status(500).send({ error })
			res.send({ query_results })
		})
})

app.get(`${USERS_API}/:user_id`, (req, res) => {
	User.findById(req.params.user_id, (error, user) => {
		if (error) return res.status(500).send({ error })
		res.send({ user })
	})
})

app.post(USERS_API, (req, res) => {
	const { code, ...newUserData } = req.body

	User.create({ ...newUserData }, (error, new_user) => {
		if (error) return res.status(500).send({ error })

		if (!new_user)
			return res
				.status(500)
				.send({ error: 'Problem Retrieving Newly Created User' })

		res.send({ new_user })
	})
})

app.patch(`${USERS_API}/:user_id`, (req, res) => {
	const { code, ...updatedUserData } = req.body
	User.findByIdAndUpdate(
		req.params.user_id,
		{ ...updatedUserData },
		{ new: true, runValidators: true },
		(error, updated_user) => {
			if (error) return res.status(500).send({ error })

			if (!updated_user)
				return res
					.status(500)
					.send({ error: 'Problem Retrieving Updated User' })

			res.send({ updated_user })
		}
	)
})

app.delete(`${USERS_API}/:user_id`, (req, res) => {
	User.findByIdAndDelete(req.params.user_id, (error, deleted_user) => {
		if (error) return res.status(500).send({ error })

		if (!deleted_user)
			return res.status(500).send({ error: 'Problem Retrieving Deleted User' })

		res.send({ deleted_user })
	})
})

const dbOpts = { useNewUrlParser: true, useUnifiedTopology: true }
mongoose.connect(`${DB_URL}/users-api`, dbOpts, () => {
	app.listen(PORT, () => {
		console.log(`Users API running on PORT ${PORT}!`)
	})
})
