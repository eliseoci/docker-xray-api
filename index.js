if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
}

var express = require("express"),
    app = express(),
    bodyParser  = require("body-parser"),
    methodOverride = require("method-override");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());

var router = express.Router();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

router.get('/', function(req, res) {
   res.send("Hello "+req.query.nombre+"!");
});

router.post('/', function (req, res) {

  var Nightmare = require('nightmare');
  var Xray = require('smtx-ray');
  var x = Xray();
  var nightmare = Nightmare();
  var wait = req.body.wait;
  var js = req.body.recipe;


        var a = nightmare.goto(req.body.url)
            .wait()
            .evaluate(function(){
                return document.querySelectorAll('*')[0].innerHTML;
        }, function(value){

            }).run(function (err, nightmare) {
            if (err) return console.log(err);

                var content_to_scrape = (wait !== undefined) ? nightmare : req.body.url;

                if (req.body.paginate!==undefined && req.body.selector!==undefined){
                    if (req.body.limit!==undefined){
                        var limit = req.body.limit;
                    } else {
                        var limit = 3;
                    }
                    var next = false;
                    var data = false;
                    var i = x(content_to_scrape, 'body', [req.body.paginate])
                        .paginate(req.body.paginate).limit(parseInt(limit))(function(err, obj) {
                            if (err) return err;
                            if ( parseInt(obj.length) < parseInt(limit) ){
                                next = false;
                            } else {
                                next = obj.last();
                            }
                            if ( data ){
                                res.json({data:data,next:next});
                            }
                        });
                    var j = x(content_to_scrape, req.body.selector, [js])
                        .paginate(req.body.paginate).limit(parseInt(limit))(function(err, obj) {
                            if ( next ){
                                res.json({data:obj,next:next});
                            } else {
                                data = obj;
                            }
                        });

                } else {
                    if (req.body.url!==undefined) {
                        // Normalize url
                        if (req.body.url.substring(0,2)=='//') req.body.url = 'http:'+req.body.url;
                        var j = x(content_to_scrape, js)(function(err, obj) {
                            if (req.body.regex){
                                if (typeof obj == 'string'){
                                    obj = setRegex(obj,req.body.regex);
                                } else {
                                    if (obj){
                                        Object.keys(obj).forEach(function(k){
                                            obj[k] = setRegex(obj[k],req.body.regex[k]);
                                        });
                                    }
                                }
                            }
                            res.json(obj);
                        });
                    } else {
                        var aUrls = JSON.parse(req.body.urls);
                        var resultados = [];
                        aUrls.forEach(function(url){
                            var j = x(url, js)(function(err, obj) {
                                if (typeof obj == 'string'){
                                    var data = obj.replace(/["|.]/g,'');
                                    if (req.body.regex){
                                        if (arrMatches = data.match(req.body.regex)){
                                            data = arrMatches[1] || arrMatches[0];
                                        } else {
                                            data = 0;
                                        }
                                    }
                                    obj = data
                                    //callback(err,{data:data,id:selRecipe.id});
                                }
                                resultados.push({'url':url,'res':obj});
                                if (resultados.length >= aUrls.length){
                                    res.json(resultados);
                                }
                            });
                        });
                    }
                }
            });

    });


app.use(router);

server = app.listen(8888, function() {
  console.log("Node server running on http://localhost:8888");
});

server.timeout = 600000;

function setRegex(obj,regex){
    if (!regex) return obj;
    var data = obj.replace(/["|.]/g,'');
    if (arrMatches = data.match(regex)){
        data = arrMatches[1] || arrMatches[0];
    } else {
        data = 0;
    }
    return data;
}