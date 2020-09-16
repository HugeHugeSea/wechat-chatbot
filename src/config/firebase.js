const env = process.env

module.exports = {
    firebase: {
        apiKey: env.API_KEY,
        authDomain: env.AUTH_DOMAIN,
        databaseURL: env.DATABASE_URL,
        privateKey: env.PRIVATE_KEY
    }
}
