const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const bodyParser = require('body-parser')

const storage = require('./storage')

const app = express();

app.use(express.json())
app.use(cors({
    credentials: true,
    origin: true
}))
app.use(morgan('tiny'))
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send('Hi! Welcome to Saarang\'s FileStore')
})
app.use('/v1/', storage);

app.use((err, req, res, next) => {
    if (err) {
        console.log(err)
        return res.status(500).json(err);
    }
})

const port = process.env.PORT || 3010;

app.listen(port, () => {
    console.log('Server running on ', port);
})