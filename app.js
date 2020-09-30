
const request = require('request');
const db = require('quick.db');
const fs = require('fs');

const url = require("url");
const path = require("path");

const Discord = require("discord.js");

var express = require('express');
var app = express();
const moment = require("moment");
require("moment-duration-format");

const passport = require("passport");
const session = require("express-session");
const LevelStore = require("level-session-store")(session);
const Strategy = require("passport-discord").Strategy;

const helmet = require("helmet");

const md = require("marked");

module.exports = (client) => {

const templateDir = path.resolve(`${process.cwd()}${path.sep}html`);

app.use("/css", express.static(path.resolve(`${templateDir}${path.sep}css`)));

passport.serializeUser((user, done) => {
done(null, user);
});
passport.deserializeUser((obj, done) => {
done(null, obj);
});

passport.use(new Strategy({
clientID: client.user.id,
clientSecret: client.ayarlar.oauthSecret,
callbackURL: client.ayarlar.callbackURL,
scope: ["identify","guilds"]
},
(accessToken, refreshToken, profile, done) => {
process.nextTick(() => done(null, profile));
}));

app.use(session({
secret: '123',
resave: true,
saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(helmet());

app.locals.domain = process.env.PROJECT_DOMAIN;

app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ 
extended: true
})); 

function checkAuth(req, res, next) {
if (req.isAuthenticated()) return next();
req.session.backURL = req.url;
res.redirect("/giris");
}

const renderTemplate = (res, req, template, data = {}) => {
const baseData = {
bot: client,
path: req.path,
user: req.isAuthenticated() ? req.user : null
};
res.render(path.resolve(`${templateDir}${path.sep}${template}`), Object.assign(baseData, data));
};

app.get("/giris", (req, res, next) => {
if (req.session.backURL) {
req.session.backURL = req.session.backURL;
} else if (req.headers.referer) {
const parsed = url.parse(req.headers.referer);
if (parsed.hostname === app.locals.domain) {
req.session.backURL = parsed.path;
}
} else {
req.session.backURL = "/";
}
next();
},
passport.authenticate("discord"));

app.get("/baglanti-hatası", (req, res) => {
renderTemplate(res, req, "autherror.ejs");
});

app.get("/callback", passport.authenticate("discord", { failureRedirect: "/autherror" }), async (req, res) => {
if (req.session.backURL) {
const url = req.session.backURL;
req.session.backURL = null;
res.redirect(url);
} else {
res.redirect("/");
}
});

app.get("/cikis", function(req, res) {
req.session.destroy(() => {
req.logout();
res.redirect("/");
});
});

app.get("/", (req, res) => {
renderTemplate(res, req, "index.ejs");
});
    
   
  app.get("/kodgonder/hata", (req, res) => {
 
renderTemplate(res, req, "hata.ejs")
});
  
app.get("/kodgonder/hataa", (req, res) => {
 
renderTemplate(res, req, "hataa.ejs")
});
  
app.get("/kod/hataaa", (req, res) => {
 
renderTemplate(res, req, "hataaa.ejs")
});
  
app.get("/kod/kodistehata", (req, res) => {
 
renderTemplate(res, req, "kodistehata.ejs")
});
  
app.get("/kodlar", (req, res) => {
renderTemplate(res, req, "kodlar.ejs");
});
  
  app.get("/kodgonder", checkAuth , (req, res) => {
renderTemplate(res, req, "kodekle.ejs");
});
  
    app.get("/kodiste", checkAuth , (req, res) => {
renderTemplate(res, req, "kodiste.ejs");
});
  
      app.post("/kodiste" , (req, res) => {
            const guilds = client.guilds.get('706955949277052948')
     const veri =  
  {
    hata: `Sunucuda değilsin kodu istemek için sunucda olman lazım. Davet: https://discord.gg/aM7QgDg`
  }
    if(!guilds.member(req.user.id)) return res.json(veri)
  const embed = new Discord.RichEmbed()
  .setAuthor('Kod isteği')
  .setColor('RANDOM')
  .addField('Kod isteyen' , req.user.username + '#' + req.user.discriminator)
  .addField('İstediği kod', req.body['istedigikod'])
  .addField('Kod Dili' , req.body['koddili'])
  .setTimestamp()
  .setFooter(`${client.user.username} | Kod İstekleri`)
client.channels.get(client.ayarlar.kayıt).send(embed)
res.redirect("/");
});
  
  app.post("/kodgonder", checkAuth , (req, res) => {
        const guilds = client.guilds.get('706955949277052948')
     const veri =  
  {
    hata: `Sunucuda değilsin kodu göndermek için sunucda olman lazım. Davet: https://discord.gg/aM7QgDg`
  }
    if(!guilds.member(req.user.id)) return res.json(veri)
let ayar = req.body
if (ayar === {} || !ayar['kodadı'] || !ayar['kodacik'] || !ayar['koddili']) return res.redirect('/kodgonder/hataa')
let url = Math.floor(Math.random() * 16777214) + 5
let ad = ayar['kodadı']

if (db.has('kodlar')) {
    if (Object.keys(db.fetch('kodlar')).includes(ad) === true) return res.redirect('/kodgonder/hataa')
}

db.set(`kodlar.${ad}.ekleyen` , req.user.username)
db.set(`kodlar.${ad}.kodadı` , req.body['kodadı'])
db.set(`kodlar.${ad}.kodacik`, req.body['kodacik'])
db.set(`kodlar.${ad}.koddili`, req.body['koddili'])

const guild = client.guilds.get('706955949277052948')
var bilgipanel = guild.channels.find('name' , req.body['kodkategori']).id
var kodkanal = guild.createChannel(`${req.body['kodadı']}`, "text").then(kodkanal => {
let role = guild.roles.find(a => a.name === "@everyone");
kodkanal.overwritePermissions(role, {
SEND_MESSAGES: false,
});
client.channels.get(client.ayarlar.kayıt).send(`\`${req.user.username}#${req.user.discriminator}\` Adlı kullanıcı \`${req.body['kodadı']}\` Adlı kodu ekledi. ${kodkanal}`)
kodkanal.send(`https://code-pack-kod-paylasim.glitch.me/kod/${ad}`)
kodkanal.setParent(`📂・${bilgipanel}`) 
})

res.redirect("/");
});
  
  app.get("/kod/:ad" , checkAuth , async (req, res) => {
    const guild = client.guilds.get('706955949277052948')
     const veri =  
  {
    hata: `Sunucuda değilsin kodu görmek için sunucda olman lazım. Davet: https://discord.gg/87Xnmza`
  }
    if(!guild.member(req.user.id)) return res.json(veri)
var ad = req.params.ad

if (db.has('kodlar')) {
    if (Object.keys(db.fetch('kodlar')).includes(ad) === false) return res.redirect('/kod/hataaa')
}
//    db.add(`${req.user.id}_${ad}`)
client.channels.get("707002850168930422").send(`<@${req.user.id}> adlı kullanıcı ${ad} kodunu aldı`)
renderTemplate(res, req, 'kod.ejs', {ad})
});
  
app.get("/kod/:ad/sil", checkAuth, (req, res) => {
  var ad = req.params.ad
  renderTemplate(res, req, "sil.ejs", {ad}) 
});
  
  app.post("/kod/:ad/sil", checkAuth, (req, res) => {
  var ad = req.params.ad
  db.delete(`kodlar.${ad}`)
 res.redirect("/");
});
  
 
app.listen(3000);
      
};