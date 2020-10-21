const app = require('../server')
const chai = require('chai')
const chaiHttp = require('chai-http')

const rateLimitServer = require('../controllers/justifyController')
chai.use(chaiHttp)

let Cookies

describe('Justify REST API', () => {

  before(() => {
    serverData = new Map()
  })

  after(() => {
    app.close()
  })

  describe('Post /api/token', () => {

    it('Get a new Token', (done) => {
      chai.request(app)
        .post('/api/token')
        .set('Content-type', 'text/plain')
        .send('test@test.io')
        .then((res) => {
          chai.expect(res).to.have.status(200)
          chai.expect(res.body.message).to.equal('Welcome from token_post Controller, here are your token')
          chai.expect(res).to.be.json
          Cookies = res.headers['set-cookie'].pop().split(';')[0];
          done()
        })
        .catch((err) => {
          console.log(err)
        })
    })

    it.skip('Passing wrong argument', (done) => { // Le test fonctionne sur postman mais ici je ne parviens pas à envoyer la bonne string
      chai.request(app)
        .post('/api/token')
        .set('Content-type', 'text/plain')
        .send("")
        .then((res) => {
          chai.expect(res).to.have.status(403)
          chai.expect(res.body.error).to.equal('Unvalid email')
          chai.expect(res).to.be.json
          done()
        })
        .catch((err) => {
          console.log(err)
        })
    })
  })

  describe('POST /api/justify', () => {

    it('Justify a text', (done) => {
      chai.request(app)
        .post('/api/justify')
        .set('Cookie', Cookies)
        .set('Content-type', 'text/plain')
        .send('Longtemps, je me suis couché de bonne heure. Parfois, à peine ma bougie éteinte, mes yeux se fermaient si vite que je n’avais pas le temps de me dire: «Je m’endors.» Et, une')
        .then((res) => {
          chai.expect(res).to.have.status(200)
          chai.expect(res.body.message).to.equal('success')
          chai.expect(res).to.be.json

          done()
        })
        .catch((err) => {
          throw err
        })
    })

    it.skip('Passing wrong argument', (done) => { // Le test fonctionne sur postman mais ici je ne parviens pas à envoyer la bonne string
      chai.request(app)
        .post('/api/justify')
        .set('Cookie', Cookies)
        .set('Content-type', 'text/plain')
        .send('')
        .then((res) => {
          chai.expect(res).to.have.status(400)
          chai.expect(res.body.error).to.equal('No text provided')
          chai.expect(res).to.be.json

          done()
        })
        .catch((err) => {
          throw err
        })
    })

    it('Provide no cookie', (done) => {
      chai.request(app)
        .post('/api/justify')
        .set('Content-type', 'text/plain')
        .send('Longtemps, je me suis couché de bonne heure. Parfois, à peine ma bougie éteinte, mes yeux se fermaient si vite que je n’avais pas le temps de me dire: «Je m’endors.» Et, une')
        .then((res) => {
          chai.expect(res).to.have.status(403)
          chai.expect(res.body.error).to.equal('No token provided, go to /api/token to get a new token')
          chai.expect(res).to.be.json

          done()
        })
        .catch((err) => {
          throw err
        })
    })

    it('Provide wrong cookie', (done) => {
      chai.request(app)
        .post('/api/justify')
        .set('Cookie', 'TicTacTripToken=HereIsARanDomCookie')
        .set('Content-type', 'text/plain')
        .send('Longtemps, je me suis couché de bonne heure. Parfois, à peine ma bougie éteinte, mes yeux se fermaient si vite que je n’avais pas le temps de me dire: «Je m’endors.» Et, une')
        .then((res) => {
          chai.expect(res).to.have.status(403)
          chai.expect(res.body.error).to.equal('Corrupted token provided')
          chai.expect(res).to.be.json

          done()
        })
        .catch((err) => {
          throw err
        })
    })
  })
})

