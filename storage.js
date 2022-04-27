const router = require('express').Router()
const fs = require('fs')
const { v4 } = require('uuid')
const jwt = require('jsonwebtoken')
const multer = require('multer')

const set_token = (req, res, next) => {
    if (!req.headers['authorization'])
        return res.json('JWT missing')

    var token = req.headers['authorization'].substr(7)
    var cert = fs.readFileSync('public.pem');

    jwt.verify(token, cert, function (err, decoded) {
        if (err)
            return res.json('JWT invalid/expired')
        else {
            req.parsed_token = decoded
            req.user_id = decoded['sub']
            next()
        }
    });
}

const upload_auth = (req, res, next) => {
    req.prefix = 'SA2021'
    req.saved_files = [];
    next();
}

const download_auth = (req, res, next) => {
    const key = req.params[0];
    switch (req.parsed_token['https://hasura.io/jwt/claims']['x-hasura-default-role']) {
        case "user":
            var id_from_key = key.substring(key.lastIndexOf('_') + 1, key.lastIndexOf('.'))
            if (req.user_id.toString() !== id_from_key)
                return res.send('Permission denied')
            next();
            break;
        case "coord":
        case "core":
            next();
            break;
        default:
            return res.send('Permission denied')
    }
}

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public')
    },
    filename(req, file, cb) {
        const filename = file['originalname']
        var extension = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase()
        var key = `${req.prefix}:${v4()}_${req.user_id}.${extension}`
        req.saved_files.push({
            originalname: filename,
            mimetype: file.mimetype,
            encoding: file.encoding,
            file_id: key
        });
        cb(null, key)
    }
})

const upload = multer({
    storage: storage
})

const download = (req, res, next) => {
    const key = req.params[0]
    const filepath = __dirname + '/public/' + key
    res.download(filepath , function(err){
        if(err){
            if(res.headersSent)
                console.log(err)
            else
                return res.json('File not found')
        }
    })
}

router.post('/file', set_token, upload_auth, upload.array('file', 1), (req, res) => {
    res.send(req.saved_files[0]);
})

router.get('/file/*', set_token, download_auth, download)

module.exports = router