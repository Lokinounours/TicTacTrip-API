const { Router } = require('express')
const justifyController = require('../controllers/justifyController')
const { requireToken } = require('../middlewares/justifyMiddleware')

const router = Router()

router.post('/token', justifyController.token_post)
router.post('/justify', requireToken, justifyController.justify_post)

module.exports = router